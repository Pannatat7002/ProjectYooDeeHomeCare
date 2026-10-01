import { NextResponse } from 'next/server';
import { getHospitals } from '../../../lib/db';
import { INITIAL_HOSPITALS } from '../../../lib/hospitalProximity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = (searchParams.get('q') || '').trim().toLowerCase();
        const province = searchParams.get('province');
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        let hospitals = await getHospitals();
        if (!hospitals || hospitals.length === 0) {
            hospitals = INITIAL_HOSPITALS;
        }

        let filtered = hospitals;

        if (q) {
            filtered = filtered.filter((h: any) =>
                (h.nameTh && h.nameTh.toLowerCase().includes(q)) ||
                (h.nameEn && h.nameEn.toLowerCase().includes(q)) ||
                (h.district && h.district.toLowerCase().includes(q)) ||
                (h.province && h.province.toLowerCase().includes(q))
            );
        }

        if (province && province !== 'all') {
            filtered = filtered.filter((h: any) => h.province === province);
        }

        const data = filtered.slice(0, limit);

        return NextResponse.json({
            success: true,
            total: filtered.length,
            data,
        });
    } catch (error) {
        console.error('[API /api/hospitals] Error:', error);
        return NextResponse.json({
            success: true,
            total: INITIAL_HOSPITALS.length,
            data: INITIAL_HOSPITALS.slice(0, 50),
        });
    }
}
