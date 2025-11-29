/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getInterested, saveInterested } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

export async function GET() {
    try {
        const interestedItems = await getInterested();
        return NextResponse.json(interestedItems);
    } catch (err) {
        console.error('Error fetching interested items:', err);
        return NextResponse.json(
            { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const body = await request.json();
            const interestedItems = await getInterested();

            const nextId = interestedItems.length > 0
                ? Math.max(...interestedItems.map((c: any) => c.id)) + 1
                : 1;

            const newItem = {
                id: nextId,
                ...body,
                createdAt: new Date().toISOString(),
            };

            interestedItems.push(newItem);
            await saveInterested(interestedItems);

            return NextResponse.json({ success: true, data: newItem }, { status: 201 });
        } catch (err) {
            console.error('Error creating interested item:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการสร้างข้อมูล' },
                { status: 500 }
            );
        }
    });
}
