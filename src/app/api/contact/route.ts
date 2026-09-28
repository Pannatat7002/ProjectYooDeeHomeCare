import { NextRequest, NextResponse } from 'next/server';
import { getContacts, addContact } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const contacts = await getContacts();
            return NextResponse.json({ data: contacts });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return NextResponse.json({ message: 'Error fetching contacts' }, { status: 500 });
        }
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newContact = {
            id: Date.now(),
            ...body,
            submittedAt: new Date().toISOString(),
            status: 'new' // new, read, replied
        };

        await addContact(newContact);

        return NextResponse.json({ message: 'Message sent successfully', data: newContact }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { message: 'Error sending message' },
            { status: 500 }
        );
    }
}
