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

// In-memory deduplication cache (prevents duplicate logs from React StrictMode or rapid double-clicks within 2 seconds)
const recentLogs = new Map<string, number>();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent') || '';
        const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const ip = anonymizeIp(rawIp);

        const visitorId = typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : '';
        const eventType = body.eventType || 'page_view';
        const pagePath = body.pagePath || '/';
        const centerId = body.centerId ? Number(body.centerId) : null;

        // Dedup check: ignore identical event from same visitor on same page within 2000ms
        const dedupKey = `${visitorId || ip}_${eventType}_${pagePath}_${centerId || ''}`;
        const lastLoggedTime = recentLogs.get(dedupKey);
        const now = Date.now();

        if (lastLoggedTime && now - lastLoggedTime < 2000) {
            return NextResponse.json({ success: true, deduped: true }, { status: 200 });
        }
        recentLogs.set(dedupKey, now);

        // Keep map clean if it grows large
        if (recentLogs.size > 2000) {
            for (const [key, time] of recentLogs.entries()) {
                if (now - time > 5000) recentLogs.delete(key);
            }
        }

        const newLog = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
            eventType,
            pagePath,
            centerId,
            centerName: body.centerName || '',
            visitorId,
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
            const { searchParams } = new URL(request.url);
            const limitParam = searchParams.get('limit');
            const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 2000), 10000) : 2000;
            const logs = await getTrafficLogs(limit);
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
