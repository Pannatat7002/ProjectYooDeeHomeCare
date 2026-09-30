'use client';

import { useState } from 'react';
import AdminSidebar from '@/src/components/AdminSidebar';
import { Menu, ShieldCheck } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Mobile Backdrop Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}

            {/* Admin Sidebar */}
            <AdminSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Layout Area */}
            <div className="flex-1 min-w-0 min-h-screen lg:ml-72 flex flex-col">
                {/* Mobile Header Bar */}
                <header className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Admin Panel</span>
                    </div>

                    <div className="w-9" />
                </header>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}