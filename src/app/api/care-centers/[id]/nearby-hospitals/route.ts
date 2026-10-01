import { NextResponse } from 'next/server';
import { getNearbyHospitalsByCenterId, getCareCenters } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const centerId = parseInt(id, 10);

        if (isNaN(centerId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid center ID' },
                { status: 400 }
            );
        }

        const centers = await getCareCenters();
        const center = centers.find((c: any) => c.id === centerId);

        const nearbyHospitals = await getNearbyHospitalsByCenterId(
            centerId,
            center?.lat ? Number(center.lat) : undefined,
            center?.lng ? Number(center.lng) : undefined
        );

        return NextResponse.json({
            success: true,
            centerId,
            data: nearbyHospitals,
        });
    } catch (error) {
        console.error('[API nearby-hospitals] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
