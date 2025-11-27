/**
 * Script สำหรับสร้าง Super Admin คนแรก
 * รันด้วย: npm run create-super-admin
 */

import bcrypt from 'bcryptjs';
import { getAdmins, saveAdmins } from '../src/lib/db';
import { Admin } from '../src/types';

async function createSuperAdmin() {
    try {
        console.log('🔐 กำลังสร้าง Super Admin...');

        const admins: Admin[] = await getAdmins();

        // ตรวจสอบว่ามี super_admin อยู่แล้วหรือไม่
        const existingSuperAdmin = admins.find((a) => a.role === 'super_admin');
        if (existingSuperAdmin) {
            console.log('⚠️  มี Super Admin อยู่แล้ว:', existingSuperAdmin.username);
            console.log('ถ้าต้องการสร้างใหม่ กรุณาลบ Super Admin เดิมออกจาก Google Sheets ก่อน');
            return;
        }

        // ข้อมูล Super Admin เริ่มต้น
        const username = 'admin';
        const password = 'Admin@123456'; // รหัสผ่านเริ่มต้น (ควรเปลี่ยนหลัง login ครั้งแรก)
        const email = 'admin@yoodee.com';
        const fullName = 'Super Administrator';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้าง ID ใหม่
        const newId = admins.length > 0 ? Math.max(...admins.map((a) => a.id)) + 1 : 1;

        // สร้าง Super Admin
        const superAdmin: Admin = {
            id: newId,
            username,
            password: hashedPassword,
            email,
            fullName,
            role: 'super_admin',
            isActive: true,
            createdAt: new Date().toISOString(),
        };

        admins.push(superAdmin);
        await saveAdmins(admins);

        console.log('✅ สร้าง Super Admin สำเร็จ!');
        console.log('');
        console.log('📋 ข้อมูล Login:');
        console.log('   Username:', username);
        console.log('   Password:', password);
        console.log('');
        console.log('⚠️  กรุณาเปลี่ยนรหัสผ่านหลังจาก login ครั้งแรก!');

    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
        process.exit(1);
    }
}

createSuperAdmin();
