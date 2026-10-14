/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getTrafficLogs, addTrafficLog } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

export const dynamic = 'force-dynamic';

// Helper to anonymize IP address for PDPA compliance (masks the last octet)
function anonymizeIp(ip: string): string {
    if (!ip) return '';
    const cleanIp = ip.split(',')[0].trim();
    if (cleanIp.includes('.')) {
        // IPv4: e.g. 192.168.1.55 -> 192.168.1.xxx
        const parts = cleanIp.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
        }
    } else if (cleanIp.includes(':')) {
        // IPv6
        const parts = cleanIp.split(':');
        if (parts.length > 3) {
            return `${parts.slice(0, 3).join(':')}:xxxx:xxxx`;
        }
    }
    return cleanIp;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent') || '';
        const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const ip = anonymizeIp(rawIp);

        const newLog = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
            eventType: body.eventType || 'page_view',
            pagePath: body.pagePath || '/',
            centerId: body.centerId ? Number(body.centerId) : null,
            centerName: body.centerName || '',
            visitorId: typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : '',
            sessionId: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : '',
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
            const sortedLogs = [...logs].sort((a: any, b: any) => {
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
