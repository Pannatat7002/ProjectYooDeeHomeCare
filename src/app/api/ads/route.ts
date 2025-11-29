/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getAds, addAd } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

// GET is public - anyone can view ads
export async function GET() {
    try {
        const ads = await getAds();
        return NextResponse.json(ads);
    } catch (err) {
        console.error('Error fetching ads:', err);
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }
}

// POST requires authentication - only admins can create ads
export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const body = await request.json();
            const ads = await getAds();

            // Generate new ID
            const nextId = ads.length > 0
                ? Math.max(...ads.map((a: any) => a.id)) + 1
                : 1;

            const newAd = {
                id: nextId,
                ...body,
                createdAt: new Date().toISOString()
            };

            console.log('Creating new ad:', newAd);
            await addAd(newAd);
            console.log('✅ Ad created successfully');

            return NextResponse.json({ success: true, data: newAd }, { status: 201 });
        } catch (err) {
            console.error('❌ Error creating ad:', err);
            // Log detailed error for debugging
            if (err instanceof Error) {
                console.error('Error message:', err.message);
                console.error('Error stack:', err.stack);
            }
            return NextResponse.json(
                {
                    success: false,
                    message: 'เกิดข้อผิดพลาดในการสร้างโฆษณา',
                    error: err instanceof Error ? err.message : 'Unknown error'
                },
                { status: 500 }
            );
        }
    });
}
