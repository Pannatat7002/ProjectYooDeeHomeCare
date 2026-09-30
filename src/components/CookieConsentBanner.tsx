'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, ShieldCheck, Settings, X, Check } from 'lucide-react';
import { setCookie, getCookie } from '../lib/leadSession';

export interface CookiePreferences {
    necessary: boolean;
    leadSession: boolean;
    analytics: boolean;
    updatedAt: string;
}

const COOKIE_CONSENT_KEY = 'tcc_cookie_consent';
const STORAGE_CONSENT_KEY = 'tcc_cookie_preferences';

export default function CookieConsentBanner() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [leadSessionConsent, setLeadSessionConsent] = useState(true);
    const [analyticsConsent, setAnalyticsConsent] = useState(true);

    // ซ่อน Cookie Consent บนหน้า Admin และหน้า Login
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
        return null;
    }

    useEffect(() => {
        // Check if user already made a choice
        const existingCookie = getCookie(COOKIE_CONSENT_KEY);
        const existingStorage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_CONSENT_KEY) : null;

        if (!existingCookie && !existingStorage) {
            // Show after a subtle delay for smooth page load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 800);
            return () => clearTimeout(timer);
        } else if (existingStorage) {
            try {
                const prefs: CookiePreferences = JSON.parse(existingStorage);
                setLeadSessionConsent(prefs.leadSession ?? true);
                setAnalyticsConsent(prefs.analytics ?? true);
            } catch {
                // Ignore parse errors
            }
        }

        // Global event listener to allow reopening settings from footer or anywhere
        const handleOpenConsent = () => {
            setShowSettings(true);
            setIsVisible(true);
        };

        window.addEventListener('tcc_open_cookie_consent', handleOpenConsent);
        return () => window.removeEventListener('tcc_open_cookie_consent', handleOpenConsent);
    }, []);

    const savePreferences = (prefs: CookiePreferences, cookieVal: string) => {
        setCookie(COOKIE_CONSENT_KEY, cookieVal, 365); // 1 Year TTL
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_CONSENT_KEY, JSON.stringify(prefs));
        }
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleAcceptAll = () => {
        const prefs: CookiePreferences = {
            necessary: true,
            leadSession: true,
            analytics: true,
            updatedAt: new Date().toISOString()
        };
        savePreferences(prefs, 'all');
    };

    const handleAcceptEssential = () => {
        const prefs: CookiePreferences = {
            necessary: true,
            leadSession: false,
            analytics: false,
            updatedAt: new Date().toISOString()
        };
        savePreferences(prefs, 'essential');
    };

    const handleSaveCustom = () => {
        const prefs: CookiePreferences = {
            necessary: true,
            leadSession: leadSessionConsent,
            analytics: analyticsConsent,
            updatedAt: new Date().toISOString()
        };
        savePreferences(prefs, `custom_${leadSessionConsent ? '1' : '0'}${analyticsConsent ? '1' : '0'}`);
    };

    if (!isVisible) return null;

    return (
        <aside
            aria-label="การแจ้งเตือนคุกกี้"
            className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-[9999] max-w-lg w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl p-5 text-slate-800 relative">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Cookie className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900 leading-tight">
                                นโยบายการใช้งานคุกกี้
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">Cookie & Privacy Notice (PDPA)</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAcceptEssential}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="ปิดและยอมรับเฉพาะที่จำเป็น"
                        aria-label="ปิดการแจ้งเตือนคุกกี้"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {!showSettings ? (
                    <>
                        {/* Summary description */}
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            ThaiCareCenter ใช้คุกกี้และเทคโนโลยีการจัดเก็บข้อมูลเพื่อเพิ่มประสิทธิภาพการใช้งาน จดจำการติดต่อเพื่อความสะดวกในการเปิดแผนที่นำทางและติดต่อศูนย์ดูแลของท่านตาม{' '}
                            <Link href="/privacy" target="_blank" className="text-blue-600 underline font-medium hover:text-blue-800">
                                นโยบายความเป็นส่วนตัว
                            </Link>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleAcceptAll}
                                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-[0.98] text-center"
                            >
                                ยอมรับทั้งหมด
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptEssential}
                                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all text-center"
                            >
                                เฉพาะที่จำเป็น
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSettings(true)}
                                className="py-2.5 px-2.5 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1 hover:bg-slate-50"
                            >
                                <Settings className="w-3.5 h-3.5" /> ตั้งค่า
                            </button>
                        </div>
                    </>
                ) : (
                    /* Detailed Settings Mode */
                    <div className="space-y-3 pt-1">
                        <p className="text-xs text-slate-500 mb-2">
                            ท่านสามารถเลือกเปิดหรือปิดการใช้งานคุกกี้แต่ละประเภทได้ตามความต้องการ:
                        </p>

                        {/* 1. Necessary */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="pr-2">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-slate-800">คุกกี้ที่จำเป็นอย่างยิ่ง</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                    จำเป็นต่อการทำงานและความปลอดภัยของเว็บไซต์ (เปิดใช้งานเสมอ)
                                </p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                เสมอ
                            </span>
                        </div>

                        {/* 2. Lead Session & Seamless Bypass */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="pr-2">
                                <span className="text-xs font-bold text-slate-800">คุกกี้จดจำเซสชันการติดต่อ (30 วัน)</span>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                    จดจำเบอร์โทรและงบประมาณเพื่อเปิดแผนที่และติดต่อศูนย์ได้ทันที ไม่ต้องกรอกซ้ำ
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={leadSessionConsent}
                                    onChange={(e) => setLeadSessionConsent(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* 3. Analytics */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="pr-2">
                                <span className="text-xs font-bold text-slate-800">คุกกี้วิเคราะห์และสถิติ</span>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                    ช่วยวิเคราะห์การเข้าชมเพื่อปรับปรุงเนื้อหาและบริการของเว็บไซต์
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={analyticsConsent}
                                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Actions in Settings Mode */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1 px-2"
                            >
                                ย้อนกลับ
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCustom}
                                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 transition-all flex items-center gap-1.5"
                            >
                                <Check className="w-3.5 h-3.5" /> บันทึกการตั้งค่า
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
