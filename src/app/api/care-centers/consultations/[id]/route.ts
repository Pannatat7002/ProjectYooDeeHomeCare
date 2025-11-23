/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getConsultations, saveConsultations } from '../../../../../lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error updating consultation' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const consultationId = Number(id);
        const consultations = await getConsultations();
        const index = consultations.findIndex((c: any) => c.id === consultationId);

        if (index !== -1) {
            consultations.splice(index, 1);
            await saveConsultations(consultations);
            return new NextResponse(null, { status: 204 });
        } else {
            return NextResponse.json(
                { success: false, message: 'ไม่พบรายการปรึกษา' },
                { status: 404 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error deleting consultation' },
            { status: 500 }
        );
    }
}
