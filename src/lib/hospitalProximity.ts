import { Hospital, CenterNearbyHospital } from '../types';

// รัศมีเฉลี่ยของโลก (กิโลเมตร)
const EARTH_RADIUS_KM = 6371;

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * คำนวณระยะทางทางตรงบนผิวโค้งโลก (Haversine Formula)
 * @param lat1 ละติจูดจุดที่ 1
 * @param lon1 ลองจิจูดจุดที่ 1
 * @param lat2 ละติจูดจุดที่ 2
 * @param lon2 ลองจิจูดจุดที่ 2
 * @returns ระยะทางทางตรงเป็นกิโลเมตร (km)
 */
export function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_KM * c;

    return Math.round(distance * 100) / 100; // ทศนิยม 2 ตำแหน่ง
}

/**
 * สร้าง Google Maps Direct Route Deep Link URL Scheme (Zero-Cost, ไม่เสียค่า API)
 * เมื่อคลิกจะเปิด Google Maps นำทางจากจุดศูนย์ดูแลไปยังโรงพยาบาลเป้าหมายทันที
 */
export function getGoogleMapsRouteUrl(
    centerLat: number,
    centerLng: number,
    hospitalLat: number,
    hospitalLng: number
): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${centerLat},${centerLng}&destination=${hospitalLat},${hospitalLng}`;
}

/**
 * คัดเลือกโรงพยาบาลที่ใกล้ที่สุดตามลำดับ (Top N Nearby Hospitals)
 */
export function findTopNearbyHospitals(
    centerLat: number,
    centerLng: number,
    hospitals: Hospital[],
    limit: number = 3
): (CenterNearbyHospital & { hospital: Hospital })[] {
    if (!centerLat || !centerLng || !hospitals || hospitals.length === 0) {
        return [];
    }

    const calculated = hospitals
        .filter(h => h.latitude && h.longitude)
        .map(hospital => {
            const distanceKm = calculateHaversineDistance(
                centerLat,
                centerLng,
                Number(hospital.latitude),
                Number(hospital.longitude)
            );
            return {
                hospitalId: hospital.id,
                distanceKm,
                priorityOrder: 0,
                hospital,
            };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit)
        .map((item, index) => ({
            ...item,
            centerId: 0,
            priorityOrder: index + 1,
        }));

    return calculated;
}

/**
 * Initial Master Data โรงพยาบาลสำคัญทั่วประเทศ (Seed Data สำหรับเริ่มต้นและ fallback)
 */
export const INITIAL_HOSPITALS: Hospital[] = [
    // กรุงเทพมหานคร
    {
        id: 'HOSP-BKK-001',
        nameTh: 'โรงพยาบาลศิริราช',
        nameEn: 'Siriraj Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์ความเป็นเลิศระดับสูง (มหาวิทยาลัย)',
        province: 'กรุงเทพมหานคร',
        district: 'บางกอกน้อย',
        latitude: 13.757859,
        longitude: 100.485125,
        emergency24h: true,
        phone: '02-419-7000',
    },
    {
        id: 'HOSP-BKK-002',
        nameTh: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
        nameEn: 'King Chulalongkorn Memorial Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์ความเป็นเลิศระดับสูง (มหาวิทยาลัย)',
        province: 'กรุงเทพมหานคร',
        district: 'ปทุมวัน',
        latitude: 13.731776,
        longitude: 100.534882,
        emergency24h: true,
        phone: '02-256-4000',
    },
    {
        id: 'HOSP-BKK-003',
        nameTh: 'โรงพยาบาลรามาธิบดี',
        nameEn: 'Ramathibodi Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์ความเป็นเลิศระดับสูง (มหาวิทยาลัย)',
        province: 'กรุงเทพมหานคร',
        district: 'ราชเทวี',
        latitude: 13.766782,
        longitude: 100.526978,
        emergency24h: true,
        phone: '02-201-1000',
    },
    {
        id: 'HOSP-BKK-004',
        nameTh: 'โรงพยาบาลราชวิถี',
        nameEn: 'Rajavithi Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิระดับสูง (กรมการแพทย์)',
        province: 'กรุงเทพมหานคร',
        district: 'ราชเทวี',
        latitude: 13.765664,
        longitude: 100.536767,
        emergency24h: true,
        phone: '02-354-8108',
    },
    {
        id: 'HOSP-BKK-005',
        nameTh: 'โรงพยาบาลพระมงกุฎเกล้า',
        nameEn: 'Phramongkutklao Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิระดับสูง',
        province: 'กรุงเทพมหานคร',
        district: 'ราชเทวี',
        latitude: 13.768494,
        longitude: 100.534185,
        emergency24h: true,
        phone: '02-763-9300',
    },
    {
        id: 'HOSP-BKK-006',
        nameTh: 'โรงพยาบาลกรุงเทพ (ซอยศูนย์วิจัย)',
        nameEn: 'Bangkok Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิชั้นนำ (JCI)',
        province: 'กรุงเทพมหานคร',
        district: 'ห้วยขวาง',
        latitude: 13.748366,
        longitude: 100.583344,
        emergency24h: true,
        phone: '02-310-3000',
    },
    {
        id: 'HOSP-BKK-007',
        nameTh: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
        nameEn: 'Bumrungrad International Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิชั้นนำ (JCI)',
        province: 'กรุงเทพมหานคร',
        district: 'วัฒนา',
        latitude: 13.746098,
        longitude: 100.552912,
        emergency24h: true,
        phone: '02-066-8888',
    },
    {
        id: 'HOSP-BKK-008',
        nameTh: 'โรงพยาบาลสมิติเวช สุขุมวิท',
        nameEn: 'Samitivej Sukhumvit Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'กรุงเทพมหานคร',
        district: 'วัฒนา',
        latitude: 13.737149,
        longitude: 100.577903,
        emergency24h: true,
        phone: '02-022-2222',
    },
    {
        id: 'HOSP-BKK-009',
        nameTh: 'โรงพยาบาลพญาไท 1',
        nameEn: 'Phyathai 1 Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'กรุงเทพมหานคร',
        district: 'ราชเทวี',
        latitude: 13.757041,
        longitude: 100.536965,
        emergency24h: true,
        phone: '02-201-4600',
    },
    {
        id: 'HOSP-BKK-010',
        nameTh: 'โรงพยาบาลพญาไท 2',
        nameEn: 'Phyathai 2 Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'กรุงเทพมหานคร',
        district: 'พญาไท',
        latitude: 13.771128,
        longitude: 100.540845,
        emergency24h: true,
        phone: '02-617-2444',
    },
    {
        id: 'HOSP-BKK-011',
        nameTh: 'โรงพยาบาลวิภาวดี',
        nameEn: 'Vibhavadi Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'กรุงเทพมหานคร',
        district: 'จตุจักร',
        latitude: 13.843779,
        longitude: 100.559483,
        emergency24h: true,
        phone: '02-561-1111',
    },
    {
        id: 'HOSP-BKK-012',
        nameTh: 'โรงพยาบาลเกษมราษฎร์ ประชาชื่น',
        nameEn: 'Kasemrad Hospital Prachachuen',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'กรุงเทพมหานคร',
        district: 'บางซื่อ',
        latitude: 13.834415,
        longitude: 100.537233,
        emergency24h: true,
        phone: '02-910-1600',
    },
    {
        id: 'HOSP-BKK-013',
        nameTh: 'โรงพยาบาลภูมิพลอดุลยเดช กรมแพทย์ทหารอากาศ',
        nameEn: 'Bhumibol Adulyadej Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิระดับสูง',
        province: 'กรุงเทพมหานคร',
        district: 'สายไหม',
        latitude: 13.910364,
        longitude: 100.622415,
        emergency24h: true,
        phone: '02-534-7000',
    },
    {
        id: 'HOSP-BKK-014',
        nameTh: 'โรงพยาบาลเลิดสิน',
        nameEn: 'Lerdsin Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิระดับสูง (กรมการแพทย์)',
        province: 'กรุงเทพมหานคร',
        district: 'บางรัก',
        latitude: 13.721491,
        longitude: 100.517374,
        emergency24h: true,
        phone: '02-353-9800',
    },
    {
        id: 'HOSP-BKK-015',
        nameTh: 'โรงพยาบาลวชิรพยาบาล มหาวิทยาลัยนวมินทราธิราช',
        nameEn: 'Vajira Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์การแพทย์มหาวิทยาลัย',
        province: 'กรุงเทพมหานคร',
        district: 'ดุสิต',
        latitude: 13.778842,
        longitude: 100.505716,
        emergency24h: true,
        phone: '02-244-3000',
    },

    // นนทบุรี
    {
        id: 'HOSP-NBI-001',
        nameTh: 'โรงพยาบาลพระนั่งเกล้า นนทบุรี',
        nameEn: 'Pranangklao Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลศูนย์ / ตติยภูมิ',
        province: 'นนทบุรี',
        district: 'เมืองนนทบุรี',
        latitude: 13.871025,
        longitude: 100.479536,
        emergency24h: true,
        phone: '02-528-4567',
    },
    {
        id: 'HOSP-NBI-002',
        nameTh: 'สถาบันบำราศนราดูร กรมควบคุมโรค',
        nameEn: 'Bamrasnaradura Infectious Diseases Institute',
        hospitalType: 'รัฐบาล',
        level: 'ศูนย์การแพทย์เฉพาะทางระดับสูง',
        province: 'นนทบุรี',
        district: 'เมืองนนทบุรี',
        latitude: 13.854084,
        longitude: 100.523531,
        emergency24h: true,
        phone: '02-590-3400',
    },
    {
        id: 'HOSP-NBI-003',
        nameTh: 'สถาบันโรคทรวงอก กรมการแพทย์',
        nameEn: 'Central Chest Institute of Thailand',
        hospitalType: 'รัฐบาล',
        level: 'ศูนย์ความเป็นเลิศเฉพาะทางโรคหัวใจและปอด',
        province: 'นนทบุรี',
        district: 'เมืองนนทบุรี',
        latitude: 13.864757,
        longitude: 100.518608,
        emergency24h: true,
        phone: '02-547-0999',
    },
    {
        id: 'HOSP-NBI-004',
        nameTh: 'โรงพยาบาลนนทเวช',
        nameEn: 'Nonthavej Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ (JCI)',
        province: 'นนทบุรี',
        district: 'เมืองนนทบุรี',
        latitude: 13.856985,
        longitude: 100.542289,
        emergency24h: true,
        phone: '02-596-7888',
    },
    {
        id: 'HOSP-NBI-005',
        nameTh: 'โรงพยาบาลเกษมราษฎร์ รัตนาธิเบศร์',
        nameEn: 'Kasemrad Hospital Rattanatibeth',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'นนทบุรี',
        district: 'บางบัวทอง',
        latitude: 13.882194,
        longitude: 100.413289,
        emergency24h: true,
        phone: '02-921-3400',
    },
    {
        id: 'HOSP-NBI-006',
        nameTh: 'โรงพยาบาลเกษมราษฎร์ อินเตอร์เนชั่นแนล รัตนาธิเบศร์',
        nameEn: 'Kasemrad International Hospital Rattanatibeth',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิชั้นนำ',
        province: 'นนทบุรี',
        district: 'บางใหญ่',
        latitude: 13.876798,
        longitude: 100.410188,
        emergency24h: true,
        phone: '02-594-0020',
    },
    {
        id: 'HOSP-NBI-007',
        nameTh: 'โรงพยาบาลชลประทาน (ศูนย์การแพทย์ปัญญานันทภิกขุ)',
        nameEn: 'Panyananthaphikkhu Chonprathan Medical Center',
        hospitalType: 'รัฐบาล',
        level: 'ศูนย์การแพทย์มหาวิทยาลัยศรีนครินทรวิโรฒ',
        province: 'นนทบุรี',
        district: 'ปากเกร็ด',
        latitude: 13.896791,
        longitude: 100.505432,
        emergency24h: true,
        phone: '02-502-2345',
    },
    {
        id: 'HOSP-NBI-008',
        nameTh: 'โรงพยาบาลเวิลด์เมดิคอล (WMC)',
        nameEn: 'World Medical Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ (JCI)',
        province: 'นนทบุรี',
        district: 'ปากเกร็ด',
        latitude: 13.905662,
        longitude: 100.528641,
        emergency24h: true,
        phone: '02-836-9999',
    },

    // ปทุมธานี
    {
        id: 'HOSP-PTE-001',
        nameTh: 'โรงพยาบาลธรรมศาสตร์เฉลิมพระเกียรติ',
        nameEn: 'Thammasat University Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์การแพทย์มหาวิทยาลัยระดับสูง',
        province: 'ปทุมธานี',
        district: 'คลองหลวง',
        latitude: 14.074744,
        longitude: 100.602568,
        emergency24h: true,
        phone: '02-926-9999',
    },
    {
        id: 'HOSP-PTE-002',
        nameTh: 'โรงพยาบาลปทุมธานี',
        nameEn: 'Pathum Thani Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลทั่วไป / ทุติยภูมิระดับสูง',
        province: 'ปทุมธานี',
        district: 'เมืองปทุมธานี',
        latitude: 14.020583,
        longitude: 100.529344,
        emergency24h: true,
        phone: '02-598-8888',
    },
    {
        id: 'HOSP-PTE-003',
        nameTh: 'โรงพยาบาลเปาโล รังสิต',
        nameEn: 'Paolo Hospital Rangsit',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'ปทุมธานี',
        district: 'ธัญบุรี',
        latitude: 13.989218,
        longitude: 100.618454,
        emergency24h: true,
        phone: '02-577-8111',
    },
    {
        id: 'HOSP-PTE-004',
        nameTh: 'โรงพยาบาลบางปะกอก-รังสิต 2',
        nameEn: 'Bangpakok-Rangsit 2 Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'ปทุมธานี',
        district: 'ธัญบุรี',
        latitude: 13.996112,
        longitude: 100.655843,
        emergency24h: true,
        phone: '02-996-2211',
    },

    // สมุทรปราการ
    {
        id: 'HOSP-SPK-001',
        nameTh: 'โรงพยาบาลสมุทรปราการ',
        nameEn: 'Samut Prakan Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลทั่วไป / ทุติยภูมิระดับสูง',
        province: 'สมุทรปราการ',
        district: 'เมืองสมุทรปราการ',
        latitude: 13.597321,
        longitude: 100.605234,
        emergency24h: true,
        phone: '02-701-8132',
    },
    {
        id: 'HOSP-SPK-002',
        nameTh: 'สถาบันการแพทย์จักรีนฤบดินทร์ (คณะแพทยศาสตร์ รพ.รามาธิบดี)',
        nameEn: 'Chakri Naruebodindra Medical Institute',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์การแพทย์มหาวิทยาลัยระดับสูง',
        province: 'สมุทรปราการ',
        district: 'บางพลี',
        latitude: 13.565432,
        longitude: 100.787654,
        emergency24h: true,
        phone: '02-839-5000',
    },
    {
        id: 'HOSP-SPK-003',
        nameTh: 'โรงพยาบาลศิครินทร์ สมุทรปราการ',
        nameEn: 'Sikarin Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ (JCI)',
        province: 'สมุทรปราการ',
        district: 'บางพลี',
        latitude: 13.653421,
        longitude: 100.652134,
        emergency24h: true,
        phone: '02-366-9900',
    },
    {
        id: 'HOSP-SPK-004',
        nameTh: 'โรงพยาบาลไทยนครินทร์',
        nameEn: 'Thainakarin Hospital',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'กรุงเทพมหานคร',
        district: 'บางนา',
        latitude: 13.666987,
        longitude: 100.640123,
        emergency24h: true,
        phone: '02-361-2727',
    },

    // เชียงใหม่
    {
        id: 'HOSP-CMI-001',
        nameTh: 'โรงพยาบาลมหาราชนครเชียงใหม่ (สวนดอก)',
        nameEn: 'Maharaj Nakorn Chiang Mai Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์การแพทย์มหาวิทยาลัยเชียงใหม่',
        province: 'เชียงใหม่',
        district: 'เมืองเชียงใหม่',
        latitude: 18.789872,
        longitude: 98.974125,
        emergency24h: true,
        phone: '053-936-150',
    },
    {
        id: 'HOSP-CMI-002',
        nameTh: 'โรงพยาบาลนครพิงค์',
        nameEn: 'Nakornping Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลศูนย์ / ตติยภูมิ',
        province: 'เชียงใหม่',
        district: 'แม่ริม',
        latitude: 18.847521,
        longitude: 98.973412,
        emergency24h: true,
        phone: '053-999-200',
    },
    {
        id: 'HOSP-CMI-003',
        nameTh: 'โรงพยาบาลกรุงเทพเชียงใหม่',
        nameEn: 'Bangkok Hospital Chiang Mai',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ (JCI)',
        province: 'เชียงใหม่',
        district: 'เมืองเชียงใหม่',
        latitude: 18.784532,
        longitude: 99.025641,
        emergency24h: true,
        phone: '052-089-888',
    },

    // ชลบุรี
    {
        id: 'HOSP-CBI-001',
        nameTh: 'โรงพยาบาลชลบุรี',
        nameEn: 'Chonburi Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลศูนย์ / ตติยภูมิ',
        province: 'ชลบุรี',
        district: 'เมืองชลบุรี',
        latitude: 13.348712,
        longitude: 100.978541,
        emergency24h: true,
        phone: '038-931-000',
    },
    {
        id: 'HOSP-CBI-002',
        nameTh: 'โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา',
        nameEn: 'Somdech Phra Debaratana Sriracha Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลตติยภูมิ สภากาชาดไทย',
        province: 'ชลบุรี',
        district: 'ศรีราชา',
        latitude: 13.170241,
        longitude: 100.925412,
        emergency24h: true,
        phone: '038-320-200',
    },
    {
        id: 'HOSP-CBI-003',
        nameTh: 'โรงพยาบาลกรุงเทพพัทยา',
        nameEn: 'Bangkok Hospital Pattaya',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ (JCI)',
        province: 'ชลบุรี',
        district: 'บางละมุง',
        latitude: 12.952412,
        longitude: 100.906541,
        emergency24h: true,
        phone: '038-259-999',
    },

    // ขอนแก่น
    {
        id: 'HOSP-KKN-001',
        nameTh: 'โรงพยาบาลศรีนครินทร์ (คณะแพทยศาสตร์ มข.)',
        nameEn: 'Srinagarind Hospital',
        hospitalType: 'รัฐบาล',
        level: 'ตติยภูมิ / ศูนย์การแพทย์มหาวิทยาลัยขอนแก่น',
        province: 'ขอนแก่น',
        district: 'เมืองขอนแก่น',
        latitude: 16.467412,
        longitude: 102.828541,
        emergency24h: true,
        phone: '043-363-000',
    },
    {
        id: 'HOSP-KKN-002',
        nameTh: 'โรงพยาบาลขอนแก่น',
        nameEn: 'Khon Kaen Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลศูนย์ / ตติยภูมิ',
        province: 'ขอนแก่น',
        district: 'เมืองขอนแก่น',
        latitude: 16.432541,
        longitude: 102.841254,
        emergency24h: true,
        phone: '043-058-222',
    },

    // ภูเก็ต
    {
        id: 'HOSP-PKT-001',
        nameTh: 'โรงพยาบาลวชิระภูเก็ต',
        nameEn: 'Vachira Phuket Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลศูนย์ / ตติยภูมิ',
        province: 'ภูเก็ต',
        district: 'เมืองภูเก็ต',
        latitude: 7.896541,
        longitude: 98.378541,
        emergency24h: true,
        phone: '076-361-234',
    },
    {
        id: 'HOSP-PKT-002',
        nameTh: 'โรงพยาบาลกรุงเทพภูเก็ต',
        nameEn: 'Bangkok Hospital Phuket',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ (JCI)',
        province: 'ภูเก็ต',
        district: 'เมืองภูเก็ต',
        latitude: 7.902541,
        longitude: 98.371254,
        emergency24h: true,
        phone: '076-254-425',
    },

    // นครราชสีมา
    {
        id: 'HOSP-NMA-001',
        nameTh: 'โรงพยาบาลมหาราชนครราชสีมา',
        nameEn: 'Maharat Nakhon Ratchasima Hospital',
        hospitalType: 'รัฐบาล',
        level: 'โรงพยาบาลศูนย์ / ตติยภูมิระดับสูง',
        province: 'นครราชสีมา',
        district: 'เมืองนครราชสีมา',
        latitude: 14.978541,
        longitude: 102.102541,
        emergency24h: true,
        phone: '044-235-000',
    },
    {
        id: 'HOSP-NMA-002',
        nameTh: 'โรงพยาบาลกรุงเทพราชสีมา',
        nameEn: 'Bangkok Hospital Ratchasima',
        hospitalType: 'เอกชน',
        level: 'โรงพยาบาลเอกชนระดับตติยภูมิ',
        province: 'นครราชสีมา',
        district: 'เมืองนครราชสีมา',
        latitude: 14.982541,
        longitude: 102.086541,
        emergency24h: true,
        phone: '044-015-999',
    },
];
