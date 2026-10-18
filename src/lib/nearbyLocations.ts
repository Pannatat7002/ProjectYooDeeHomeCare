import { CareCenter } from '../types';
import { calculateHaversineDistance } from './hospitalProximity';
import { TRANSIT_STATIONS } from './transitStations';
import { INITIAL_HOSPITALS } from './hospitalProximity';

export interface NearbySearchResult {
    nearbyCenters: (CareCenter & {
        nearbyAreaName?: string;
        distanceKm?: number;
        referenceLocation?: { lat: number; lng: number };
    })[];
    nearbyKeywords: string[];
    matchedLocationName: string | null;
    referenceCoords: { lat: number; lng: number } | null;
    searchRadiusKm: number;
    isRadiusExpanded: boolean;
}

/**
 * ดึงชื่อย่าน/เขต/ทำเลที่กระชับจากที่อยู่หรือฟิลด์ district ของศูนย์ดูแล
 * เพื่อนำมาทำเป็นแท็กแนะนำอัตโนมัติ (Dynamic Location Tags) โดยไม่ต้อง Hardcode
 */
export function extractAreaNameFromCenter(center: CareCenter): string {
    const district = (center as any).district;
    if (district && typeof district === 'string' && district.trim()) {
        return district.replace(/^(เขต|อำเภอ|อ\.)\s*/, '').trim();
    }

    const addr = center.address || '';

    // สกัดคำค้นหาหลักที่คนมักเรียก เช่น ลาซาล, แบริ่ง, อุดมสุข, สุขุมวิท...
    const landmarkMatch = addr.match(/(ลาซาล|แบริ่ง|อุดมสุข|อ่อนนุช|สำโรง|พระราม\s*\d+|สาทร|สีลม|บางนา|แจ้งวัฒนะ|งามวงศ์วาน|รังสิต|ปิ่นเกล้า|ลาดพร้าว|รัชดา)/i);
    if (landmarkMatch) {
        return landmarkMatch[1].replace(/\s+/g, '');
    }

    // ดึง เขต/อำเภอ จากที่อยู่
    const districtMatch = addr.match(/(?:เขต|อำเภอ|อ\.)\s*([ก-๙a-zA-Z0-9]+)/);
    if (districtMatch && districtMatch[1]) {
        return districtMatch[1].trim();
    }

    // ดึง แขวง/ตำบล
    const subDistrictMatch = addr.match(/(?:แขวง|ตำบล|ต\.)\s*([ก-๙a-zA-Z0-9]+)/);
    if (subDistrictMatch && subDistrictMatch[1]) {
        return subDistrictMatch[1].trim();
    }

    if (center.province && center.province.trim()) {
        return center.province.trim();
    }

    return 'ละแวกใกล้เคียง';
}

/**
 * หาพิกัดอ้างอิง (Reference Lat/Lng) แบบ Dynamic 100% จากคำค้นหา:
 * 1. ถ้าผลการค้นหาตรง (directMatches) มีพิกัด -> ใช้จุดกึ่งกลาง (Centroid) ของศูนย์ที่พบ
 * 2. ถ้าค้นหาชื่อสถานีรถไฟฟ้า BTS/MRT -> ดึงพิกัดจากสถานี
 * 3. ถ้าค้นหาชื่อโรงพยาบาล -> ดึงพิกัดจากโรงพยาบาล
 * 4. ถ้าตรงกับศูนย์ใดๆ ในระบบ -> ดึงพิกัดจากศูนย์นั้น
 */
