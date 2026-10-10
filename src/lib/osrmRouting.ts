/**
 * OSRM Routing Engine (OpenStreetMap - 100% Free Road Distance)
 * คำนวณระยะทางและเวลาขับรถบนเส้นทางถนนจริง (Road Driving Distance) แทนระยะขจัดทางตรง
 */

export interface RoadRouteResult {
    distanceKm: number;
    durationMinutes?: number;
    isRealRoadDistance: boolean;
}

// In-memory cache สำหรับลดการเรียกซ้ำและเพิ่มความเร็วระดับเสี้ยววินาที
const routeCache = new Map<string, RoadRouteResult>();

/**
 * คำนวณระยะทางบนถนนจริงจากพิกัดต้นทางไปยังปลายทางผ่าน OSRM Public API
 * มีระบบ Cache + Timeout 2.5 วินาที และ Fallback ไปยังระยะทางตรงกรณีเครือข่ายขัดข้อง
 */
export async function getRoadDistance(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    fallbackDistanceKm?: number
): Promise<RoadRouteResult> {
    if (!fromLat || !fromLng || !toLat || !toLng || isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
        return {
            distanceKm: fallbackDistanceKm || 0,
            isRealRoadDistance: false,
        };
    }

    const cacheKey = `${fromLat.toFixed(4)},${fromLng.toFixed(4)}->${toLat.toFixed(4)},${toLng.toFixed(4)}`;
    if (routeCache.has(cacheKey)) {
        return routeCache.get(cacheKey)!;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        // OSRM format: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=false
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'ThaiCareCenter/1.0',
            },
            next: { revalidate: 86400 }, // Cache 24 ชั่วโมงใน Next.js Data Cache
        });

        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data?.code === 'Ok' && data.routes?.[0]?.distance) {
                const distanceKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
                const durationMinutes = Math.round((data.routes[0].duration || 0) / 60);

                const result: RoadRouteResult = {
                    distanceKm,
                    durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
                    isRealRoadDistance: true,
                };

                routeCache.set(cacheKey, result);
                return result;
            }
        }
    } catch {
        // Fallback gracefully without breaking the page
    }

    const fallback: RoadRouteResult = {
        distanceKm: fallbackDistanceKm || 0,
        isRealRoadDistance: false,
    };
    return fallback;
}
