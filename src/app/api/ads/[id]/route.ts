import { NextRequest, NextResponse } from 'next/server';
import { getAds, saveAds } from '../../../../lib/db';
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

            const ads = await getAds();
            const index = ads.findIndex((a: any) => a.id === adId);

            if (index !== -1) {
                // Update existing ad
                ads[index] = { ...ads[index], ...body, id: adId };
                await saveAds(ads);
                return NextResponse.json({ success: true, data: ads[index] });
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

            const ads = await getAds();
            const index = ads.findIndex((a: any) => a.id === adId);

            if (index !== -1) {
                ads.splice(index, 1);
                await saveAds(ads);
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
