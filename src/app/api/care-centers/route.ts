import { NextRequest, NextResponse } from 'next/server';
import { getCareCenters, addCareCenter } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';
import { CareCenter } from '../../../types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let careCenters: CareCenter[] = await getCareCenters();

    const hasGovernmentCertificate = searchParams.get('hasGovernmentCertificate');
    if (hasGovernmentCertificate !== null) {
        careCenters = careCenters.filter((c: CareCenter) => c.hasGovernmentCertificate === (hasGovernmentCertificate === 'true'));
    }

    const brandName = searchParams.get('brandName');
    if (brandName) {
        careCenters = careCenters.filter((c: CareCenter) => c.brandName === brandName);
    }

    const type = searchParams.get('type');
    if (type) {
        careCenters = careCenters.filter((c: CareCenter) => c.type === type);
    }

    const name = searchParams.get('name');
    if (name) {
        careCenters = careCenters.filter((c: CareCenter) => c.name === name);
    }

    const status = searchParams.get('status');
    if (status) {
        careCenters = careCenters.filter((c: CareCenter) => c.status === status);
    }


    return NextResponse.json(careCenters);
}

export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const body = await request.json();
            const careCenters: CareCenter[] = await getCareCenters();

            const nextCenterId = careCenters.length > 0
                ? Math.max(...careCenters.map((c: CareCenter) => c.id)) + 1
                : 1;

            const newCenter = {
                id: nextCenterId,
                ...body,
            };

            await addCareCenter(newCenter);

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
