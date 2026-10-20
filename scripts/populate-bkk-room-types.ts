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

interface RoomType {
    name: string;
    imageUrls: string[];
    status: string;
    description?: string;
    facilities?: string[];
}

const DEFAULT_SHARED_ROOM: RoomType = {
    name: "ห้องพักรวม",
    status: "เตียงว่างพร้อมดูแลทันที",
    imageUrls: [],
    facilities: ["เตียงผู้ป่วยปรับระดับ", "กริ่งเรียกพยาบาลฉุกเฉิน", "เครื่องปรับอากาศ", "กล้องวงจรปิดดูแล 24 ชม."],
    description: "ผู้สูงอายุที่ชอบสังคม ไม่ชอบอยู่คนเดียว หรือต้องการประหยัดค่าใช้จ่าย แต่ได้รับการดูแลมาตรฐานครบถ้วนตลอด 24 ชั่วโมง"
};

const DEFAULT_SINGLE_ROOM: RoomType = {
    name: "ห้องพักเดี่ยว",
    status: "เตียงว่างพร้อมดูแลทันที",
    imageUrls: [],
    facilities: ["เตียงปรับระดับไฟฟ้า", "ห้องน้ำส่วนตัว", "กริ่งเรียกพยาบาลฉุกเฉิน", "เครื่องปรับอากาศ", "สมาร์ททีวี", "กล้องวงจรปิดดูแล 24 ชม."],
    description: "ผู้ที่ต้องการความเป็นส่วนตัวสูง สงบเงียบ ญาติเข้าเยี่ยมสะดวก พร้อมการบริบาลเฉพาะบุคคลอย่างใกล้ชิด"
};

function generateRoomTypes(center: any): RoomType[] {
    // 1. ถ้ามี packages แปลงจาก packages มาเป็นประเภทห้องพัก
    if (Array.isArray(center.packages) && center.packages.length > 0) {
        const rooms: RoomType[] = [];
        for (const pkg of center.packages) {
            const name = (pkg.name || '').trim();
            if (!name) continue;

            const isSingle = name.includes('เดี่ยว') || name.toLowerCase().includes('single') || name.toLowerCase().includes('private') || name.toLowerCase().includes('vip');
            const isShared = name.includes('รวม') || name.toLowerCase().includes('shared') || name.includes('เตียง');

            let desc = '';
            if (Array.isArray(pkg.details) && pkg.details.length > 0) {
                desc = pkg.details.join(' • ');
            } else if (isSingle) {
                desc = DEFAULT_SINGLE_ROOM.description!;
            } else if (isShared) {
                desc = DEFAULT_SHARED_ROOM.description!;
            } else {
                desc = "เหมาะสำหรับผู้ต้องการการดูแลระดับมาตรฐาน พร้อมสิ่งอำนวยความสะดวกครบครัน";
            }

            rooms.push({
                name: name,
                status: "เตียงว่างพร้อมดูแลทันที",
                imageUrls: [],
                facilities: isSingle ? DEFAULT_SINGLE_ROOM.facilities : DEFAULT_SHARED_ROOM.facilities,
                description: desc
            });
        }

        if (rooms.length > 0) return rooms;
    }

    // 2. หากไม่มี packages ให้ใส่ประเภทห้องมาตรฐาน 2 ประเภท (ห้องพักรวม และ ห้องพักเดี่ยว)
    return [
        { ...DEFAULT_SHARED_ROOM },
        { ...DEFAULT_SINGLE_ROOM }
    ];
}

async function populateBkkRoomTypes() {
    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const provinces = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม'];

    console.log('🔍 ค้นหาศูนย์ดูแลในกรุงเทพฯ และปริมณฑล...');
    const { data: centers, error } = await supabaseAdmin
        .from('care_centers')
        .select('id, name, province, address, packages, room_types')
        .or(provinces.map(p => `province.ilike.%${p}%,address.ilike.%${p}%`).join(','));

    if (error) {
        console.error('❌ Error fetching centers:', error);
        return;
    }

    console.log(`พบศูนย์ในพื้นที่ทั้งหมด: ${centers?.length || 0} แห่ง`);

    // คัดเฉพาะศูนย์ที่ยังไม่มี room_types
    const targetCenters = (centers || []).filter(c => !Array.isArray(c.room_types) || c.room_types.length === 0);
    console.log(`ศูนย์ที่ต้องเพิ่มประเภทห้องพัก: ${targetCenters.length} แห่ง`);

    let updatedCount = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < targetCenters.length; i += BATCH_SIZE) {
        const batch = targetCenters.slice(i, i + BATCH_SIZE);
        await Promise.all(
            batch.map(async (c) => {
                const roomTypes = generateRoomTypes(c);
                const { error: updateErr } = await supabaseAdmin
                    .from('care_centers')
                    .update({ room_types: roomTypes })
                    .eq('id', c.id);

                if (updateErr) {
                    console.error(`❌ ผิดพลาด ID ${c.id} (${c.name}):`, updateErr.message);
                } else {
                    updatedCount++;
                }
            })
        );
        process.stdout.write(`⏳ ดำเนินการแล้ว: ${updatedCount} / ${targetCenters.length} แห่ง\r`);
    }

    console.log(`\n✅ บันทึกประเภทห้องพักสำเร็จทั้งหมด: ${updatedCount} แห่ง!`);
}

populateBkkRoomTypes().catch(console.error);
