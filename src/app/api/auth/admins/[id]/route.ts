import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdmins, saveAdmins } from '../../../../../lib/db';
import { requireSuperAdmin } from '../../../../../lib/middleware';
import { Admin } from '../../../../../types/index';

/**
 * PUT /api/auth/admins/[id]
 * อัปเดตข้อมูล Admin (ต้องเป็น super_admin)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireSuperAdmin(request, async () => {
        try {
            const { id: idParam } = await params;
            const id = parseInt(idParam);
            const body = await request.json();
            const { username, password, email, fullName, role, isActive } = body;

            const admins: Admin[] = await getAdmins();
            const adminIndex = admins.findIndex((a) => a.id === id);

            if (adminIndex === -1) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบ Admin นี้' },
                    { status: 404 }
                );
            }

            // ตรวจสอบว่า username ซ้ำหรือไม่ (ยกเว้นตัวเอง)
            if (username && username !== admins[adminIndex].username) {
                const existingAdmin = admins.find((a) => a.username === username && a.id !== id);
                if (existingAdmin) {
                    return NextResponse.json(
                        { success: false, message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' },
                        { status: 400 }
                    );
                }
            }

            // อัปเดตข้อมูล
            if (username) admins[adminIndex].username = username;
            if (email) admins[adminIndex].email = email;
            if (fullName) admins[adminIndex].fullName = fullName;
            if (role) admins[adminIndex].role = role;
            if (typeof isActive === 'boolean') admins[adminIndex].isActive = isActive;

            // ถ้ามีการเปลี่ยนรหัสผ่าน
            if (password) {
                admins[adminIndex].password = await bcrypt.hash(password, 10);
            }

            await saveAdmins(admins);

            // ส่งข้อมูลกลับไป (ไม่รวม password)
            const { password: _pwd, ...adminWithoutPassword } = admins[adminIndex];

            return NextResponse.json({
                success: true,
                data: adminWithoutPassword,
                message: 'อัปเดต Admin สำเร็จ',
            });

        } catch (error) {
            console.error('Update admin error:', error);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดต Admin' },
                { status: 500 }
            );
        }
    });
}

/**
 * DELETE /api/auth/admins/[id]
 * ลบ Admin (ต้องเป็น super_admin)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireSuperAdmin(request, async () => {
        try {
            const { id: idParam } = await params;
            const id = parseInt(idParam);
            const admins: Admin[] = await getAdmins();

            const adminIndex = admins.findIndex((a) => a.id === id);

            if (adminIndex === -1) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบ Admin นี้' },
                    { status: 404 }
                );
            }

            // ป้องกันการลบ super_admin คนสุดท้าย
            const superAdmins = admins.filter((a) => a.role === 'super_admin');
            if (admins[adminIndex].role === 'super_admin' && superAdmins.length === 1) {
                return NextResponse.json(
                    { success: false, message: 'ไม่สามารถลบ Super Admin คนสุดท้ายได้' },
                    { status: 400 }
                );
            }

            // ลบ Admin
            admins.splice(adminIndex, 1);
            await saveAdmins(admins);

            return NextResponse.json({
                success: true,
                message: 'ลบ Admin สำเร็จ',
            });

        } catch (error) {
            console.error('Delete admin error:', error);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบ Admin' },
                { status: 500 }
            );
        }
    });
}
