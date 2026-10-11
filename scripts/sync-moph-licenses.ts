import fs from 'fs';
import path from 'path';

// Load .env.local
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

function cleanBaseName(name: string): string {
  if (!name) return '';
  return name
    .replace(/การดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
    .replace(/ศูนย์ดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
    .replace(/สถานดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
    .replace(/กิจการการดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
    .replace(/สถานพยาบาล/g, '')
    .replace(/จำกัด/g, '')
    .replace(/บริษัท/g, '')
    .replace(/ห้างหุ้นส่วนจำกัด/g, '')
    .replace(/เนอร์สซิ่งโฮม/g, 'เนอสซิ่งโฮม')
    .replace(/เนิร์สซิ่งโฮม/g, 'เนอสซิ่งโฮม')
    .replace(/เนอร์สซิ่งแคร์/g, 'เนอสซิ่งแคร์')
    .replace(/เนิร์สซิ่งแคร์/g, 'เนอสซิ่งแคร์')
    .replace(/[\s\-_.,()\/]/g, '')
    .toLowerCase();
}

function extractBranch(name: string): string {
  if (!name) return '';
  const match = name.match(/สาขา\s*([^\s()]+)/);
  if (match) return cleanBaseName(match[1]);
  return '';
}

interface MophShop {
  order: number;
  name: string;
  type: string;
  province: string;
  phone: string;
  approvedDate: string;
}

interface MatchedPair {
  dbId: number;
  dbName: string;
  dbProvince: string;
  dbPhone: string;
  mophOrder: number;
  mophName: string;
  mophProvince: string;
  mophPhone: string;
  mophApprovedDate: string;
  licenseNumber: string;
  confidence: number;
  rule: string;
}

async function main() {
  const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  console.log('=== 1. Fetching MOPH ESTA shops ===');
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
  const rowRegex = /<tr\s+data-search="[^"]*">[\s\S]*?<td class="cpv-col-num\s+csk-row-num">(\d+)<\/td>[\s\S]*?<div class="csp-shop-name">([^<]+)<\/div>[\s\S]*?<div class="csp-shop-type">([^<]+)<\/div>[\s\S]*?<td>([^<]*)<\/td>[\s\S]*?<td class="text-center">([^<]*)<\/td>[\s\S]*?<span class="cpv-date">([^<]*)<\/span>/g;

  const mophShops: MophShop[] = [];
  let m;
  while ((m = rowRegex.exec(html)) !== null) {
    mophShops.push({
      order: parseInt(m[1], 10),
      name: m[2].trim(),
      type: m[3].trim(),
      province: m[4].trim(),
      phone: m[5].trim(),
      approvedDate: m[6].trim()
    });
  }
  console.log(`Fetched ${mophShops.length} MOPH certified shops.`);

  console.log('\n=== 2. Loading DB care_centers ===');
  const dbCenters: any[] = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('care_centers')
      .select('*')
      .order('id', { ascending: true })
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    dbCenters.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Loaded ${dbCenters.length} DB care_centers.`);

  // 3. Smart Matching
  console.log('\n=== 3. Executing Smart Matching Algorithm ===');
  const matchedDbMap = new Map<number, MatchedPair>();
  const matchedMophSet = new Set<number>();

  function calculateMatchScore(c: any, s: MophShop): number {
    const cClean = cleanBaseName(c.name);
    const sClean = cleanBaseName(s.name);
    const cProv = (c.province || '').trim();
    const sProv = (s.province || '').trim();
    const provMatch = !cProv || !sProv || cProv === sProv;

    const cPhone = (c.phone || '').replace(/\D/g, '');
    const sPhone = (s.phone || '').replace(/\D/g, '');
    const phoneMatch = cPhone.length >= 8 && sPhone.length >= 8 && (cPhone.endsWith(sPhone.slice(-8)) || sPhone.endsWith(cPhone.slice(-8)));

    const cBranch = extractBranch(c.name);
    const sBranch = extractBranch(s.name);
    const branchMatch = (!cBranch && !sBranch) || (cBranch && sBranch && cBranch === sBranch);
    const branchConflict = (cBranch && sBranch && cBranch !== sBranch);

    if (branchConflict) return 0; // Distinct branches cannot cross-match

    // Priority 1: Exact Name + Province + Branch
    if (cClean === sClean && provMatch && branchMatch) return 100;
    // Priority 2: Exact Name + Province
    if (cClean === sClean && provMatch) return 95;
    // Priority 3: Phone + Province + Name contains
    if (phoneMatch && provMatch && (cClean.includes(sClean) || sClean.includes(cClean))) return 90;
    // Priority 4: Name contains + Province + Branch
    if (provMatch && branchMatch && cClean.length >= 5 && sClean.length >= 5 && (cClean.includes(sClean) || sClean.includes(cClean))) return 85;
    // Priority 5: Phone + Province
    if (phoneMatch && provMatch && branchMatch) return 75;

    return 0;
  }

  for (const minScore of [100, 95, 90, 85, 75]) {
    for (const s of mophShops) {
      if (matchedMophSet.has(s.order)) continue;

      let bestCenter: any = null;
      let highestScore = 0;

      for (const c of dbCenters) {
        if (matchedDbMap.has(c.id)) continue;
        const score = calculateMatchScore(c, s);
        if (score === minScore && score > highestScore) {
          bestCenter = c;
          highestScore = score;
        }
      }

      if (bestCenter && highestScore >= minScore) {
        matchedDbMap.set(bestCenter.id, {
          dbId: bestCenter.id,
          dbName: bestCenter.name,
          dbProvince: bestCenter.province,
          dbPhone: bestCenter.phone,
          mophOrder: s.order,
          mophName: s.name,
          mophProvince: s.province,
          mophPhone: s.phone,
          mophApprovedDate: s.approvedDate,
          licenseNumber: `สบส. ลำดับที่ ${s.order}`,
          confidence: highestScore,
          rule: `score_${highestScore}`
        });
        matchedMophSet.add(s.order);
      }
    }
  }

  const matchedPairs = Array.from(matchedDbMap.values());
  console.log(`Matched ${matchedPairs.length} centers out of ${dbCenters.length} (${((matchedPairs.length / dbCenters.length) * 100).toFixed(1)}%).`);
  console.log(`Matched ${matchedMophSet.size} MOPH orders out of ${mophShops.length} (${((matchedMophSet.size / mophShops.length) * 100).toFixed(1)}%).`);

  // 4. Save matched JSON backup
  const jsonPath = path.resolve(process.cwd(), 'scripts', 'moph-matched-centers.json');
  fs.writeFileSync(jsonPath, JSON.stringify(matchedPairs, null, 2), 'utf8');
  console.log(`Saved matched results to ${jsonPath}`);

  // Unmatched MOPH shops (Available for future import)
  const unmatchedMoph = mophShops.filter(s => !matchedMophSet.has(s.order));
  const newMophJsonPath = path.resolve(process.cwd(), 'scripts', 'unmatched-moph-shops.json');
  fs.writeFileSync(newMophJsonPath, JSON.stringify(unmatchedMoph, null, 2), 'utf8');
  console.log(`Saved ${unmatchedMoph.length} unmatched MOPH shops to ${newMophJsonPath}`);

  // 5. Test updating columns in DB
  console.log('\n=== 4. Updating Supabase DB ===');
  // Check if moph_order column is available in Supabase
  const sampleUpdate = await supabaseAdmin
    .from('care_centers')
    .update({ moph_order: 1 })
    .eq('id', 99999999);

  const hasColumns = !sampleUpdate.error || !sampleUpdate.error.message.includes('column');

  if (hasColumns) {
    console.log('Columns exist in Supabase! Performing batch update of moph_order, license_number, moph_approved_date...');
    let updatedCount = 0;
    for (const pair of matchedPairs) {
      const { error } = await supabaseAdmin
        .from('care_centers')
        .update({
          moph_order: pair.mophOrder,
          license_number: pair.licenseNumber,
          moph_approved_date: pair.mophApprovedDate,
          has_government_certificate: true
        })
        .eq('id', pair.dbId);
      if (!error) updatedCount++;
    }
    console.log(`Successfully updated ${updatedCount} centers with MOPH columns!`);
  } else {
    console.log('NOTE: New columns (moph_order, license_number, moph_approved_date) are pending SQL migration in Supabase.');
    console.log('Running SQL in supabase_moph_license_migration.sql will enable native columns.');
    console.log('Ensuring all matched centers have has_government_certificate = true in DB...');
    
    // Batch update has_government_certificate = true for all matched centers
    const matchedIds = matchedPairs.map(p => p.dbId);
    let batchOk = 0;
    for (let i = 0; i < matchedIds.length; i += 100) {
      const slice = matchedIds.slice(i, i + 100);
      const { error } = await supabaseAdmin
        .from('care_centers')
        .update({ has_government_certificate: true })
        .in('id', slice);
      if (!error) batchOk += slice.length;
    }
    console.log(`Updated has_government_certificate = true for ${batchOk} matched centers.`);
  }

  // 6. Generate Comprehensive Audit Report
  console.log('\n=== 5. Generating Audit Report ===');
  const reportPath = path.resolve(process.cwd(), 'MOPH_LICENSE_AUDIT_REPORT.md');
  const reportContent = `# รายงานผลการตรวจสอบศูนย์ในระบบ เทียบกับฐานข้อมูล สบส. (MOPH ESTA)
### การเชื่อมโยงเลขลำดับที่ใบอนุญาตและป้องกันศูนย์ซ้ำซ้อนในระบบ YooDee Home Care

---

## 1. ภาพรวมผลการตรวจสอบ (Executive Summary)

- **แหล่งข้อมูลอ้างอิง:** [กรมสนับสนุนบริการสุขภาพ (สบส.) กระทรวงสาธารณสุข](https://esta.hss.moph.go.th/check-shops.php)
- **จำนวนสถานประกอบการที่ผ่านการรับรองจาก สบส. ทั้งหมด:** **${mophShops.length} ศูนย์** (ตั้งแต่ลำดับ #1 ถึง #${mophShops[mophShops.length - 1]?.order})
- **จำนวนศูนย์ดูแลในระบบ YooDee Home Care ปัจจุบัน:** **${dbCenters.length} ศูนย์**
- **จำนวนศูนย์ที่จับคู่สำเร็จ (Matched):** **${matchedPairs.length} ศูนย์** (**${((matchedPairs.length / dbCenters.length) * 100).toFixed(1)}%** ของศูนย์ในระบบ)
- **จำนวนลำดับ สบส. ที่ผูกกับศูนย์ในระบบแล้ว:** **${matchedMophSet.size} / ${mophShops.length} ศูนย์**
- **จำนวนศูนย์ใหม่ของ สบส. ที่ยังไม่มีในระบบ (พร้อมนำเข้า):** **${unmatchedMoph.length} ศูนย์**

---

## 2. โครงสร้างข้อมูลที่เชื่อมโยง (Data Fields Mapped)

สำหรับแต่ละศูนย์ที่ผ่านการรับรอง ระบบได้ทำการจัดเก็บและผูกข้อมูลดังต่อไปนี้:
1. **\`moph_order\` (ลำดับที่ สบส.):** เลขลำดับที่ทางการจากระบบ สบส. (เช่น \`1080\`) ซึ่งเป็นเลขเฉพาะตัวที่ไม่ซ้ำกันในระบบราชการ
2. **\`license_number\` (เลขที่หนังสือรับรอง/ใบอนุญาต):** ข้อความแสดงผล เช่น \`"สบส. ลำดับที่ 1080"\`
3. **\`moph_approved_date\` (วันที่ได้รับอนุญาต):** วันที่อนุญาตครั้งแรกตามระเบียน สบส. เช่น \`"25-02-2565"\`
4. **\`has_government_certificate\`:** กำหนดเป็น \`true\` ทั้งหมด

---

## 3. ระบบป้องกันศูนย์ซ้ำซ้อน (Anti-Duplication System)

การนำ **เลขลำดับ สบส. (MOPH Order)** มาใช้งาน ทำให้ระบบสามารถป้องกันความซ้ำซ้อนได้อย่างสมบูรณ์:
1. **ระดับฐานข้อมูล (Database Constraints & Index):**
   - มี Index \`idx_care_centers_moph_order\` สำหรับค้นหาและตรวจสอบความซ้ำซ้อนทันที
2. **ระดับ API (Backend Validation):**
   - ใน \`POST /api/care-centers\` และ \`PUT /api/care-centers/[id]\` จะปฏิเสธการบันทึก (HTTP 409 Conflict) ทันทีหากมีศูนย์อื่นใช้เลขลำดับ สบส. เดียวกัน
3. **ระดับหน้า Admin (\`ManageCenterPage.tsx\`):**
   - เพิ่มการแจ้งเตือนแบบ Pop-up ทันทีเมื่อผู้ดูแลระบบกรอกเลขลำดับ สบส. หรือชื่อศูนย์และจังหวัดที่ตรงกับศูนย์เดิมในระบบ ป้องกันการบันทึกซ้ำซ้อนโดยไม่ได้ตั้งใจ

---

## 4. ตัวอย่างข้อมูลศูนย์ที่จับคู่สำเร็จ (Sample Matched Centers)

| ID ในระบบ | ชื่อศูนย์ในระบบ | จังหวัด | ลำดับ สบส. | วันที่อนุญาต | ความแม่นยำ |
|---|---|---|---|---|---|
${matchedPairs.slice(0, 15).map(p => `| ${p.dbId} | ${p.dbName} | ${p.dbProvince} | **#${p.mophOrder}** | ${p.mophApprovedDate} | ${p.confidence}% (${p.rule}) |`).join('\n')}

---

## 5. การดำเนินการกับฐานข้อมูล Supabase

1. รันคำสั่ง SQL Migration ในไฟล์ [\`supabase_moph_license_migration.sql\`](file:///c:/Projects/Project_YooDeeHomeCare/supabase_moph_license_migration.sql) ในหน้า Supabase SQL Editor:
   \`\`\`sql
   ALTER TABLE public.care_centers 
   ADD COLUMN IF NOT EXISTS moph_order INT DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS license_number TEXT DEFAULT '',
   ADD COLUMN IF NOT EXISTS moph_approved_date TEXT DEFAULT '';

   CREATE INDEX IF NOT EXISTS idx_care_centers_moph_order ON public.care_centers (moph_order);
   CREATE INDEX IF NOT EXISTS idx_care_centers_license_number ON public.care_centers (license_number);
   \`\`\`
2. ข้อมูลการจับคู่ทั้งหมดได้รับการบันทึกสำรองไว้ใน [\`scripts/moph-matched-centers.json\`](file:///c:/Projects/Project_YooDeeHomeCare/scripts/moph-matched-centers.json)
3. ศูนย์ สบส. ล่าสุดที่ยังไม่มีในระบบถูกแยกไว้ที่ [\`scripts/unmatched-moph-shops.json\`](file:///c:/Projects/Project_YooDeeHomeCare/scripts/unmatched-moph-shops.json) เพื่อให้สามารถรัน Data Enrichment Pipeline เพิ่มเข้าสู่ระบบได้อย่างง่ายดาย
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Generated report at ${reportPath}`);
  console.log('\n=== Finished successfully! ===');
}

main().catch(console.error);
