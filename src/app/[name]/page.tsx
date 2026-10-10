import { getCareCenters, getNearbyHospitalsByCenterId } from '../../lib/db';
import { calculateHaversineDistance } from '../../lib/hospitalProximity';
import { findTopNearbyTransitStations } from '../../lib/transitStations';
import { getRoadDistance } from '../../lib/osrmRouting';
import CenterDetailClient from './CenterDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// กำหนดการ revalidate หน้าเว็บแบบ Incremental Static Regeneration (ISR) ทุกๆ 5 นาที
export const revalidate = 300; 
export const dynamicParams = true;

// ⚡ ปรับ generateStaticParams ให้เป็น On-Demand (ISR)
// เพื่อป้องกันปัญหา Vercel Linux Filesystem จำกัดความยาวชื่อโฟลเดอร์ภาษาไทย (ENAMETOOLONG)
// และป้องกัน Build Timeout จากการ Pre-render ศูนย์กว่า 950 แห่งพร้อมกันตอน Build time
export async function generateStaticParams() {
    return [];
}

// 1. สร้าง Metadata สำหรับ SEO รายหน้าแบบ Dynamic
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).replace(/-/g, ' ');
    const careCenters = await getCareCenters();
    
    const targetName = decodedName.replace(/\s+/g, '');
    const center = careCenters.find((c: any) =>
        c.name.replace(/\s+/g, '') === targetName || c.name === decodedName
    );

    if (!center) {
        return {
            title: 'ไม่พบศูนย์ดูแล | ThaiCareCenter',
        };
    }

    const title = `${center.name} | รวมศูนย์ดูแลผู้สูงอายุ`;
    const description = `${center.name} - ${center.description || center.address || 'ค้นหารายละเอียด แพ็คเกจ ราคา สิ่งอำนวยความสะดวก และการเดินทางสู่ศูนย์ได้ที่นี่'}`;
    const mainImage = center.imageUrls?.[0] || '/ThaiCareCenter.png';

    return {
        title: title,
        description: description.slice(0, 160), // ย่อเนื้อหาให้อยู่ในกรอบ 160 ตัวอักษร
        openGraph: {
            title: title,
            description: description.slice(0, 160),
            images: [{ url: mainImage }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description.slice(0, 160),
            images: [mainImage],
        }
    };
}

