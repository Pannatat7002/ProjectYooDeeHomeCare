/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, User as UserIcon, Settings } from 'lucide-react';
import { getAdmin, isAuthenticated, logout, AdminData } from '../../../lib/auth-client';

// Import components
import ManageAdminPage from './components/ManageAdminPage';
import ManageCenterPage from './components/ManageCenterPage';
import ManageBlogPage from './components/ManageBlogPage';
import ConsultationManagement from './components/ConsultationManagement';
import ContactMessageManagement from './components/ContactMessageManagement';

type TabType = 'centers' | 'consultations' | 'contacts' | 'blogs' | 'admins';

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

    const handleLogout = () => {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            logout();
        }
    };

    if (isAuthChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'centers' as TabType, label: 'ศูนย์ดูแล', icon: Settings },
        { id: 'consultations' as TabType, label: 'คำปรึกษา', icon: UserIcon },
        { id: 'contacts' as TabType, label: 'ข้อความติดต่อ', icon: UserIcon },
        { id: 'blogs' as TabType, label: 'บทความ', icon: Settings },
        ...(currentAdmin?.role === 'super_admin'
            ? [{ id: 'admins' as TabType, label: 'จัดการ Admin', icon: Shield }]
            : []
        ),
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Admin Info */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Admin Panel
                                </h1>
                                <p className="text-xs text-gray-500">
                                    YooDee HomeCare Management System
                                </p>
                            </div>
                        </div>

                        {/* {currentAdmin && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {currentAdmin.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center justify-end">
                                        <UserIcon className="w-3 h-3 mr-1" />
                                        {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">ออกจากระบบ</span>
                                </button>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                                    ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'centers' && <ManageCenterPage />}
                {activeTab === 'consultations' && <ConsultationManagement />}
                {activeTab === 'contacts' && <ContactMessageManagement />}
                {activeTab === 'blogs' && <ManageBlogPage />}
                {activeTab === 'admins' && currentAdmin?.role === 'super_admin' && <ManageAdminPage />}
            </div>
        </div>
    );
}