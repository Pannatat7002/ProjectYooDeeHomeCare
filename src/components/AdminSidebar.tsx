'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, LogOut } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50';

    return (
        <div className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-30">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-blue-900">Admin Panel</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <Link href="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard')}`}>
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                </Link>
                <Link href="/admin/manage" className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/manage')}`}>
                    <Database className="w-5 h-5 mr-3" />
                    จัดการข้อมูล
                </Link>
                <Link href="/admin/consultation" className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/consultation')}`}>
                    <Database className="w-5 h-5 mr-3" />
                    หน้าปรึกษา
                </Link>
            </nav>
            <div className="p-4 border-t">
                <Link href="/login" onClick={() => sessionStorage.removeItem('isLoggedIn')} className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    ออกจากระบบ
                </Link>
            </div>
        </div>
    );
}
