/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard,
    Activity,
    CalendarCheck,
    MessageSquare,
    Building2,
    FileText,
    Megaphone,
    Shield,
    ShieldCheck,
    LogOut,
    X
} from 'lucide-react';

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

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

function AdminSidebarInner({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'centers';

    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

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
        onClose?.();
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        router.push('/login');
    };

    const isLinkActive = (path: string, tabId?: string) => {
        if (tabId) {
            return pathname === '/admin/manage' && currentTab === tabId;
        }
        return pathname === path;
    };

    const linkClasses = (active: boolean) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
            active
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`;

    return (
        <aside
            className={`w-72 bg-white h-screen flex flex-col fixed left-0 top-0 z-40 border-r border-slate-100 shadow-xl transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
            {/* 1. Header Logo & Mobile Close */}
            <div className="p-6 pb-5 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Admin Panel</h1>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">ThaiCareCenter System</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 2. Categorized Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
                {/* หมวด 1: แผงควบคุม (Overview) */}
                <div>
                    <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        แผงควบคุม (Overview)
                    </p>
                    <div className="space-y-1">
                        <Link
                            href="/admin/dashboard"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/dashboard'))}
                        >
                            <LayoutDashboard className="w-4 h-4 shrink-0" />
                            <span>แดชบอร์ด</span>
                        </Link>

                        <Link
                            href="/admin/traffic"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/traffic'))}
                        >
                            <Activity className="w-4 h-4 shrink-0" />
                            <span>วิเคราะห์ Traffic</span>
                        </Link>
                    </div>
                </div>

                {/* หมวด 2: ลูกค้า & การนัดหมาย (Leads & CRM) */}
                <div>
                    <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        ลูกค้า & การนัดหมาย
                    </p>
                    <div className="space-y-1">
                        <Link
                            href="/admin/manage?tab=consultations"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/manage', 'consultations'))}
                        >
                            <CalendarCheck className="w-4 h-4 shrink-0" />
                            <span>นัดเยี่ยมชมศูนย์</span>
                        </Link>

                        <Link
                            href="/admin/manage?tab=contacts"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/manage', 'contacts'))}
                        >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span>ข้อความติดต่อ</span>
                        </Link>
                    </div>
                </div>

                {/* หมวด 3: ข้อมูล & คอนเทนต์ (Directory & Content) */}
                <div>
                    <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        ข้อมูล & คอนเทนต์
                    </p>
                    <div className="space-y-1">
                        <Link
                            href="/admin/manage?tab=centers"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/manage', 'centers'))}
                        >
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span>ศูนย์ดูแลผู้สูงอายุ</span>
                        </Link>

                        <Link
                            href="/admin/manage?tab=blogs"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/manage', 'blogs'))}
                        >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>บทความความรู้</span>
                        </Link>

                        <Link
                            href="/admin/manage?tab=ads"
                            onClick={onClose}
                            className={linkClasses(isLinkActive('/admin/manage', 'ads'))}
                        >
                            <Megaphone className="w-4 h-4 shrink-0" />
                            <span>สื่อโฆษณา (Ads)</span>
                        </Link>
                    </div>
                </div>

                {/* หมวด 4: ระบบ (Settings - เฉพาะ Super Admin) */}
                {adminProfile?.role === 'super_admin' && (
                    <div>
                        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            ระบบ (Settings)
                        </p>
                        <div className="space-y-1">
                            <Link
                                href="/admin/manage?tab=admins"
                                onClick={onClose}
                                className={linkClasses(isLinkActive('/admin/manage', 'admins'))}
                            >
                                <Shield className="w-4 h-4 shrink-0" />
                                <span>ผู้ดูแลระบบ</span>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* 3. User Profile & Logout Section */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                {adminProfile && (
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 font-bold text-sm shrink-0">
                            {adminProfile.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                                {adminProfile.fullName || adminProfile.username}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                                {adminProfile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors duration-200"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    );
}

export default function AdminSidebar(props: AdminSidebarProps) {
    return (
        <Suspense fallback={<aside className="w-72 bg-white h-screen fixed left-0 top-0 z-40 border-r border-slate-100 shadow-xl" />}>
            <AdminSidebarInner {...props} />
        </Suspense>
    );
}