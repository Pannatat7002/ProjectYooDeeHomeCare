import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';
import { JWTPayload } from '../types';


export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

/**
 * Middleware สำหรับตรวจสอบ authentication
 * ใช้ใน API routes ที่ต้องการการ login
 */
export async function requireAuth(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return NextResponse.json(
            { success: false, message: 'ไม่พบ token การยืนยันตัวตน' },
            { status: 401 }
        );
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.json(
            { success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
            { status: 401 }
        );
    }

    // เพิ่ม user data ใน request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    return handler(authenticatedRequest);
}

/**
 * Middleware สำหรับตรวจสอบว่าเป็น super_admin
 */
export async function requireSuperAdmin(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    return requireAuth(request, async (req) => {
        if (req.user?.role !== 'super_admin') {
            return NextResponse.json(
                { success: false, message: 'ต้องการสิทธิ์ Super Admin' },
                { status: 403 }
            );
        }
        return handler(req);
    });
}
