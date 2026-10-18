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

async function inspectBkk() {
    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const provinces = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม'];

    const { data: centers, error } = await supabaseAdmin
        .from('care_centers')
        .select('id, name, province, address, price, packages, room_types, description')
        .or(provinces.map(p => `province.ilike.%${p}%,address.ilike.%${p}%`).join(','));

    if (error) {
        console.error('Error fetching centers:', error);
        return;
    }

    let withRooms = 0;
    let withoutRooms = 0;

    for (const c of centers || []) {
        const rt = c.room_types;
        if (Array.isArray(rt) && rt.length > 0) {
            withRooms++;
        } else {
            withoutRooms++;
        }
    }

    console.log(`=== ผลการสำรวจข้อมูลศูนย์ดูแล กรุงเทพฯ และปริมณฑล ===`);
    console.log(`จำนวนศูนย์ทั้งหมดในกรุงเทพฯ และปริมณฑล: ${centers?.length || 0} แห่ง`);
    console.log(`- ศูนย์ที่มีข้อมูลประเภทห้องพัก (room_types) แล้ว: ${withRooms} แห่ง`);
    console.log(`- ศูนย์ที่ยังไม่มีข้อมูลประเภทห้องพัก: ${withoutRooms} แห่ง`);

    // ดูตัวอย่างศูนย์ที่มี packages (สามารถดึงมาสร้าง room_types ได้)
    const withPackages = (centers || []).filter(c => Array.isArray(c.packages) && c.packages.length > 0 && (!Array.isArray(c.room_types) || c.room_types.length === 0));
    console.log(`- ศูนย์ที่ยังไม่มี room_types แต่มีข้อมูล packages (ราคา/รายละเอียดแพ็กเกจ): ${withPackages.length} แห่ง`);
}

inspectBkk().catch(console.error);
