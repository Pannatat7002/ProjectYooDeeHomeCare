/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // เพิ่ม hooks
import {
    LayoutDashboard,
    Database,
    LogOut,
    MessageSquare,
    ShieldCheck,
    User
} from 'lucide-react';

// กำหนด Type ของข้อมูล Admin ตาม JSON ที่ให้มา
interface AdminProfile {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    isActive: number;
    createdAt: string;
    lastLogin: string;
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    // State สำหรับเก็บข้อมูล Admin
    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

    // useEffect เพื่อดึงข้อมูลจาก localStorage หลัง Component โหลดเสร็จ (Client-side only)
    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            try {
                const parsedAdmin = JSON.parse(storedAdmin);
                setAdminProfile(parsedAdmin);
            } catch (error) {
                console.error("Failed to parse admin data:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        router.push('/login');
    };

    const isActive = (path: string) =>
        pathname === path
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
            : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600';

    return (
        <aside className="w-72 bg-white h-screen flex flex-col fixed left-0 top-0 z-30 border-r border-slate-100 shadow-xl transition-all duration-300">
            {/* 1. Header Logo */}
            <div className="p-8 pb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Panel</h1>
                    <p className="text-xs text-slate-400 font-medium">System Manager</p>
                </div>
            </div>

            {/* 2. Menu Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Menu
                </p>

                <Link href="/admin/dashboard" className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${isActive('/admin/dashboard')}`}>
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                </Link>

                <Link href="/admin/manage" className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${isActive('/admin/manage')}`}>
                    <Database className="w-5 h-5 mr-3" />
                    จัดการข้อมูล
                </Link>

                <Link href="/admin/consultation" className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${isActive('/admin/consultation')}`}>
                    <MessageSquare className="w-5 h-5 mr-3" />
                    หน้าปรึกษา
                </Link>
            </nav>

            {/* 3. User Profile & Logout Section */}
            <div className="p-4 border-t border-slate-100 bg-white">
                {/* ส่วนแสดงข้อมูล User (จะแสดงเมื่อโหลดข้อมูลเสร็จแล้ว) */}
                {adminProfile && (
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 font-bold text-lg">
                            {/* ดึงตัวอักษรแรกของ Username มาทำเป็น Avatar */}
                            {adminProfile.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-700 truncate">
                                {adminProfile.fullName || adminProfile.username}
                            </p>
                            <p className="text-xs text-slate-500 truncate font-medium">
                                {adminProfile.email}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200 group"
                >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    );
}