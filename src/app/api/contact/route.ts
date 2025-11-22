import { NextResponse } from 'next/server';
import { getContacts, saveContacts } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const contacts = getContacts();
    return NextResponse.json({ data: contacts });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const contacts = getContacts();

        const newContact = {
            id: Date.now(),
            ...body,
            submittedAt: new Date().toISOString(),
            status: 'new' // new, read, replied
        };

        contacts.push(newContact);
        saveContacts(contacts);

        return NextResponse.json({ message: 'Message sent successfully', data: newContact }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error sending message' },
            { status: 500 }
        );
    }
}
