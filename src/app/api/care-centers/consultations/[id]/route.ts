import { NextRequest, NextResponse } from 'next/server';
import { updateConsultation, deleteConsultation } from '../../../../../lib/db';
import { requireAuth } from '../../../../../lib/middleware';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const consultationId = Number(id);
            const body = await request.json();

            const success = await updateConsultation(consultationId, body);

            if (success) {
                return NextResponse.json({
                    success: true,
                    message: `อัปเดตรายการ ID ${id} สำเร็จ`,
                    data: { ...body, id: consultationId },
                });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบรายการปรึกษา' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error updating consultation:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตรายการปรึกษา' },
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
            const consultationId = Number(id);
            const success = await deleteConsultation(consultationId);

            if (success) {
                return NextResponse.json({ success: true, message: 'ลบรายการปรึกษาสำเร็จ' });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบรายการปรึกษา' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error deleting consultation:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบรายการปรึกษา' },
                { status: 500 }
            );
        }
    });
}
