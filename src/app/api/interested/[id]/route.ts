/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getInterested, saveInterested } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const itemId = parseInt(id);
            const body = await request.json();
            const interestedItems = await getInterested();
            const index = interestedItems.findIndex((c: any) => c.id === itemId);

            if (index !== -1) {
                // Keep the original id and createdAt unless explicitly changed (usually not)
                interestedItems[index] = { ...interestedItems[index], ...body, id: itemId };
                await saveInterested(interestedItems);
                return NextResponse.json({ success: true, data: interestedItems[index] });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบข้อมูล' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error updating interested item:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
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
            const itemId = parseInt(id);
            const interestedItems = await getInterested();
            const index = interestedItems.findIndex((c: any) => c.id === itemId);

            if (index !== -1) {
                interestedItems.splice(index, 1);
                await saveInterested(interestedItems);
                return NextResponse.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบข้อมูล' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error deleting interested item:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
                { status: 500 }
            );
        }
    });
}
