import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdmins, saveAdmins } from '../../../../lib/db';
import { requireAuth, requireSuperAdmin } from '../../../../lib/middleware';
import { Admin } from '../../../../types';

/**
 * GET /api/auth/admins
 * ดึงรายการ Admin ทั้งหมด (ต้อง login)
 */
export async function GET(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const admins: Admin[] = await getAdmins();

            // ไม่ส่ง password กลับไป
            const adminsWithoutPassword = admins.map(({ password: _pwd, ...admin }) => admin);

            return NextResponse.json({
                success: true,
                data: adminsWithoutPassword,
            });
        } catch (error) {
            console.error('Get admins error:', error);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
                { status: 500 }
            );
        }
    });
}

/**
 * POST /api/auth/admins
 * สร้าง Admin ใหม่ (ต้องเป็น super_admin)
 */
export async function POST(request: NextRequest) {
    return requireSuperAdmin(request, async () => {
        try {
            const body = await request.json();
            const { username, password, email, fullName, role } = body;

            // Validation
            if (!username || !password || !email || !fullName) {
                return NextResponse.json(
                    { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
                    { status: 400 }
                );
            }

            const admins: Admin[] = await getAdmins();

            // ตรวจสอบว่า username ซ้ำหรือไม่
            const existingAdmin = admins.find((a) => a.username === username);
            if (existingAdmin) {
                return NextResponse.json(
                    { success: false, message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' },
                    { status: 400 }
                );
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // สร้าง ID ใหม่
            const newId = admins.length > 0 ? Math.max(...admins.map((a) => a.id)) + 1 : 1;

            // สร้าง Admin ใหม่
            const newAdmin: Admin = {
                id: newId,
                username,
                password: hashedPassword,
                email,
                fullName,
                role: role || 'admin',
                isActive: true,
                createdAt: new Date().toISOString(),
            };

            admins.push(newAdmin);
            await saveAdmins(admins);

            // ส่งข้อมูลกลับไป (ไม่รวม password)
            const { password: _pwd, ...adminWithoutPassword } = newAdmin;

            return NextResponse.json({
                success: true,
                data: adminWithoutPassword,
                message: 'สร้าง Admin สำเร็จ',
            });

        } catch (error) {
            console.error('Create admin error:', error);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการสร้าง Admin' },
                { status: 500 }
            );
        }
    });
}