// 2. Server Component หลัก
export default async function Page({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).replace(/-/g, ' ');
    
    // ดึงข้อมูลผ่าน Cache Layer บน Server
    const careCenters = await getCareCenters();
    
    const targetName = decodedName.replace(/\s+/g, '');
    const center = careCenters.find((c: any) =>
        c.name.replace(/\s+/g, '') === targetName || c.name === decodedName
    );

    // หากไม่พบข้อมูลศูนย์ดูแลใน Google Sheets ให้ส่งกลับหน้า 404 ของ Next.js ทันที
    if (!center) {
        notFound();
    }

    // ทำการ Normalize ข้อมูลตั้งต้นเพื่อป้องกันปัญหา Props เป็น Null / undefined ที่ Client
    const normalizedCenter = {
        ...center,
        services: Array.isArray(center.services) ? center.services : [],
        packages: Array.isArray(center.packages) ? center.packages : [],
        imageUrls: Array.isArray(center.imageUrls) ? center.imageUrls : [],
        roomTypes: Array.isArray(center.roomTypes) ? center.roomTypes : [],
    };

    // ดึงโรงพยาบาลใกล้เคียง 3 อันดับแรก
    const nearbyHospitals = await getNearbyHospitalsByCenterId(
        normalizedCenter.id,
        normalizedCenter.lat ? Number(normalizedCenter.lat) : undefined,
        normalizedCenter.lng ? Number(normalizedCenter.lng) : undefined
    );

    const targetProvince = (normalizedCenter.province || '').trim();
    const hasValidCoords = Boolean(normalizedCenter.lat && normalizedCenter.lng && Number(normalizedCenter.lat) !== 0 && Number(normalizedCenter.lng) !== 0);

    // ดึงสถานีรถไฟ/รถไฟฟ้าใกล้เคียง 3 อันดับแรก (ถ้าระยะไม่เกิน 20 กม.)
    const nearbyTransitStations = hasValidCoords
        ? findTopNearbyTransitStations(Number(normalizedCenter.lat), Number(normalizedCenter.lng), 3, 20)
        : [];

    // คำนวณระยะทางจริงบนถนนและเวลาขับรถผ่าน OSRM API (ฟรี 100%)
    const [roadNearbyHospitals, roadNearbyTransitStations] = await Promise.all([
        Promise.all(
            nearbyHospitals.map(async (item) => {
                const hosp = item.hospital;
                if (hasValidCoords && hosp?.latitude && hosp?.longitude) {
                    const road = await getRoadDistance(
                        Number(normalizedCenter.lat),
                        Number(normalizedCenter.lng),
                        Number(hosp.latitude),
                        Number(hosp.longitude),
                        Number(item.distanceKm)
                    );
                    return {
                        ...item,
                        distanceKm: road.distanceKm,
                        durationMinutes: road.durationMinutes,
                    };
                }
                return item;
            })
        ),
        Promise.all(
            nearbyTransitStations.map(async (item) => {
                const st = item.station;
                if (hasValidCoords && st?.lat && st?.lng) {
                    const road = await getRoadDistance(
                        Number(normalizedCenter.lat),
                        Number(normalizedCenter.lng),
                        Number(st.lat),
                        Number(st.lng),
                        Number(item.distanceKm)
                    );
                    return {
                        ...item,
                        distanceKm: road.distanceKm,
                        durationMinutes: road.durationMinutes,
                    };
                }
                return item;
            })
        ),
    ]);

    // ดึงศูนย์ดูแลใกล้เคียง 3 แห่งแรก:
    // ให้ความสำคัญกับศูนย์ในจังหวัดเดียวกันเป็นอันดับแรก เพื่อป้องกันการดึงศูนย์ข้ามภาค (เช่น กรุงเทพมาแสดงในเชียงใหม่)
    let nearbyCenters: any[] = [];
    if (hasValidCoords) {
        const centersWithDist = careCenters
            .filter((c: any) => c.id !== normalizedCenter.id && c.status === 'visible' && c.lat && c.lng && Number(c.lat) !== 0)
            .map((c: any) => ({
                ...c,
                distanceKm: calculateHaversineDistance(
                    Number(normalizedCenter.lat),
                    Number(normalizedCenter.lng),
                    Number(c.lat),
                    Number(c.lng)
                )
            }));

        // 1. หาศูนย์ในจังหวัดเดียวกันที่มีพิกัด เรียงตามระยะทาง
        const sameProvinceWithDist = targetProvince
            ? centersWithDist.filter((c: any) => (c.province || '').trim() === targetProvince)
            : [];

        if (sameProvinceWithDist.length > 0) {
            nearbyCenters = sameProvinceWithDist
                .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
                .slice(0, 3);
        } else {
            // 2. ถ้าในจังหวัดเดียวกันไม่มีพิกัด ลองหารัศมีใกล้เคียงจริงไม่เกิน 50 กม.
            nearbyCenters = centersWithDist
                .filter((c: any) => c.distanceKm <= 50)
                .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
                .slice(0, 3);
        }
    }

    // 3. ถ้ายังไม่ครบ 3 แห่ง ให้เติมด้วยศูนย์ในจังหวัดเดียวกัน
    if (nearbyCenters.length < 3 && targetProvince) {
        const existingNearbyIds = new Set(nearbyCenters.map((c: any) => c.id));
        const sameProvRemaining = careCenters
            .filter((c: any) => c.id !== normalizedCenter.id && c.status === 'visible' && (c.province || '').trim() === targetProvince && !existingNearbyIds.has(c.id));
        nearbyCenters = [...nearbyCenters, ...sameProvRemaining].slice(0, 3);
    }

    // ดึงศูนย์ดูแลอื่นๆ ที่น่าสนใจ:
    // ลำดับความสำคัญ:
    // 1) ศูนย์ Partner ในจังหวัดเดียวกัน (หากมีพิกัดในรัศมี 7 กม. ให้ขึ้นก่อน)
    // 2) ศูนย์ในจังหวัดเดียวกันที่มีช่วงราคาใกล้เคียงกัน (±5,000 บาท)
    // 3) ศูนย์อื่นๆ ในจังหวัดเดียวกัน เพื่อให้ครบ 3 แห่ง
    // 4) Fallback: หากทั้งจังหวัดมีศูนย์ไม่ถึง 3 แห่ง ค่อยดึงศูนย์นอกจังหวัด
    const nearbyIds = new Set(nearbyCenters.map((c: any) => c.id));
    const availableCenters = careCenters
        .filter((c: any) => c.id !== normalizedCenter.id && c.status === 'visible' && !nearbyIds.has(c.id))
        .map((c: any) => {
            const hasCoords = hasValidCoords && c.lat && c.lng && Number(c.lat) !== 0;
            const distanceKm = hasCoords
                ? calculateHaversineDistance(
                    Number(normalizedCenter.lat),
                    Number(normalizedCenter.lng),
                    Number(c.lat),
                    Number(c.lng)
                )
                : undefined;
            return { ...c, distanceKm };
        });

    // คัดกรองศูนย์ในจังหวัดเดียวกันเป็นกลุ่มแรก
    const sameProvinceCenters = targetProvince
        ? availableCenters.filter((c: any) => (c.province || '').trim() === targetProvince)
        : availableCenters;
    const otherProvinceCenters = targetProvince
        ? availableCenters.filter((c: any) => (c.province || '').trim() !== targetProvince)
        : [];

    const targetPrice = Number(normalizedCenter.price) || 0;
    const selectedRelatedMap = new Map<number, any>();

    // 1. ศูนย์ Partner ในจังหวัดเดียวกัน (หากมีรัศมี <= 7 กม. ให้อยู่ลำดับแรก)
    sameProvinceCenters
        .filter((c: any) => c.isPartner)
        .sort((a: any, b: any) => {
            const aIn7 = a.distanceKm !== undefined && a.distanceKm <= 7 ? 1 : 0;
            const bIn7 = b.distanceKm !== undefined && b.distanceKm <= 7 ? 1 : 0;
            if (aIn7 !== bIn7) return bIn7 - aIn7;
            if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
                return a.distanceKm - b.distanceKm;
            }
            return 0;
        })
        .forEach((c: any) => {
            if (selectedRelatedMap.size < 3) selectedRelatedMap.set(c.id, c);
        });

    // 2. ศูนย์ในจังหวัดเดียวกัน ที่มีช่วงราคาเดียวกัน (±5,000 บาท)
    if (selectedRelatedMap.size < 3 && targetPrice > 0) {
        sameProvinceCenters
            .filter((c: any) => {
                if (selectedRelatedMap.has(c.id)) return false;
                const p = Number(c.price) || 0;
                return p > 0 && Math.abs(p - targetPrice) <= 5000;
            })
            .sort((a: any, b: any) => {
                if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
                    return a.distanceKm - b.distanceKm;
                }
                return Math.abs((Number(a.price) || 0) - targetPrice) - Math.abs((Number(b.price) || 0) - targetPrice);
            })
            .forEach((c: any) => {
                if (selectedRelatedMap.size < 3) selectedRelatedMap.set(c.id, c);
            });
    }

    // 3. ศูนย์อื่นๆ ในจังหวัดเดียวกัน (เติมให้ครบ 3 แห่ง)
    if (selectedRelatedMap.size < 3) {
        sameProvinceCenters
            .filter((c: any) => !selectedRelatedMap.has(c.id))
            .sort((a: any, b: any) => {
                if (Boolean(a.isPartner) !== Boolean(b.isPartner)) {
                    return a.isPartner ? -1 : 1;
                }
                if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
                    return a.distanceKm - b.distanceKm;
                }
                return 0;
            })
            .forEach((c: any) => {
                if (selectedRelatedMap.size < 3) selectedRelatedMap.set(c.id, c);
            });
    }

    // 4. Fallback: หากทั้งจังหวัดมีศูนย์ไม่ถึง 3 แห่ง ค่อยดึงศูนย์นอกจังหวัด
    if (selectedRelatedMap.size < 3) {
        otherProvinceCenters
            .filter((c: any) => !selectedRelatedMap.has(c.id))
            .sort((a: any, b: any) => {
                if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
                    return a.distanceKm - b.distanceKm;
                }
                if (Boolean(a.isPartner) !== Boolean(b.isPartner)) {
                    return a.isPartner ? -1 : 1;
                }
                return 0;
            })
            .forEach((c: any) => {
                if (selectedRelatedMap.size < 3) selectedRelatedMap.set(c.id, c);
            });
    }

    const relatedCenters = Array.from(selectedRelatedMap.values()).slice(0, 3);

    // 3. สร้าง Schema.org JSON-LD สำหรับให้ AI Search Engine (เช่น Perplexity, ChatGPT) อ่านข้อมูลโครงสร้าง
    const BASE_URL = 'https://thaicarecenter.com';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NursingHome',
        '@id': `${BASE_URL}/${encodeURIComponent(center.name.replace(/\s+/g, '-'))}`,
        name: center.name,
        description: center.description || 'ศูนย์ดูแลผู้สูงอายุและผู้ป่วยพักฟื้น',
        image: normalizedCenter.imageUrls,
        address: {
            '@type': 'PostalAddress',
            streetAddress: center.address || '',
            addressLocality: center.province || 'กรุงเทพมหานคร',
            addressCountry: 'TH'
        },
        telephone: center.phone || '',
        priceRange: center.price ? `฿${center.price}/month` : '',
        aggregateRating: center.rating ? {
            '@type': 'AggregateRating',
            ratingValue: center.rating,
            reviewCount: 1
        } : undefined,
        geo: center.lat && center.lng ? {
            '@type': 'GeoCoordinates',
            latitude: Number(center.lat),
            longitude: Number(center.lng)
        } : undefined
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CenterDetailClient 
                center={normalizedCenter} 
                nearbyCenters={nearbyCenters}
                relatedCenters={relatedCenters} 
                nearbyHospitals={roadNearbyHospitals}
                nearbyTransitStations={roadNearbyTransitStations}
            />
        </>
    );
}