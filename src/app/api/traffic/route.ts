import { NextRequest, NextResponse } from 'next/server';
import { getTrafficLogs, addTrafficLog } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent') || '';
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

        const newLog = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
            eventType: body.eventType || 'page_view',
            pagePath: body.pagePath || '/',
            centerId: body.centerId ? Number(body.centerId) : '',
            centerName: body.centerName || '',
            utmSource: body.utmSource || '',
            utmMedium: body.utmMedium || '',
            utmCampaign: body.utmCampaign || '',
            referrer: body.referrer || '',
            userAgent,
            ip
        };

        await addTrafficLog(newLog);

        return NextResponse.json({ success: true, data: newLog }, { status: 201 });
    } catch (error) {
        console.error('Error logging traffic:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to record traffic log' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const logs = await getTrafficLogs();
            // Sort by timestamp descending
            const sortedLogs = [...logs].sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
            return NextResponse.json({ success: true, data: sortedLogs });
        } catch (error) {
            console.error('Error fetching traffic logs:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch traffic logs' },
                { status: 500 }
            );
        }
    });
}
