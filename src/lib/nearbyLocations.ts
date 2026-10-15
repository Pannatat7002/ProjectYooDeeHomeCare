import { CareCenter } from '../types';
import { calculateHaversineDistance } from './hospitalProximity';
import { TRANSIT_STATIONS } from './transitStations';

export interface NearbyZone {
    id: string;
    name: string; // ชื่อหลักภาษาไทย เช่น "ลาซาล"
    aliases: string[]; // คำค้นหาที่เกี่ยวข้อง
    province: string;
    lat: number;
    lng: number;
    nearbyAreas: string[]; // ย่านใกล้เคียง เช่น ["บางนา", "แบริ่ง", "อุดมสุข"]
}

/**
 * ฐานข้อมูลย่าน / ทำเลสำคัญ และทำเลข้างเคียงที่เชื่อมโยงกัน
 * ครอบคลุมกรุงเทพฯ ปริมณฑล และหัวเมืองหลัก
 */
export const NEARBY_ZONES: NearbyZone[] = [
    // --- โซนสุขุมวิทตอนปลาย / บางนา / สมุทรปราการ ---
    {
        id: 'lasalle',
        name: 'ลาซาล',
        aliases: ['ลาซาล', 'ลาซาน', 'lasalle', 'lasal', 'สุขุมวิท 105', 'สุขุมวิท105', 'ศรีลาซาล'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6600,
        lng: 100.6250,
        nearbyAreas: ['บางนา', 'แบริ่ง', 'อุดมสุข', 'ศรีนครินทร์', 'สำโรง'],
    },
    {
        id: 'bearing',
        name: 'แบริ่ง',
        aliases: ['แบริ่ง', 'แบริ่ง', 'bearing', 'สุขุมวิท 107', 'สุขุมวิท107', 'ศรีแบริ่ง'],
        province: 'สมุทรปราการ',
        lat: 13.6550,
        lng: 100.6050,
        nearbyAreas: ['ลาซาล', 'บางนา', 'สำโรง', 'ด่านสำโรง', 'อุดมสุข'],
    },
    {
        id: 'bangna',
        name: 'บางนา',
        aliases: ['บางนา', 'bangna', 'bang na', 'บางนาตราด', 'บางนา-ตราด', 'สรรพาวุธ', 'อุดมสุข'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6680,
        lng: 100.6050,
        nearbyAreas: ['ลาซาล', 'แบริ่ง', 'อุดมสุข', 'บางพลี', 'กิ่งแก้ว', 'ศรีนครินทร์', 'สำโรง'],
    },
    {
        id: 'udomsuk',
        name: 'อุดมสุข',
        aliases: ['อุดมสุข', 'udomsuk', 'udom suk', 'สุขุมวิท 103', 'สุขุมวิท103'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6800,
        lng: 100.6100,
        nearbyAreas: ['บางนา', 'ปุณณวิถี', 'ลาซาล', 'อ่อนนุช', 'สวนหลวง', 'ศรีนครินทร์'],
    },
    {
        id: 'onnut',
        name: 'อ่อนนุช',
        aliases: ['อ่อนนุช', 'onnut', 'on nut', 'สุขุมวิท 77', 'สุขุมวิท77'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7050,
        lng: 100.6010,
        nearbyAreas: ['พระโขนง', 'อุดมสุข', 'พัฒนาการ', 'สวนหลวง', 'ศรีนครินทร์', 'ประเวศ'],
    },
    {
        id: 'samrong',
        name: 'สำโรง',
        aliases: ['สำโรง', 'samrong', 'ด่านสำโรง', 'สำโรงเหนือ'],
        province: 'สมุทรปราการ',
        lat: 13.6470,
        lng: 100.5960,
        nearbyAreas: ['แบริ่ง', 'ลาซาล', 'บางนา', 'เมืองสมุทรปราการ', 'เทพารักษ์'],
    },
    {
        id: 'srinagarindra',
        name: 'ศรีนครินทร์',
        aliases: ['ศรีนครินทร์', 'srinagarindra', 'srinakarin', 'ซีคอน'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6930,
        lng: 100.6470,
        nearbyAreas: ['บางนา', 'อุดมสุข', 'สวนหลวง', 'พัฒนาการ', 'ลาซาล', 'ประเวศ'],
    },
    {
        id: 'bangphli',
        name: 'บางพลี',
        aliases: ['บางพลี', 'bangphli', 'bang phli', 'กิ่งแก้ว', 'เมกาบางนา', 'บางพลีใหญ่'],
        province: 'สมุทรปราการ',
        lat: 13.6050,
        lng: 100.7100,
        nearbyAreas: ['บางนา', 'กิ่งแก้ว', 'เทพารักษ์', 'บางบ่อ', 'สมุทรปราการ'],
    },

    // --- โซนลาดพร้าว / รัชดา / รามคำแหง ---
    {
        id: 'ladprao',
        name: 'ลาดพร้าว',
        aliases: ['ลาดพร้าว', 'ladprao', 'lat phrao', 'latprao'],
        province: 'กรุงเทพมหานคร',
        lat: 13.8060,
        lng: 100.5740,
        nearbyAreas: ['โชคชัย 4', 'วังทองหลาง', 'บางกะปิ', 'รัชดา', 'พหลโยธิน', 'รามคำแหง'],
    },
    {
        id: 'chokchai4',
        name: 'โชคชัย 4',
        aliases: ['โชคชัย 4', 'โชคชัย4', 'chokchai 4', 'นาคนิวาส', 'ลาดพร้าววังหิน'],
        province: 'กรุงเทพมหานคร',
        lat: 13.8050,
        lng: 100.5980,
        nearbyAreas: ['ลาดพร้าว', 'วังทองหลาง', 'เสนานิคม', 'เกษตร-นวมินทร์', 'เลียบด่วนรามอินทรา'],
    },
    {
        id: 'ratchada',
        name: 'รัชดา',
        aliases: ['รัชดา', 'รัชดาภิเษก', 'ratchada', 'ratchadapisek'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7890,
        lng: 100.5740,
        nearbyAreas: ['ห้วยขวาง', 'สุทธิสาร', 'ดินแดง', 'พระราม 9', 'ลาดพร้าว'],
    },
    {
        id: 'huaikhwang',
        name: 'ห้วยขวาง',
        aliases: ['ห้วยขวาง', 'huaikhwang', 'huai khwang', 'เหม่งจ๋าย'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7780,
        lng: 100.5760,
        nearbyAreas: ['รัชดา', 'สุทธิสาร', 'ดินแดง', 'พระราม 9', 'วังทองหลาง'],
    },
    {
        id: 'rama9',
        name: 'พระราม 9',
        aliases: ['พระราม 9', 'พระราม9', 'rama 9', 'rama9'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7550,
        lng: 100.5670,
        nearbyAreas: ['รัชดา', 'ห้วยขวาง', 'รามคำแหง', 'คลองตัน', 'พัฒนาการ', 'ดินแดง'],
    },
    {
        id: 'ramkhamhaeng',
        name: 'รามคำแหง',
        aliases: ['รามคำแหง', 'ramkhamhaeng', 'หัวหมาก', 'ลำสาลี'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7600,
        lng: 100.6200,
        nearbyAreas: ['บางกะปิ', 'หัวหมาก', 'พัฒนาการ', 'พระราม 9', 'ลำสาลี', 'คลองตัน'],
    },
    {
        id: 'bangkapi',
        name: 'บางกะปิ',
        aliases: ['บางกะปิ', 'bangkapi', 'bang kapi', 'นวมินทร์', 'เสรีไทย'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7660,
        lng: 100.6450,
        nearbyAreas: ['รามคำแหง', 'ลาดพร้าว', 'ลำสาลี', 'นวมินทร์', 'เสรีไทย', 'บึงกุ่ม'],
    },
    {
        id: 'ramintra',
        name: 'รามอินทรา',
        aliases: ['รามอินทรา', 'ramintra', 'ram intra', 'คู้บอน'],
        province: 'กรุงเทพมหานคร',
        lat: 13.8580,
        lng: 100.6650,
        nearbyAreas: ['วัชรพล', 'มีนบุรี', 'คันนายาว', 'นวลจันทร์', 'บางเขน', 'สายไหม'],
    },
    {
        id: 'watcharapol',
        name: 'วัชรพล',
        aliases: ['วัชรพล', 'watcharapol', 'สุขาภิบาล 5', 'เพิ่มสิน'],
        province: 'กรุงเทพมหานคร',
        lat: 13.8750,
        lng: 100.6500,
        nearbyAreas: ['รามอินทรา', 'สายไหม', 'สุขาภิบาล 5', 'บางเขน', 'ดอนเมือง'],
    },

    // --- โซนหลักสี่ / ดอนเมือง / แจ้งวัฒนะ / นนทบุรี ---
    {
        id: 'chaengwatthana',
        name: 'แจ้งวัฒนะ',
        aliases: ['แจ้งวัฒนะ', 'chaengwatthana', 'chaeng watthana', 'เมืองทอง', 'เมืองทองธานี'],
        province: 'นนทบุรี',
        lat: 13.9050,
        lng: 100.5350,
        nearbyAreas: ['ปากเกร็ด', 'หลักสี่', 'เมืองทองธานี', 'งามวงศ์วาน', 'ติวานนท์', 'ดอนเมือง'],
    },
    {
        id: 'pakkret',
        name: 'ปากเกร็ด',
        aliases: ['ปากเกร็ด', 'pakkret', 'pak kret', 'ติวานนท์'],
        province: 'นนทบุรี',
        lat: 13.9130,
        lng: 100.4980,
        nearbyAreas: ['แจ้งวัฒนะ', 'เมืองทองธานี', 'ติวานนท์', 'ราชพฤกษ์', 'บางบัวทอง', 'เมืองนนทบุรี'],
    },
    {
        id: 'donmueang',
        name: 'ดอนเมือง',
        aliases: ['ดอนเมือง', 'donmueang', 'don mueang', 'สรงประภา'],
        province: 'กรุงเทพมหานคร',
        lat: 13.9130,
        lng: 100.5980,
        nearbyAreas: ['หลักสี่', 'สายไหม', 'รังสิต', 'สรงประภา', 'วิภาวดี'],
    },
    {
        id: 'laksi',
        name: 'หลักสี่',
        aliases: ['หลักสี่', 'laksi', 'lak si', 'ประชาชื่น'],
        province: 'กรุงเทพมหานคร',
        lat: 13.8870,
        lng: 100.5820,
        nearbyAreas: ['ดอนเมือง', 'แจ้งวัฒนะ', 'บางเขน', 'งามวงศ์วาน', 'ประชาชื่น'],
    },
    {
        id: 'ngamwongwan',
        name: 'งามวงศ์วาน',
        aliases: ['งามวงศ์วาน', 'ngamwongwan', 'พงษ์เพชร', 'แคราย'],
        province: 'นนทบุรี',
        lat: 13.8600,
        lng: 100.5300,
        nearbyAreas: ['แคราย', 'ประชาชื่น', 'พงษ์เพชร', 'บางเขน', 'รัตนาธิเบศร์', 'แจ้งวัฒนะ'],
    },
    {
        id: 'rattanathibet',
        name: 'รัตนาธิเบศร์',
        aliases: ['รัตนาธิเบศร์', 'rattanathibet', 'พระนั่งเกล้า', 'ไทรม้า', 'ท่าอิฐ'],
        province: 'นนทบุรี',
        lat: 13.8630,
        lng: 100.4850,
        nearbyAreas: ['แคราย', 'บางบัวทอง', 'ไทรม้า', 'ท่าอิฐ', 'พระนั่งเกล้า', 'งามวงศ์วาน'],
    },
    {
        id: 'bangbuathong',
        name: 'บางบัวทอง',
        aliases: ['บางบัวทอง', 'bangbuathong', 'บางใหญ่', 'bangyai', 'ไทรน้อย'],
        province: 'นนทบุรี',
        lat: 13.9150,
        lng: 100.4200,
        nearbyAreas: ['บางใหญ่', 'รัตนาธิเบศร์', 'กาญจนาภิเษก', 'ราชพฤกษ์', 'ปากเกร็ด'],
    },
    {
        id: 'rangsit',
        name: 'รังสิต',
        aliases: ['รังสิต', 'rangsit', 'ฟิวเจอร์พาร์ค', 'คลองหลวง', 'ธัญบุรี', 'ลำลูกกา'],
        province: 'ปทุมธานี',
        lat: 13.9850,
        lng: 100.6150,
        nearbyAreas: ['คลองหลวง', 'ธัญบุรี', 'ลำลูกกา', 'ดอนเมือง', 'สายไหม'],
    },

    // --- โซนฝั่งธนบุรี / ปิ่นเกล้า / ราชพฤกษ์ / เพชรเกษม ---
    {
        id: 'pinklao',
        name: 'ปิ่นเกล้า',
        aliases: ['ปิ่นเกล้า', 'pinklao', 'pin klao', 'บรมราชชนนี'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7780,
        lng: 100.4750,
        nearbyAreas: ['บางกอกน้อย', 'บางพลัด', 'ตลิ่งชัน', 'จรัญสนิทวงศ์', 'ศิริราช'],
    },
    {
        id: 'charansanitwong',
        name: 'จรัญสนิทวงศ์',
        aliases: ['จรัญสนิทวงศ์', 'จรัญ', 'charan', 'บางขุนนนท์', 'ท่าพระ'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7650,
        lng: 100.4780,
        nearbyAreas: ['ปิ่นเกล้า', 'บางขุนนนท์', 'ท่าพระ', 'บางพลัด', 'ศิริราช', 'ตลิ่งชัน'],
    },
    {
        id: 'ratchaphruek',
        name: 'ราชพฤกษ์',
        aliases: ['ราชพฤกษ์', 'ratchaphruek', 'นครอินทร์'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7850,
        lng: 100.4450,
        nearbyAreas: ['ตลิ่งชัน', 'บางกรวย', 'นครอินทร์', 'บางหว้า', 'ปิ่นเกล้า', 'บางใหญ่'],
    },
    {
        id: 'bangkae',
        name: 'บางแค',
        aliases: ['บางแค', 'bangkae', 'bang khae', 'เพชรเกษม', 'ภาษีเจริญ'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7120,
        lng: 100.4050,
        nearbyAreas: ['ภาษีเจริญ', 'เพชรเกษม', 'หนองแขม', 'พุทธมณฑลสาย 2', 'กัลปพฤกษ์', 'บางหว้า'],
    },
    {
        id: 'phutthamonthon',
        name: 'พุทธมณฑล',
        aliases: ['พุทธมณฑล', 'phutthamonthon', 'ศาลายา', 'ทวีวัฒนา'],
        province: 'นครปฐม',
        lat: 13.7950,
        lng: 100.3250,
        nearbyAreas: ['ศาลายา', 'ทวีวัฒนา', 'บางแค', 'นครชัยศรี', 'ตลิ่งชัน'],
    },
    {
        id: 'rama2',
        name: 'พระราม 2',
        aliases: ['พระราม 2', 'พระราม2', 'rama 2', 'rama2', 'บางขุนเทียน', 'ท่าข้าม'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6650,
        lng: 100.4450,
        nearbyAreas: ['บางขุนเทียน', 'จอมทอง', 'บางบอน', 'ท่าข้าม', 'สุขสวัสดิ์'],
    },
    {
        id: 'suksawat',
        name: 'สุขสวัสดิ์',
        aliases: ['สุขสวัสดิ์', 'suksawat', 'ราษฎร์บูรณะ', 'ทุ่งครุ', 'ประชาอุทิศ', 'พระประแดง'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6700,
        lng: 100.5050,
        nearbyAreas: ['ราษฎร์บูรณะ', 'ทุ่งครุ', 'ประชาอุทิศ', 'พระประแดง', 'พระราม 2', 'พระราม 3'],
    },
    {
        id: 'rama3',
        name: 'พระราม 3',
        aliases: ['พระราม 3', 'พระราม3', 'rama 3', 'rama3', 'สาธุประดิษฐ์', 'ยานนาวา'],
        province: 'กรุงเทพมหานคร',
        lat: 13.6950,
        lng: 100.5350,
        nearbyAreas: ['ยานนาวา', 'สาธุประดิษฐ์', 'คลองเตย', 'บางคอแหลม', 'เจริญกรุง', 'สาทร'],
    },
    {
        id: 'sathon',
        name: 'สาทร',
        aliases: ['สาทร', 'sathon', 'sathorn', 'สีลม', 'silom'],
        province: 'กรุงเทพมหานคร',
        lat: 13.7200,
        lng: 100.5300,
        nearbyAreas: ['สีลม', 'บางรัก', 'ยานนาวา', 'พระราม 3', 'คลองเตย', 'เจริญกรุง'],
    },

    // --- หัวเมืองต่างจังหวัดยอดนิยม ---
    {
        id: 'chiangmai-city',
        name: 'เมืองเชียงใหม่',
        aliases: ['เชียงใหม่', 'chiangmai', 'นิมมาน', 'ช้างเผือก', 'สุเทพ'],
        province: 'เชียงใหม่',
        lat: 18.7880,
        lng: 98.9850,
        nearbyAreas: ['นิมมาน', 'ช้างเผือก', 'สุเทพ', 'แม่เหียะ', 'สันทราย', 'หางดง', 'สารภี'],
    },
    {
        id: 'pattaya',
        name: 'พัทยา',
        aliases: ['พัทยา', 'pattaya', 'บางละมุง', 'จอมเทียน', 'นาเกลือ'],
        province: 'ชลบุรี',
        lat: 12.9270,
        lng: 100.8770,
        nearbyAreas: ['บางละมุง', 'นาเกลือ', 'จอมเทียน', 'หนองปรือ', 'สัตหีบ'],
    },
    {
        id: 'sriracha',
        name: 'ศรีราชา',
        aliases: ['ศรีราชา', 'sriracha', 'แหลมฉบัง', 'บางพระ'],
        province: 'ชลบุรี',
        lat: 13.1730,
        lng: 100.9300,
        nearbyAreas: ['เมืองชลบุรี', 'บางแสน', 'แหลมฉบัง', 'พัทยา', 'บางพระ'],
    },
];

/**
 * ตรวจสอบคำค้นหาว่าตรงกับย่านใดในฐานข้อมูลหรือไม่
 */
export function findNearbyZoneInfo(query: string): NearbyZone | null {
    if (!query || !query.trim()) return null;
    const raw = query.toLowerCase().trim();
    const norm = raw.replace(/\s+/g, '');

    for (const zone of NEARBY_ZONES) {
        for (const alias of zone.aliases) {
            const normAlias = alias.toLowerCase().replace(/\s+/g, '');
            if (norm.includes(normAlias) || normAlias.includes(norm)) {
                return zone;
            }
        }
    }

    // หากไม่พบในโซน ลองเทียบกับรายชื่อสถานีรถไฟฟ้า BTS / MRT
    const matchedStation = TRANSIT_STATIONS.find(s => {
        const normName = s.nameTh.toLowerCase().replace(/\s+/g, '');
        return norm.includes(normName) || normName.includes(norm);
    });

    if (matchedStation) {
        // หาย่านที่ใกล้สถานีนี้มากที่สุด
        let closestZone: NearbyZone | null = null;
        let minDistance = Infinity;

        for (const zone of NEARBY_ZONES) {
            const dist = calculateHaversineDistance(matchedStation.lat, matchedStation.lng, zone.lat, zone.lng);
            if (dist < minDistance && dist <= 8) {
                minDistance = dist;
                closestZone = zone;
            }
        }

        if (closestZone) {
            return {
                ...closestZone,
                name: matchedStation.nameTh,
                lat: matchedStation.lat,
                lng: matchedStation.lng,
            };
        }
    }

    return null;
}

export interface NearbySearchResult {
    nearbyCenters: (CareCenter & {
        nearbyAreaName?: string;
        distanceKm?: number;
        referenceLocation?: { lat: number; lng: number };
    })[];
    nearbyKeywords: string[];
    matchedZoneName: string | null;
}

/**
 * ค้นหาศูนย์ดูแลแนะนำในทำเลใกล้เคียง (เช่น ค้นหา ลาซาล -> แนะนำ บางนา แบริ่ง อุดมสุข)
 * ใช้วิธีผสมผสานระหว่าง:
 * 1) การจับคู่ย่านและพื้นที่ข้างเคียง (Area Association)
 * 2) การคำนวณระยะทางจริงจากพิกัด (Haversine Geo-distance 5-10 กม.)
 */
export function findNearbyCareCentersForSearch(
    searchQuery: string,
    directMatches: CareCenter[],
    allCenters: CareCenter[],
    maxResults: number = 6
): NearbySearchResult {
    if (!searchQuery || !searchQuery.trim()) {
        return { nearbyCenters: [], nearbyKeywords: [], matchedZoneName: null };
    }

    const query = searchQuery.trim();
    const zoneInfo = findNearbyZoneInfo(query);

    // เก็บ ID ของศูนย์ที่แสดงในผลการค้นหาหลักแล้ว เพื่อป้องกันการแสดงซ้ำ
    const directMatchIds = new Set(directMatches.map(c => c.id));

    // พิกัดอ้างอิงของตำแหน่งที่ค้นหา
    let refCoords: { lat: number; lng: number } | null = null;
    let nearbyKeywords: string[] = [];
    let matchedZoneName: string | null = null;

    if (zoneInfo) {
        matchedZoneName = zoneInfo.name;
        nearbyKeywords = [...zoneInfo.nearbyAreas];
        refCoords = { lat: zoneInfo.lat, lng: zoneInfo.lng };
    } else {
        // หากค้นหาคำที่ไม่มีใน ZONE ลองดูว่าใน directMatches มีพิกัดหรือไม่
        const coordsList = directMatches
            .filter(c => c.lat && c.lng && Number(c.lat) !== 0 && Number(c.lng) !== 0)
            .map(c => ({ lat: Number(c.lat), lng: Number(c.lng) }));

        if (coordsList.length > 0) {
            // คำนวณจุดกึ่งกลาง (Centroid) ของศูนย์ที่พบ
            const avgLat = coordsList.reduce((acc, cur) => acc + cur.lat, 0) / coordsList.length;
            const avgLng = coordsList.reduce((acc, cur) => acc + cur.lng, 0) / coordsList.length;
            refCoords = { lat: avgLat, lng: avgLng };

            // หาย่านที่ใกล้พิกัดนี้ที่สุดเพื่อดึง nearbyKeywords มาแนะนำ
            let closestZone: NearbyZone | null = null;
            let minDist = Infinity;
            for (const z of NEARBY_ZONES) {
                const dist = calculateHaversineDistance(avgLat, avgLng, z.lat, z.lng);
                if (dist < minDist && dist <= 10) {
                    minDist = dist;
                    closestZone = z;
                }
            }
            if (closestZone) {
                nearbyKeywords = [...closestZone.nearbyAreas];
                matchedZoneName = closestZone.name;
            }
        }
    }

    // กรองศูนย์ที่มีสถานะ visible และไม่ซ้ำกับ direct matches
    const candidateCenters = allCenters.filter(
        c => c.status === 'visible' && !directMatchIds.has(c.id)
    );

    const scoredCenters: Array<{
        center: CareCenter;
        distanceKm?: number;
        nearbyAreaName?: string;
        score: number;
    }> = [];

    for (const c of candidateCenters) {
        const cAddress = [c.address, c.name, (c as any).district, c.province].filter(Boolean).join(' ');
        let matchedAreaName: string | undefined = undefined;

        // 1. ตรวจสอบว่าตรงกับคีย์เวิร์ดย่านใกล้เคียงหรือไม่ (เช่น บางนา, แบริ่ง)
        for (const kw of nearbyKeywords) {
            if (cAddress.includes(kw)) {
                matchedAreaName = kw;
                break;
            }
        }

        // 2. คำนวณระยะทางจากจุดอ้างอิง (ถ้ามีพิกัด)
        let distanceKm: number | undefined = undefined;
        const hasCoords = c.lat && c.lng && Number(c.lat) !== 0 && Number(c.lng) !== 0;

        if (refCoords && hasCoords) {
            distanceKm = calculateHaversineDistance(
                refCoords.lat,
                refCoords.lng,
                Number(c.lat),
                Number(c.lng)
            );
        }

        // เกณฑ์การคัดเลือกเป็น "ศูนย์ใกล้เคียง":
        // A) อยู่ในรัศมีไม่เกิน 10 กม. จากทำเลที่ค้นหา
        // B) หรือมีชื่อ/ที่อยู่ตรงกับย่านข้างเคียง (nearbyKeywords) แม้ไม่มีพิกัด
        const isWithinRadius = distanceKm !== undefined && distanceKm <= 10;
        const isMatchedKeyword = Boolean(matchedAreaName);

        if (isWithinRadius || isMatchedKeyword) {
            // คำนวณคะแนนความเหมาะสม (Score)
            let score = 0;
            // ได้โบนัสถ้าเป็น Partner
            if (c.isPartner) score += 50;
            // คะแนนตามระยะทาง ยิ่งใกล้ยิ่งคะแนนสูง
            if (distanceKm !== undefined) {
                score += Math.max(0, 50 - distanceKm * 4);
            } else if (isMatchedKeyword) {
                score += 25; // ค่ากลางสำหรับศูนย์ที่มีคีย์เวิร์ดตรงแต่ไม่มีพิกัด
            }
            // ได้คะแนนเพิ่มตามเรตติ้ง
            if (c.rating) score += Number(c.rating) * 2;

            scoredCenters.push({
                center: c,
                distanceKm,
                nearbyAreaName: matchedAreaName,
                score,
            });
        }
    }

    // เรียงลำดับตามคะแนนความเหมาะสม (ระยะทางใกล้สุด + คุณภาพศูนย์)
    scoredCenters.sort((a, b) => b.score - a.score);

    const nearbyCenters = scoredCenters.slice(0, maxResults).map(item => ({
        ...item.center,
        nearbyAreaName: item.nearbyAreaName,
        distanceKm: item.distanceKm,
        referenceLocation: refCoords || undefined,
    }));

    return {
        nearbyCenters,
        nearbyKeywords,
        matchedZoneName,
    };
}
