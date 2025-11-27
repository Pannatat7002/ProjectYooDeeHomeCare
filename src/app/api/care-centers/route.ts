/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getCareCenters, saveCareCenters } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let careCenters = await getCareCenters();

    const hasGovernmentCertificate = searchParams.get('hasGovernmentCertificate');
    if (hasGovernmentCertificate !== null) {
        careCenters = careCenters.filter((c: any) => c.hasGovernmentCertificate === (hasGovernmentCertificate === 'true'));
    }

    const brandName = searchParams.get('brandName');
    if (brandName) {
        careCenters = careCenters.filter((c: any) => c.brandName === brandName);
    }

    const type = searchParams.get('type');
    if (type) {
        careCenters = careCenters.filter((c: any) => c.type === type);
    }

    const name = searchParams.get('name');
    if (name) {
        careCenters = careCenters.filter((c: any) => c.name === name);
    }


    return NextResponse.json(careCenters);
}

export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const body = await request.json();
            const careCenters = await getCareCenters();

            const nextCenterId = careCenters.length > 0
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? Math.max(...careCenters.map((c: any) => c.id)) + 1
                : 1;

            const newCenter = {
                id: nextCenterId,
                ...body,
            };

            careCenters.push(newCenter);
            await saveCareCenters(careCenters);

            return NextResponse.json({ success: true, data: newCenter }, { status: 201 });
        } catch (err) {
            console.error('Error creating care center:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการสร้างศูนย์ดูแล' },
                { status: 500 }
            );
        }
    });
}
