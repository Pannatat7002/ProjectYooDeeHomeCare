import { cache } from 'react';
import { getCareCenterByName, getCareCentersLight, getNearbyHospitalsByCenterId } from '../../lib/db';
import { calculateHaversineDistance } from '../../lib/hospitalProximity';
import { findTopNearbyTransitStations } from '../../lib/transitStations';
import { getRoadDistance } from '../../lib/osrmRouting';
import CenterDetailClient from './CenterDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// กำหนดการ revalidate หน้าเว็บแบบ Incremental Static Regeneration (ISR) ทุกๆ 1 ชั่วโมง (และล้างแคชทันทีเมื่อแอดมินอัปเดตข้อมูล)
export const revalidate = 3600; 
export const dynamicParams = true;

// Deduplicate single-center lookup between generateMetadata and Page within the same request
const getCenterCached = cache(async (name: string) => getCareCenterByName(name));

// ⚡ ปรับ generateStaticParams ให้เป็น On-Demand (ISR)
// เพื่อป้องกันปัญหา Vercel Linux Filesystem จำกัดความยาวชื่อโฟลเดอร์ภาษาไทย (ENAMETOOLONG)
// และป้องกัน Build Timeout จากการ Pre-render ศูนย์กว่า 950 แห่งพร้อมกันตอน Build time
export async function generateStaticParams() {
    return [];
}

// 1. สร้าง Metadata สำหรับ SEO รายหน้าแบบ Dynamic
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const center = await getCenterCached(name);

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
    
    // ดึงข้อมูลเฉพาะศูนย์ที่เปิดดู (ไม่ดึงรายละเอียดหนักๆ ของทั้ง 950 ศูนย์)
    const center = await getCenterCached(name);

    // หากไม่พบข้อมูลศูนย์ดูแล ให้ส่งกลับหน้า 404 ของ Next.js ทันที
    if (!center) {
        notFound();
    }

    // ดึงเฉพาะคอลัมน์เบาๆ สำหรับคำนวณศูนย์ใกล้เคียง 3 แห่ง และศูนย์แนะนำ 3 แห่ง
    const careCenters = await getCareCentersLight();

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

    // กลุ่มจังหวัดปริมณฑลที่เชื่อมต่อกัน (เดินทางข้ามจังหวัดได้ในระยะสั้น เช่น ลาซาล-แบริ่ง)
    const BKK_METRO_PROVINCES = new Set([
        'กรุงเทพมหานคร',
        'สมุทรปราการ',
        'นนทบุรี',
        'ปทุมธานี',
        'สมุทรสาคร',
        'นครปฐม'
    ]);
    const isTargetMetro = BKK_METRO_PROVINCES.has(targetProvince);

    // ดึงศูนย์ดูแลใกล้เคียง 3 แห่งแรก:
    // ให้ความสำคัญกับศูนย์ในจังหวัดเดียวกัน หรือในกลุ่มปริมณฑลรัศมีไม่เกิน 15 กม.
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

        // 1. หาศูนย์ในจังหวัดเดียวกัน หรือในกลุ่มปริมณฑลใกล้เคียง (เช่น ลาซาล กทม. กับ แบริ่ง สมุทรปราการ ห่างกัน 1-2 กม.)
        const localCentersWithDist = centersWithDist.filter((c: any) => {
            const cProv = (c.province || '').trim();
            if (cProv === targetProvince) return true;
            if (isTargetMetro && BKK_METRO_PROVINCES.has(cProv) && c.distanceKm <= 15) {
                return true;
            }
            return false;
        });

        if (localCentersWithDist.length > 0) {
            nearbyCenters = localCentersWithDist
                .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
                .slice(0, 3);
        } else {
            // 2. ถ้าในพื้นที่ไม่มีพิกัด ลองหารัศมีใกล้เคียงจริงไม่เกิน 50 กม.
            nearbyCenters = centersWithDist
                .filter((c: any) => c.distanceKm <= 50)
                .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
                .slice(0, 3);
        }
    }

    // 3. ถ้ายังไม่ครบ 3 แห่ง ให้เติมด้วยศูนย์ในจังหวัดเดียวกันหรือปริมณฑล
    if (nearbyCenters.length < 3 && targetProvince) {
        const existingNearbyIds = new Set(nearbyCenters.map((c: any) => c.id));
        const sameProvRemaining = careCenters
            .filter((c: any) => {
                if (c.id === normalizedCenter.id || c.status !== 'visible' || existingNearbyIds.has(c.id)) return false;
                const cProv = (c.province || '').trim();
                return cProv === targetProvince || (isTargetMetro && BKK_METRO_PROVINCES.has(cProv));
            });
        nearbyCenters = [...nearbyCenters, ...sameProvRemaining].slice(0, 3);
    }

    // ดึงศูนย์ดูแลอื่นๆ ที่น่าสนใจ:
    // ลำดับความสำคัญ:
    // 1) ศูนย์ Partner ในจังหวัดเดียวกัน / ปริมณฑล (หากมีพิกัดในรัศมี 7 กม. ให้ขึ้นก่อน)
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

    // คัดกรองศูนย์ในจังหวัดเดียวกันหรือกลุ่มปริมณฑลเป็นกลุ่มแรก
    const sameProvinceCenters = targetProvince
        ? availableCenters.filter((c: any) => {
            const cProv = (c.province || '').trim();
            if (cProv === targetProvince) return true;
            if (isTargetMetro && BKK_METRO_PROVINCES.has(cProv) && c.distanceKm && c.distanceKm <= 15) return true;
            return false;
        })
        : availableCenters;
    const otherProvinceCenters = targetProvince
        ? availableCenters.filter((c: any) => {
            const cProv = (c.province || '').trim();
            if (cProv === targetProvince) return false;
            if (isTargetMetro && BKK_METRO_PROVINCES.has(cProv) && c.distanceKm && c.distanceKm <= 15) return false;
            return true;
        })
        : [];

    const targetPrice = Number(normalizedCenter.price) || 0;
    const selectedRelatedMap = new Map<number, any>();

    // 1. ศูนย์ในจังหวัดเดียวกันที่มีระยะใกล้เคียง (หากมีรัศมี <= 7 กม. ให้อยู่ลำดับแรก)
    sameProvinceCenters
        .filter((c: any) => c.distanceKm !== undefined && c.distanceKm <= 7)
        .sort((a: any, b: any) => (a.distanceKm || 0) - (b.distanceKm || 0))
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
                return 0;
            })
            .forEach((c: any) => {
                if (selectedRelatedMap.size < 3) selectedRelatedMap.set(c.id, c);
            });
    }

    const toCardCenter = (c: any) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        province: c.province,
        district: c.district,
        address: c.address,
        lat: c.lat,
        lng: c.lng,
        rating: c.rating,
        type: c.type,
        isPartner: c.isPartner,
        status: c.status,
        imageUrls: Array.isArray(c.imageUrls) ? c.imageUrls.slice(0, 1) : [],
        brandName: c.brandName,
        brandLogoUrl: c.brandLogoUrl,
        hasGovernmentCertificate: c.hasGovernmentCertificate,
        distanceKm: c.distanceKm,
        phone: '',
        description: '',
        services: [],
        packages: [],
    });

    nearbyCenters = nearbyCenters.map(toCardCenter);
    const relatedCenters = Array.from(selectedRelatedMap.values()).slice(0, 3).map(toCardCenter);

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