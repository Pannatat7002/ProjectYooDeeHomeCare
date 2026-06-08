/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { updateContact, deleteContact } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    return requireAuth(request, async () => {
        try {
            const params = await context.params;
            const id = Number(params.id);
            const body = await request.json();
            
            const success = await updateContact(id, body);

            if (!success) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบข้อความนี้' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, message: 'อัปเดตข้อความสำเร็จ', data: { ...body, id } });
        } catch (err) {
            console.error('Error updating message:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อความ' },
                { status: 500 }
            );
        }
    });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    return requireAuth(request, async () => {
        try {
            const params = await context.params;
            const id = Number(params.id);
            
            const success = await deleteContact(id);

            if (!success) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบข้อความนี้' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, message: 'ลบข้อความสำเร็จ' });
        } catch (err) {
            console.error('Error deleting message:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบข้อความ' },
                { status: 500 }
            );
        }
    });
}
