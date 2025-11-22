import { NextResponse } from 'next/server';
import { getCareCenters, saveCareCenters } from '../../../lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let careCenters = getCareCenters();

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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const careCenters = getCareCenters();

        const nextCenterId = careCenters.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? Math.max(...careCenters.map((c: any) => c.id)) + 1
            : 1;

        const newCenter = {
            id: nextCenterId,
            ...body,
        };

        careCenters.push(newCenter);
        saveCareCenters(careCenters);

        return NextResponse.json(newCenter, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error creating care center' },
            { status: 500 }
        );
    }
}
