/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConsultations, saveConsultations } from '../../../../../lib/db';
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

            console.log(`🔄 PUT Request for Consultation ID: ${id} (Parsed: ${consultationId})`);
            console.log('📦 Body:', body);

            const consultations = await getConsultations();
            const index = consultations.findIndex((c: any) => c.id === consultationId);

            if (index !== -1) {
                console.log(`✅ Found consultation at index ${index}. Current status: ${consultations[index].status}`);

                consultations[index] = { ...consultations[index], ...body, id: consultationId };

                console.log(`📝 Updating to new status: ${consultations[index].status}`);

                await saveConsultations(consultations);

                console.log('💾 Saved consultations to file.');

                return NextResponse.json({
                    success: true,
                    message: `อัปเดตรายการ ID ${id} สำเร็จ`,
                    data: consultations[index],
                });
            } else {
                console.warn(`❌ Consultation ID ${consultationId} not found.`);
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
            const consultations = await getConsultations();
            const index = consultations.findIndex((c: any) => c.id === consultationId);

            if (index !== -1) {
                consultations.splice(index, 1);
                await saveConsultations(consultations);
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
