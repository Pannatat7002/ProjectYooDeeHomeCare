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
    console.warn('Could not read .env.local:', e);
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
    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    console.log('1. Fetching all care_centers from Supabase...');
    const allDbCenters: any[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
        const { data, error } = await supabaseAdmin
            .from('care_centers')
            .select('id, name, phone, province, status, has_government_certificate, address, lat, lng')
            .range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allDbCenters.push(...data);
        if (data.length < pageSize) break;
        page++;
    }
    console.log(`Loaded ${allDbCenters.length} centers from DB.`);

    console.log('2. Fetching MOPH ESTA shops...');
    const formData = new FormData();
    formData.append('shopLoad', '1');
    const res = await fetch('https://esta.hss.moph.go.th/load-check-shops.php', {
        method: 'POST',
        body: formData,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://esta.hss.moph.go.th/check-shops.php'
        }
    });

    const html = await res.text();
    const rowRegex = /<tr\s+data-search="([^"]*)">[\s\S]*?<div class="csp-shop-name">([^<]+)<\/div>[\s\S]*?<div class="csp-shop-type">([^<]+)<\/div>[\s\S]*?<td>([^<]*)<\/td>[\s\S]*?<td class="text-center">([^<]*)<\/td>[\s\S]*?<span class="cpv-date">([^<]*)<\/span>/g;

    const mophShops: Array<{
        name: string;
        type: string;
        province: string;
        phone: string;
        approvedDate: string;
    }> = [];

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
    console.log(`Parsed ${mophShops.length} MOPH shops.`);

    // 3. Match
    const matchedInDb: any[] = [];
    const notInDb: any[] = [];

    // Map DB centers for fast lookup
    const dbMapByCleanName = new Map<string, any>();
    const dbMapByPhone = new Map<string, any>();

    for (const c of allDbCenters) {
        dbMapByCleanName.set(cleanName(c.name), c);
        if (c.phone) {
            const cleanP = c.phone.replace(/\D/g, '');
            if (cleanP.length >= 9) {
                dbMapByPhone.set(cleanP, c);
            }
        }
    }

    for (const m of mophShops) {
        const cleanMName = cleanName(m.name);
        const cleanMPhone = m.phone.replace(/\D/g, '');

        let found = dbMapByCleanName.get(cleanMName);
        if (!found && cleanMPhone.length >= 9) {
            found = dbMapByPhone.get(cleanMPhone);
        }

        // Partial match check
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
            matchedInDb.push({ moph: m, db: found });
        } else {
            notInDb.push(m);
        }
    }

    console.log(`\n================ Comparison Results ================`);
    console.log(`Total MOPH certified centers: ${mophShops.length}`);
    console.log(`Already in DB (matched): ${matchedInDb.length}`);
    console.log(`NOT yet in DB (need to add): ${notInDb.length}`);
    console.log(`====================================================\n`);

    if (notInDb.length > 0) {
        console.log('Sample of NEW centers to be added:');
        console.log(notInDb.slice(0, 5));
    }
}

main().catch(console.error);
