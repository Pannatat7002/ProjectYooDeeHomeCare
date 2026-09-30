/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAdmin, isAuthenticated, AdminData } from '../../../lib/auth-client';

// Import components
import ManageAdminPage from './components/ManageAdminPage';
import ManageCenterPage from './components/ManageCenterPage';
import ManageBlogPage from './components/ManageBlogPage';
import ManageAdsPage from './components/ManageAdsPage';
import ConsultationManagement from './components/ConsultationManagement';
import ContactMessageManagement from './components/ContactMessageManagement';

type TabType = 'centers' | 'consultations' | 'contacts' | 'blogs' | 'admins' | 'ads';

const TAB_DESCRIPTIONS: Record<TabType, { title: string; subtitle: string }> = {
    centers: {
        title: 'จัดการข้อมูลศูนย์ดูแลผู้สูงอายุ',
        subtitle: 'เพิ่ม แก้ไข รายชื่อศูนย์ บริการ ราคา และข้อมูลติดต่อทั้งหมดในระบบ',
    },
    consultations: {
        title: 'จัดการคำขอนัดเยี่ยมชมศูนย์ (Leads)',
        subtitle: 'ติดตามรายชื่อผู้สนใจจองคิวนัดหมาย หรือขอคำปรึกษาพร้อมสถานะการติดต่อ',
    },
    contacts: {
        title: 'ข้อความติดต่อจากผู้ใช้งาน',
        subtitle: 'กล่องข้อความสอบถามทั่วไป ข้อเสนอแนะ หรือคำขอความช่วยเหลือจากหน้าเว็บ',
    },
    blogs: {
        title: 'จัดการบทความและสาระความรู้',
        subtitle: 'เขียนและเผยแพร่บทความเกี่ยวกับการดูแลผู้สูงอายุเพื่อสร้างความน่าเชื่อถือและ SEO',
    },
    ads: {
        title: 'จัดการแบนเนอร์และสื่อโฆษณา',
        subtitle: 'จัดการตำแหน่งป้ายโฆษณา แบนเนอร์พาร์ทเนอร์ และสถิติการแสดงผล',
    },
    admins: {
        title: 'จัดการสิทธิ์ผู้ดูแลระบบ',
        subtitle: 'กำหนดบัญชีผู้ดูแล เพิ่ม/ระงับสิทธิ์การเข้าถึงข้อมูลระบบ (เฉพาะ Super Admin)',
    },
};

function AdminManageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState<AdminData | null>(null);

    const initialTab = (searchParams.get('tab') as TabType) || 'centers';
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    // Sync state when URL query parameter changes
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') as TabType;
        const validTabs: TabType[] = ['centers', 'consultations', 'contacts', 'blogs', 'ads', 'admins'];
        if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams, activeTab]);

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
                    <p className="text-sm text-slate-500 font-medium">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    const currentMeta = TAB_DESCRIPTIONS[activeTab] || TAB_DESCRIPTIONS.centers;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="border-b border-slate-200/80 pb-5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    {currentMeta.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {currentMeta.subtitle}
                </p>
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

export default function AdminManagePage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-500 font-medium">กำลังโหลดโมดูลการจัดการ...</p>
                    </div>
                </div>
            }
        >
            <AdminManageContent />
        </Suspense>
    );
}