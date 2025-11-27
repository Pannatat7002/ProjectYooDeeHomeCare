/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getCareCenters, saveCareCenters } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

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
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const centerId = parseInt(id);
            const body = await request.json();
            const careCenters = await getCareCenters();
            const index = careCenters.findIndex((c: any) => c.id === centerId);

            if (index !== -1) {
                careCenters[index] = { ...careCenters[index], ...body, id: centerId };
                await saveCareCenters(careCenters);
                return NextResponse.json({ success: true, data: careCenters[index] });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบศูนย์ดูแลนี้' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error updating care center:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตศูนย์ดูแล' },
                { status: 500 }
            );
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const centerId = parseInt(id);
            const careCenters = await getCareCenters();
            const index = careCenters.findIndex((c: any) => c.id === centerId);

            if (index !== -1) {
                careCenters.splice(index, 1);
                await saveCareCenters(careCenters);
                return NextResponse.json({ success: true, message: 'ลบศูนย์ดูแลสำเร็จ' });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบศูนย์ดูแลนี้' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error deleting care center:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบศูนย์ดูแล' },
                { status: 500 }
            );
        }
    });
}
