/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getCareCenters, saveCareCenters } from '../../../../lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const centerId = parseInt(id);
    const careCenters = await getCareCenters();
    const center = careCenters.find((c: any) => c.id === centerId);

    if (center) {
        return NextResponse.json(center);
    } else {
        return NextResponse.json({ message: 'Center not found' }, { status: 404 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const centerId = parseInt(id);
        const body = await request.json();
        const careCenters = await getCareCenters();
        const index = careCenters.findIndex((c: any) => c.id === centerId);

        if (index !== -1) {
            careCenters[index] = { ...careCenters[index], ...body, id: centerId };
            await saveCareCenters(careCenters);
            return NextResponse.json(careCenters[index]);
        } else {
            return NextResponse.json({ message: 'Center not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json(
            { message: 'Error updating care center' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const centerId = parseInt(id);
    const careCenters = await getCareCenters();
    const index = careCenters.findIndex((c: any) => c.id === centerId);

    if (index !== -1) {
        careCenters.splice(index, 1);
        await saveCareCenters(careCenters);
        return new NextResponse(null, { status: 204 });
    } else {
        return NextResponse.json({ message: 'Center not found' }, { status: 404 });
    }
}
