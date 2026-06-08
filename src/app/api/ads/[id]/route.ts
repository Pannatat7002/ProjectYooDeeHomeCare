/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { updateAd, deleteAd } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const adId = parseInt(id);
            const body = await request.json();

            const success = await updateAd(adId, body);

            if (success) {
                return NextResponse.json({ success: true, data: { ...body, id: adId } });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบโฆษณา' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error updating ad:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตโฆษณา' },
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
            const adId = parseInt(id);

            const success = await deleteAd(adId);

            if (success) {
                return NextResponse.json({ success: true, message: 'ลบโฆษณาสำเร็จ' });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบโฆษณา' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error deleting ad:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบโฆษณา' },
                { status: 500 }
            );
        }
    });
}
