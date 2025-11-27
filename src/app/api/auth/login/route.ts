import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdmins, saveAdmins } from '../../../../lib/db';
import { createToken } from '../../../../lib/auth';
import { Admin, AdminLoginRequest, AdminLoginResponse } from '../../../../types';

/**
 * POST /api/auth/login
 * ใช้สำหรับ login ของ Admin
 */
export async function POST(request: NextRequest) {
    try {
        const body: AdminLoginRequest = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' } as AdminLoginResponse,
                { status: 400 }
            );
        }

        // ดึงข้อมูล Admin ทั้งหมด
        const admins: Admin[] = await getAdmins();

        // ค้นหา Admin ที่ตรงกับ username
        const admin = admins.find((a) => a.username === username);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } as AdminLoginResponse,
                { status: 401 }
            );
        }

        // ตรวจสอบว่า account ยังใช้งานได้หรือไม่
        if (!admin.isActive) {
            return NextResponse.json(
                { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน' } as AdminLoginResponse,
                { status: 403 }
            );
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } as AdminLoginResponse,
                { status: 401 }
            );
        }

        // อัปเดต lastLogin
        admin.lastLogin = new Date().toISOString();
        await saveAdmins(admins);

        // สร้าง JWT token
        const token = await createToken({
            adminId: admin.id,
            username: admin.username,
            role: admin.role,
        });

        // ส่งข้อมูล admin กลับไป (ไม่รวม password)
        const { password: _pwd, ...adminWithoutPassword } = admin;

        return NextResponse.json({
            success: true,
            token,
            admin: adminWithoutPassword,
            message: 'เข้าสู่ระบบสำเร็จ',
        } as AdminLoginResponse);

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' } as AdminLoginResponse,
            { status: 500 }
        );
    }
}
