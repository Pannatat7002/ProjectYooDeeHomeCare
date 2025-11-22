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
        const consultations = getConsultations();
        const index = consultations.findIndex((c: any) => c.id === consultationId);

        if (index !== -1) {
            consultations[index] = { ...consultations[index], ...body, id: consultationId };
            saveConsultations(consultations);

            return NextResponse.json({
                success: true,
                message: `อัปเดตรายการ ID ${id} สำเร็จ`,
                data: consultations[index],
            });
        } else {
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
        const consultations = getConsultations();
        const index = consultations.findIndex((c: any) => c.id === consultationId);

        if (index !== -1) {
            consultations.splice(index, 1);
            saveConsultations(consultations);
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