export function resolveReferenceCoordinates(
    searchQuery: string,
    directMatches: CareCenter[],
    allCenters: CareCenter[]
): {
    coords: { lat: number; lng: number } | null;
    locationName: string | null;
} {
    if (!searchQuery || !searchQuery.trim()) {
        return { coords: null, locationName: null };
    }

    const raw = searchQuery.trim().toLowerCase();
    const norm = raw.replace(/\s+/g, '');

    // 1. ตรวจสอบศูนย์ใน directMatches ที่มีพิกัดจริง
    const directCoords = directMatches
        .filter(c => c.lat && c.lng && Number(c.lat) !== 0 && Number(c.lng) !== 0 && !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)))
        .map(c => ({ lat: Number(c.lat), lng: Number(c.lng) }));

    if (directCoords.length > 0) {
        const avgLat = directCoords.reduce((sum, item) => sum + item.lat, 0) / directCoords.length;
        const avgLng = directCoords.reduce((sum, item) => sum + item.lng, 0) / directCoords.length;
        return {
            coords: { lat: avgLat, lng: avgLng },
            locationName: directMatches[0]?.name || searchQuery.trim(),
        };
    }

    // 2. ตรวจสอบกับสถานีรถไฟฟ้า BTS / MRT
    const matchedStation = TRANSIT_STATIONS.find(s => {
        const nameTh = s.nameTh.toLowerCase().replace(/\s+/g, '');
        const nameEn = (s.nameEn || '').toLowerCase().replace(/\s+/g, '');
        return norm.includes(nameTh) || nameTh.includes(norm) || (nameEn && (norm.includes(nameEn) || nameEn.includes(norm)));
    });

    if (matchedStation && matchedStation.lat && matchedStation.lng) {
        return {
            coords: { lat: matchedStation.lat, lng: matchedStation.lng },
            locationName: `สถานี ${matchedStation.nameTh}`,
        };
    }

    // 3. ตรวจสอบกับโรงพยาบาล
    const matchedHospital = INITIAL_HOSPITALS.find(h => {
        const nameTh = h.nameTh.toLowerCase().replace(/\s+/g, '');
        const nameEn = (h.nameEn || '').toLowerCase().replace(/\s+/g, '');
        return norm.includes(nameTh) || nameTh.includes(norm) || (nameEn && (norm.includes(nameEn) || nameEn.includes(norm)));
    });

    if (matchedHospital && matchedHospital.latitude && matchedHospital.longitude) {
        return {
            coords: { lat: matchedHospital.latitude, lng: matchedHospital.longitude },
            locationName: matchedHospital.nameTh,
        };
    }

    // 4. ตรวจสอบกับศูนย์ทั้งหมดในระบบที่อาจมีที่อยู่ตรงคำค้นหา
    const matchedCenterInDb = allCenters.find(c => {
        const combined = [c.name, c.address, c.province, (c as any).district].filter(Boolean).join(' ').toLowerCase().replace(/\s+/g, '');
        return combined.includes(norm) && c.lat && c.lng && Number(c.lat) !== 0;
    });

    if (matchedCenterInDb && matchedCenterInDb.lat && matchedCenterInDb.lng) {
        return {
            coords: { lat: Number(matchedCenterInDb.lat), lng: Number(matchedCenterInDb.lng) },
            locationName: matchedCenterInDb.name,
        };
    }

    return { coords: null, locationName: null };
}

/**
 * ค้นหาศูนย์ดูแลแนะนำในทำเลใกล้เคียงแบบ Dynamic Lat/Long 100%
 * มาพร้อมระบบ Adaptive Tiered Radius (10km -> 20km -> 35km -> Nearest N)
 */
