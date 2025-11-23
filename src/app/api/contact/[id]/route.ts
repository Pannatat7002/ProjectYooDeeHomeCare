import { NextResponse, NextRequest } from 'next/server';
import { getContacts, saveContacts } from '../../../../lib/db';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = Number(params.id);
        const body = await request.json();
        const contacts = await getContacts();
        const index = contacts.findIndex((c: any) => c.id === id);

        if (index === -1) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }

        contacts[index] = { ...contacts[index], ...body };
        await saveContacts(contacts);

        return NextResponse.json({ message: 'Message updated', data: contacts[index] });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating message' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = Number(params.id);
        let contacts = await getContacts();
        const initialLength = contacts.length;
        contacts = contacts.filter((c: any) => c.id !== id);

        if (contacts.length === initialLength) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }

        await saveContacts(contacts);
        return NextResponse.json({ message: 'Message deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting message' }, { status: 500 });
    }
}
