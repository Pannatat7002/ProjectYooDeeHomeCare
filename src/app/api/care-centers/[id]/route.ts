/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getCareCenters, updateCareCenter, deleteCareCenter } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const centerId = parseInt(id);
    const careCenters = await getCareCenters();
    const center = careCenters.find((c: any) => c.id === centerId || String(c.id) === id);

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

            // Anti-duplicate check by mophOrder
            if (body.mophOrder && Number(body.mophOrder) > 0) {
                const careCenters = await getCareCenters();
                const dupMoph = careCenters.find((c: any) => c.id !== centerId && Number(c.mophOrder) === Number(body.mophOrder));
                if (dupMoph) {
                    return NextResponse.json({
                        success: false,
                        message: `ตรวจพบข้อมูลซ้ำซ้อน: ลำดับที่ สบส. #${body.mophOrder} ถูกใช้งานแล้วโดยศูนย์ "${dupMoph.name}" (ID: ${dupMoph.id})`
                    }, { status: 409 });
                }
            }
            
            const success = await updateCareCenter(centerId, body);

            if (success) {
                return NextResponse.json({ success: true, data: { ...body, id: centerId } });
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
            
            const success = await deleteCareCenter(centerId);

            if (success) {
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
