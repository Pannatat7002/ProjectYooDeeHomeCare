import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '../types';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * สร้าง JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // token หมดอายุใน 7 วัน
        .sign(secret);

    return token;
}

/**
 * ตรวจสอบและ decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JWTPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}


/**
 * ดึง token จาก Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
