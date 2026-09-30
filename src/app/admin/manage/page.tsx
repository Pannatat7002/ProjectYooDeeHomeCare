/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CalendarCheck, MessageSquare, FileText, Megaphone, Shield } from 'lucide-react';
import { getAdmin, isAuthenticated, AdminData } from '../../../lib/auth-client';

// Import components
import ManageAdminPage from './components/ManageAdminPage';
import ManageCenterPage from './components/ManageCenterPage';
import ManageBlogPage from './components/ManageBlogPage';
import ManageAdsPage from './components/ManageAdsPage';
import ConsultationManagement from './components/ConsultationManagement';
import ContactMessageManagement from './components/ContactMessageManagement';

type TabType = 'centers' | 'consultations' | 'contacts' | 'blogs' | 'admins' | 'ads';

export default function AdminManagePage() {
    const router = useRouter();
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState<AdminData | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('centers');

    // ตรวจสอบ authentication
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        const admin = getAdmin();
        if (admin) {
            setCurrentAdmin(admin);
        }

        setIsAuthChecking(false);
    }, [router]);

    if (isAuthChecking) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'centers' as TabType, label: 'ศูนย์ดูแล', icon: Building2 },
        { id: 'consultations' as TabType, label: 'นัดเยี่ยมชมศูนย์', icon: CalendarCheck },
        { id: 'contacts' as TabType, label: 'ข้อความติดต่อ', icon: MessageSquare },
        { id: 'blogs' as TabType, label: 'บทความ', icon: FileText },
        { id: 'ads' as TabType, label: 'โฆษณา (Ads)', icon: Megaphone },
        ...(currentAdmin?.role === 'super_admin'
            ? [{ id: 'admins' as TabType, label: 'ผู้ดูแลระบบ', icon: Shield }]
            : []
        ),
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    จัดการข้อมูลระบบ (Management)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    ระบบจัดการข้อมูลศูนย์ดูแลผู้สูงอายุ, คำขอนัดหมายเยี่ยมชม, ข้อความติดต่อ, บทความ และสื่อโฆษณา
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-1.5 overflow-x-auto scrollbar-hide">
                <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Body */}
            <div>
                {activeTab === 'centers' && <ManageCenterPage />}
                {activeTab === 'consultations' && <ConsultationManagement />}
                {activeTab === 'contacts' && <ContactMessageManagement />}
                {activeTab === 'blogs' && <ManageBlogPage />}
                {activeTab === 'ads' && <ManageAdsPage />}
                {activeTab === 'admins' && currentAdmin?.role === 'super_admin' && <ManageAdminPage />}
            </div>
        </div>
    );
}