export function findNearbyCareCentersForSearch(
    searchQuery: string,
    directMatches: CareCenter[],
    allCenters: CareCenter[],
    maxResults: number = 6
): NearbySearchResult {
    if (!searchQuery || !searchQuery.trim()) {
        return {
            nearbyCenters: [],
            nearbyKeywords: [],
            matchedLocationName: null,
            referenceCoords: null,
            searchRadiusKm: 10,
            isRadiusExpanded: false,
        };
    }

    const { coords: refCoords, locationName } = resolveReferenceCoordinates(
        searchQuery,
        directMatches,
        allCenters
    );

    // เก็บ ID ของศูนย์ที่แสดงในผลลัพธ์หลักแล้ว เพื่อไม่ให้แสดงซ้ำ
    const directMatchIds = new Set(directMatches.map(c => c.id));

    // กรองเอาเฉพาะศูนย์ที่พร้อมแสดง (status === 'visible') และไม่ซ้ำกับผลลัพธ์ตรง
    const candidateCenters = allCenters.filter(
        c => c.status === 'visible' && !directMatchIds.has(c.id)
    );

    // ถ้าไม่มีพิกัดอ้างอิง (เช่น พิมพ์คำที่ไม่พบที่ใดเลย)
    if (!refCoords) {
        return {
            nearbyCenters: [],
            nearbyKeywords: [],
            matchedLocationName: null,
            referenceCoords: null,
            searchRadiusKm: 10,
            isRadiusExpanded: false,
        };
    }

    // คำนวณระยะทางจริง (Haversine) ของผู้สมัครทั้งหมดที่มีพิกัด
    const centersWithDistance = candidateCenters
        .filter(c => c.lat && c.lng && Number(c.lat) !== 0 && Number(c.lng) !== 0 && !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)))
        .map(c => {
            const dist = calculateHaversineDistance(
                refCoords.lat,
                refCoords.lng,
                Number(c.lat),
                Number(c.lng)
            );
            return {
                center: c,
                distanceKm: dist,
                areaName: extractAreaNameFromCenter(c),
            };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);

    // --- Adaptive Tiered Radius Strategy ---
    // สเต็ปที่ 1: รัศมีมาตรฐาน 10 กม.
    // สเต็ปที่ 2: หากพบน้อยกว่า 3 แห่ง -> ขยายเป็น 20 กม.
    // สเต็ปที่ 3: หากยังน้อยกว่า 3 แห่ง -> ขยายเป็น 35 กม.
    // สเต็ปที่ 4: หากยังน้อยกว่า 3 แห่ง -> ขยายเป็น 50 กม. หรือดึงศูนย์ที่ใกล้ที่สุด (Nearest N)
    const RADIUS_TIERS = [10, 20, 35, 50];
    let selectedTier = 10;
    let filteredResults: typeof centersWithDistance = [];

    for (const radius of RADIUS_TIERS) {
        selectedTier = radius;
        filteredResults = centersWithDistance.filter(item => item.distanceKm <= radius);
        if (filteredResults.length >= 3) {
            break;
        }
    }

    // หากแม้แต่ 50 กม. ยังไม่ครบ 3 แห่ง แต่มีศูนย์ที่ใกล้ที่สุดในระบบ ให้ดึงศูนย์ที่ใกล้ที่สุดตามลำดับจริง
    if (filteredResults.length < 3 && centersWithDistance.length > 0) {
        filteredResults = centersWithDistance.slice(0, Math.min(maxResults, centersWithDistance.length));
        if (filteredResults.length > 0) {
            const maxDistFound = filteredResults[filteredResults.length - 1].distanceKm;
            selectedTier = Math.max(selectedTier, Math.ceil(maxDistFound));
        }
    }

    // จัดเรียงผลลัพธ์: เรียงตามระยะทางใกล้สุด
    const sorted = [...filteredResults].sort((a, b) => a.distanceKm - b.distanceKm);

    const finalCenters = sorted.slice(0, maxResults).map(item => ({
        ...item.center,
        nearbyAreaName: item.areaName,
        distanceKm: item.distanceKm,
        referenceLocation: refCoords,
    }));

    // ดึงชื่อย่าน/ทำเลใกล้เคียงที่ไม่ซ้ำกันจากศูนย์ที่พบมาทำเป็น Tag แนะนำอัตโนมัติ (Dynamic Keywords)
    const uniqueAreaNames = Array.from(
        new Set(finalCenters.map(c => c.nearbyAreaName).filter(Boolean))
    ) as string[];

    return {
        nearbyCenters: finalCenters,
        nearbyKeywords: uniqueAreaNames.slice(0, 5),
        matchedLocationName: locationName,
        referenceCoords: refCoords,
        searchRadiusKm: selectedTier,
        isRadiusExpanded: selectedTier > 10,
    };
}
