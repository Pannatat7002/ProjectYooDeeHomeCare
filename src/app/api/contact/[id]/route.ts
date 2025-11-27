import { NextResponse, NextRequest } from 'next/server';
import { getContacts, saveContacts } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    return requireAuth(request, async () => {
        try {
            const params = await context.params;
            const id = Number(params.id);
            const body = await request.json();
            const contacts = await getContacts();
            const index = contacts.findIndex((c: any) => c.id === id);

            if (index === -1) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบข้อความนี้' },
                    { status: 404 }
                );
            }

            contacts[index] = { ...contacts[index], ...body };
            await saveContacts(contacts);

            return NextResponse.json({ success: true, message: 'อัปเดตข้อความสำเร็จ', data: contacts[index] });
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
            let contacts = await getContacts();
            const initialLength = contacts.length;
            contacts = contacts.filter((c: any) => c.id !== id);

            if (contacts.length === initialLength) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบข้อความนี้' },
                    { status: 404 }
                );
            }

            await saveContacts(contacts);
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
