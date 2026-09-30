import fs from 'fs';
import path from 'path';

try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        });
    }
} catch (e) {
    console.warn(e);
}

function cleanName(name: string): string {
    return name
        .replace(/การดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/ศูนย์ดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/สถานดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/กิจการการดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/จำกัด/g, '')
        .replace(/บริษัท/g, '')
        .replace(/ห้างหุ้นส่วนจำกัด/g, '')
        .replace(/เนอร์สซิ่งโฮม/g, 'เนอสซิ่งโฮม')
        .replace(/เนิร์สซิ่งโฮม/g, 'เนอสซิ่งโฮม')
        .replace(/เนอร์สซิ่งแคร์/g, 'เนอสซิ่งแคร์')
        .replace(/เนิร์สซิ่งแคร์/g, 'เนอสซิ่งแคร์')
        .replace(/\s+/g, '')
        .toLowerCase();
}

async function main() {
    const { supabaseAdmin } = await import('../src/lib/supabase');

    console.log('1. Loading all DB care centers...');
    const allDbCenters: any[] = [];
    let page = 0;
    while (true) {
        const { data, error } = await supabaseAdmin
            .from('care_centers')
            .select('id, name, phone, province, status, has_government_certificate')
            .range(page * 1000, (page + 1) * 1000 - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allDbCenters.push(...data);
        if (data.length < 1000) break;
        page++;
    }
    console.log(`Loaded ${allDbCenters.length} DB centers.`);

    console.log('2. Fetching MOPH ESTA shops...');
    const formData = new FormData();
    formData.append('shopLoad', '1');
    const res = await fetch('https://esta.hss.moph.go.th/load-check-shops.php', {
        method: 'POST',
        body: formData,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://esta.hss.moph.go.th/check-shops.php'
        }
    });
    const html = await res.text();
    const rowRegex = /<tr\s+data-search="([^"]*)">[\s\S]*?<div class="csp-shop-name">([^<]+)<\/div>[\s\S]*?<div class="csp-shop-type">([^<]+)<\/div>[\s\S]*?<td>([^<]*)<\/td>[\s\S]*?<td class="text-center">([^<]*)<\/td>[\s\S]*?<span class="cpv-date">([^<]*)<\/span>/g;

    const mophShops: any[] = [];
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        mophShops.push({
            name: match[2].trim(),
            type: match[3].trim(),
            province: match[4].trim(),
            phone: match[5].trim(),
            approvedDate: match[6].trim()
        });
    }
    console.log(`Fetched ${mophShops.length} MOPH certified centers.`);

    const dbMapByCleanName = new Map<string, any>();
    const dbMapByPhone = new Map<string, any>();
    for (const c of allDbCenters) {
        dbMapByCleanName.set(cleanName(c.name), c);
        if (c.phone) {
            const cleanP = c.phone.replace(/\D/g, '');
            if (cleanP.length >= 9) dbMapByPhone.set(cleanP, c);
        }
    }

    const matchedDbIds = new Set<number>();
    const newShops: any[] = [];

    for (const m of mophShops) {
        const cleanMName = cleanName(m.name);
        const cleanMPhone = m.phone.replace(/\D/g, '');
        let found = dbMapByCleanName.get(cleanMName);
        if (!found && cleanMPhone.length >= 9) {
            found = dbMapByPhone.get(cleanMPhone);
        }
        if (!found) {
            for (const c of allDbCenters) {
                const cClean = cleanName(c.name);
                if (cClean.length > 5 && (cleanMName.includes(cClean) || cClean.includes(cleanMName))) {
                    if (!c.province || !m.province || c.province === m.province) {
                        found = c;
                        break;
                    }
                }
            }
        }
        if (found) {
            matchedDbIds.add(found.id);
        } else {
            // Check if already in newShops to avoid duplicates in MOPH list
            const alreadyInNew = newShops.some(s => cleanName(s.name) === cleanMName);
            if (!alreadyInNew) {
                newShops.push(m);
            }
        }
    }

    console.log(`\nMatched unique existing DB centers: ${matchedDbIds.size}`);
    console.log(`New unique centers to add: ${newShops.length}`);

    // Update has_government_certificate = true for matched centers in batches
    console.log('\n3. Updating has_government_certificate = true for all matched DB centers...');
    const matchedIdList = Array.from(matchedDbIds);
    let updatedCount = 0;
    const batchSize = 100;
    for (let i = 0; i < matchedIdList.length; i += batchSize) {
        const chunk = matchedIdList.slice(i, i + batchSize);
        const { error } = await supabaseAdmin
            .from('care_centers')
            .update({ has_government_certificate: true })
            .in('id', chunk);
        if (error) {
            console.error(`Error updating batch ${i}:`, error.message);
        } else {
            updatedCount += chunk.length;
            process.stdout.write(`   ✓ Updated ${updatedCount} / ${matchedIdList.length}\r`);
        }
    }
    console.log(`\n✅ Finished updating ${updatedCount} existing centers to has_government_certificate = true.`);

    // Save new shops to json
    const outPath = path.resolve(process.cwd(), 'scripts', 'new-moph-centers.json');
    fs.writeFileSync(outPath, JSON.stringify(newShops, null, 2), 'utf8');
    console.log(`\n💾 Saved ${newShops.length} new centers to: ${outPath}`);
}

main().catch(console.error);
