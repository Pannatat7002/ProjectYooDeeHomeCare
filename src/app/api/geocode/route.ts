import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');

        if (!q || !q.trim()) {
            return NextResponse.json({ results: [] });
        }

        const cleanQ = q.trim();
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        // 1. Try Google Maps Geocoding API first if API key exists
        if (apiKey) {
            try {
                const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanQ)}&key=${apiKey}&language=th&region=th`;
                const gRes = await fetch(googleUrl, { next: { revalidate: 3600 } });
                if (gRes.ok) {
                    const gData = await gRes.json();
                    if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
                        const results = gData.results.map((item: any) => ({
                            name: item.formatted_address,
                            lat: item.geometry.location.lat,
                            lng: item.geometry.location.lng,
                        }));
                        return NextResponse.json({ results, source: 'google' });
                    }
                }
            } catch (gErr) {
                console.warn('Google Maps Geocoding error, falling back to Nominatim:', gErr);
            }
        }

        // 2. Fallback to OpenStreetMap Nominatim with direct query & Thailand country code
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQ)}&format=json&limit=6&countrycodes=th`;
        let res = await fetch(osmUrl, {
            headers: {
                'User-Agent': 'YooDeeHomeCare/1.1 (https://yoodeehomecare.com; admin@yoodeehomecare.com)',
                'Accept-Language': 'th,en;q=0.9',
            },
            next: { revalidate: 3600 }
        });

        if (res.ok) {
            let data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const results = data.map((item: any) => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                }));
                return NextResponse.json({ results, source: 'osm' });
            }
        }

        // 3. Fallback: try with ' ประเทศไทย' if first search yielded no results
        const osmFallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQ + ' ประเทศไทย')}&format=json&limit=6&countrycodes=th`;
        const resFallback = await fetch(osmFallbackUrl, {
            headers: {
                'User-Agent': 'YooDeeHomeCare/1.1 (https://yoodeehomecare.com; admin@yoodeehomecare.com)',
                'Accept-Language': 'th,en;q=0.9',
            },
            next: { revalidate: 3600 }
        });

        if (resFallback.ok) {
            const dataFallback = await resFallback.json();
            if (Array.isArray(dataFallback) && dataFallback.length > 0) {
                const results = dataFallback.map((item: any) => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                }));
                return NextResponse.json({ results, source: 'osm-th' });
            }
        }

        return NextResponse.json({ results: [] });
    } catch (error) {
        console.error('Geocode search error:', error);
        return NextResponse.json({ results: [] });
    }
}
