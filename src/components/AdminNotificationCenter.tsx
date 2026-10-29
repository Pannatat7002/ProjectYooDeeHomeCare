'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Bell,
    Volume2,
    VolumeX,
    ExternalLink,
    Phone,
    X,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { fetchWithAuth } from '../lib/auth-client';

interface IncomingLead {
    id: number | string;
    name: string;
    phone: string;
    branch?: string;
    budget?: string;
    patientCondition?: string;
    convenientTime?: string;
    message?: string;
    status?: string;
    submittedAt?: string;
}

// Synthesize pleasant multi-tone siren / chime alert using Web Audio API
function playAlertChime() {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const notes = [
            { freq: 587.33, start: 0, duration: 0.15 },    // D5
            { freq: 783.99, start: 0.15, duration: 0.18 }, // G5
            { freq: 880.00, start: 0.33, duration: 0.40 }, // A5
            { freq: 1174.66, start: 0.73, duration: 0.50 } // D6
        ];

        notes.forEach(({ freq, start, duration }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

            gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
        });

        setTimeout(() => {
            if (ctx.state !== 'closed') ctx.close().catch(() => {});
        }, 1500);
    } catch (e) {
        console.warn('Web Audio playback error:', e);
    }
}

export default function AdminNotificationCenter() {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false);
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
    const [activeToast, setActiveToast] = useState<IncomingLead | null>(null);
    const [recentAlerts, setRecentAlerts] = useState<IncomingLead[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const knownLeadIdsRef = useRef<Set<string>>(new Set());
    const isFirstRunRef = useRef(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize preferences from localStorage
    useEffect(() => {
        const savedSound = localStorage.getItem('tcc_admin_sound_enabled');
        if (savedSound !== null) {
            setSoundEnabled(savedSound === 'true');
        }

        if (typeof window !== 'undefined' && 'Notification' in window) {
            setDesktopAlertsEnabled(Notification.permission === 'granted');
            setHasRequestedPermission(Notification.permission !== 'default');
        }
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSound = () => {
        setSoundEnabled(prev => {
            const next = !prev;
            localStorage.setItem('tcc_admin_sound_enabled', String(next));
            return next;
        });
    };

    const requestDesktopNotificationPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            alert('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนบนหน้าจอ (Web Notifications)');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setHasRequestedPermission(true);
            if (permission === 'granted') {
                setDesktopAlertsEnabled(true);
                // Send test confirmation
                new Notification('✅ เปิดการแจ้งเตือนสำเร็จ - ThaiCareCenter', {
                    body: 'ระบบจะแจ้งเตือนทันทีเมื่อมีเคสนัดหมายหรือติดต่อใหม่เข้ามา',
                    icon: '/favicon.ico',
                });
            } else {
                setDesktopAlertsEnabled(false);
            }
        } catch (e) {
            console.error('Failed to request notification permission:', e);
        }
    };

    // Trigger full notification for an incoming lead
    const triggerNotification = useCallback((lead: IncomingLead) => {
        // 1. Play auditory sound chime
        if (soundEnabled) {
            playAlertChime();
        }

        // 2. Browser Desktop Notification (System tray / Heads-up)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
                const title = `🚨 เคสใหม่: ${lead.name || 'ผู้ติดต่อใหม่'} (${lead.phone || 'ไม่มีเบอร์'})`;
                const body = `สนใจศูนย์: ${lead.branch || 'ศูนย์ดูแล'}\nงบประมาณ: ${lead.budget || 'ไม่ระบุ'}\nอาการ: ${lead.patientCondition || 'ทั่วไป'}`;

                const n = new Notification(title, {
                    body,
                    icon: '/favicon.ico',
                    tag: `consultation-${lead.id}`,
                    requireInteraction: true,
                });

                n.onclick = () => {
                    window.focus();
                    window.location.href = `/admin/manage?tab=consultation&highlight=${lead.id}`;
                };
            } catch (err) {
                console.warn('Desktop notification display notice:', err);
            }
        }

        // 3. Show In-App Floating Toast Banner
        setActiveToast(lead);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
            setActiveToast(null);
        }, 12000); // Display for 12 seconds

        // 4. Update recent alerts & unread badge
        setRecentAlerts(prev => [lead, ...prev.filter(x => x.id !== lead.id)].slice(0, 10));
        setUnreadCount(prev => prev + 1);
    }, [soundEnabled]);

    // Test Alert Button (for admin validation)
    const handleTestAlert = () => {
        const testLead: IncomingLead = {
            id: Date.now(),
            name: 'คุณทดสอบ ระบบแจ้งเตือน',
            phone: '081-234-5678',
            branch: 'ศูนย์ทดสอบ ThaiCareCenter',
            patientCondition: 'ช่วยเหลือตัวเองได้ / พักฟื้น',
            budget: '20,000 - 30,000 บาท/เดือน',
            convenientTime: 'ด่วนภายในวันนี้',
            submittedAt: new Date().toISOString()
        };
        triggerNotification(testLead);
    };

    // 1. Setup Supabase Realtime Listener on `consultations` table
    useEffect(() => {
        if (!supabase) return;

        let channel: any = null;
        try {
            channel = supabase
                .channel('admin-consultations-realtime')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'consultations' },
                    (payload: any) => {
                        const newRow = payload.new || {};
                        const leadId = String(newRow.id || Date.now());

                        if (!knownLeadIdsRef.current.has(leadId)) {
                            knownLeadIdsRef.current.add(leadId);
                            const lead: IncomingLead = {
                                id: newRow.id,
                                name: newRow.name || newRow.contact_name || 'ลูกค้าใหม่',
                                phone: newRow.phone || '',
                                branch: newRow.branch || newRow.center_name || 'ศูนย์ทั่วไป',
                                budget: newRow.budget || '',
                                patientCondition: newRow.patient_condition || newRow.condition || '',
                                convenientTime: newRow.convenient_time || 'ด่วน',
                                message: newRow.message || '',
                                status: newRow.status || 'pending',
                                submittedAt: newRow.submitted_at || new Date().toISOString(),
                            };
                            triggerNotification(lead);
                        }
                    }
                )
                .subscribe((status: string) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ [Admin Realtime] Subscribed to consultations channel');
                    }
                });
        } catch (e) {
            console.warn('Supabase Realtime subscription notice:', e);
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [triggerNotification]);

    // 2. Smart Polling Heartbeat Fallback (checks every 15s)
    useEffect(() => {
        let isCancelled = false;

        const checkNewLeads = async () => {
            try {
                const res = await fetchWithAuth('/api/care-centers/consultations');
                if (!res.ok) return;
                const result = await res.json();
                const list: any[] = Array.isArray(result?.data) ? result.data : [];

                if (isFirstRunRef.current) {
                    // Initial baseline: populate known IDs without firing alerts
                    list.forEach(item => {
                        if (item.id) knownLeadIdsRef.current.add(String(item.id));
                    });
                    isFirstRunRef.current = false;
                    return;
                }

                if (isCancelled) return;

                // Detect any new lead
                const newLeads = list.filter(item => item.id && !knownLeadIdsRef.current.has(String(item.id)));
                for (const item of newLeads) {
                    const idStr = String(item.id);
                    knownLeadIdsRef.current.add(idStr);

                    const lead: IncomingLead = {
                        id: item.id,
                        name: item.name || item.contactName || 'ลูกค้าใหม่',
                        phone: item.phone || '',
                        branch: item.branch || 'ศูนย์ทั่วไป',
                        budget: item.budget || '',
                        patientCondition: item.patientCondition || item.condition || '',
                        convenientTime: item.convenientTime || 'ด่วน',
                        message: item.message || '',
                        status: item.status || 'pending',
                        submittedAt: item.submittedAt || new Date().toISOString(),
                    };

                    triggerNotification(lead);
                }
            } catch (err) {
                // Silently ignore network blips
            }
        };

        checkNewLeads();
        const interval = setInterval(checkNewLeads, 15000);

        return () => {
            isCancelled = true;
            clearInterval(interval);
        };
    }, [triggerNotification]);

    return (
        <div className="relative inline-flex items-center">
            {/* Header Bell Button */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => {
                        setIsDropdownOpen(prev => !prev);
                        if (!isDropdownOpen) setUnreadCount(0);
                    }}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    title="ระบบแจ้งเตือนเคสด่วน (Realtime Alerts)"
                    aria-label="การแจ้งเตือน"
                >
                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600 animate-bounce' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold leading-tight">ระบบแจ้งเตือนเคสด่วน</h4>
                                    <p className="text-[11px] text-slate-300">แจ้งเตือนทันทีเมื่อมีเคสเข้ามา</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Realtime Online
                            </span>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="p-3 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                {/* Sound Toggle */}
                                <button
                                    onClick={toggleSound}
                                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-all ${
                                        soundEnabled
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                                    title={soundEnabled ? 'เปิดเสียงเตือนอยู่ (คลิกเพื่อปิด)' : 'ปิดเสียงเตือนอยู่ (คลิกเพื่อเปิด)'}
                                >
                                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                                    <span>{soundEnabled ? 'เสียง: เปิด' : 'เสียง: ปิด'}</span>
                                </button>

                                {/* Desktop Notification Permission Button */}
                                {!desktopAlertsEnabled ? (
                                    <button
                                        onClick={requestDesktopNotificationPermission}
                                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium transition-all flex items-center gap-1"
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                        <span>เปิดแจ้งเตือนจอ</span>
                                    </button>
                                ) : (
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        แจ้งเตือนจอเปิดแล้ว
                                    </span>
                                )}
                            </div>

                            {/* Test Alert Button */}
                            <button
                                onClick={handleTestAlert}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
                                title="ทดสอบส่งเสียงเตือนและการแจ้งเตือน"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>ทดสอบ</span>
                            </button>
                        </div>

                        {/* Recent Alerts List */}
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                            {recentAlerts.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-xs">
                                    <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
                                    ยังไม่มีเคสใหม่ในขณะนี้<br />
                                    <span className="text-[11px] text-slate-400">ระบบเชื่อมต่อรอรับสัญญาณเคสอัตโนมัติ 24 ชม.</span>
                                </div>
                            ) : (
                                recentAlerts.map(lead => (
                                    <div key={lead.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                    เคสด่วน
                                                </span>
                                                <h5 className="text-xs font-bold text-slate-900 truncate">{lead.name}</h5>
                                            </div>
                                            <p className="text-xs text-blue-600 font-semibold mb-0.5">{lead.phone}</p>
                                            <p className="text-[11px] text-slate-500 truncate">สนใจ: {lead.branch || 'ศูนย์ดูแล'}</p>
                                        </div>

                                        <div className="flex flex-col gap-1 shrink-0">
                                            {lead.phone && (
                                                <a
                                                    href={`tel:${lead.phone.replace(/[^\d]/g, '')}`}
                                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-center transition-colors"
                                                    title="โทรหาลูกค้า"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <Link
                                                href={`/admin/manage?tab=consultation&highlight=${lead.id}`}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-center transition-colors"
                                                title="ดูรายละเอียดเคส"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                            <Link
                                href="/admin/manage?tab=consultation"
                                onClick={() => setIsDropdownOpen(false)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                ดูรายการเคสทั้งหมดในระบบ &rarr;
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* In-App Floating Heads-up Alert Toast */}
            {activeToast && (
                <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-4 text-slate-900 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
                            <span className="text-xs font-black tracking-wide uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                                🚨 เคสด่วนใหม่รอนัดหมาย!
                            </span>
                        </div>
                        <button
                            onClick={() => setActiveToast(null)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="ปิดการแจ้งเตือน"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1 my-2">
                        <div className="text-sm font-bold text-slate-900">{activeToast.name}</div>
                        <div className="text-sm font-extrabold text-blue-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            {activeToast.phone}
                        </div>
                        {activeToast.branch && (
                            <div className="text-xs text-slate-600">
                                สนใจ: <span className="font-semibold text-slate-800">{activeToast.branch}</span>
                            </div>
                        )}
                        {activeToast.patientCondition && (
                            <div className="text-xs text-slate-500 truncate">
                                อาการ: {activeToast.patientCondition}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        {activeToast.phone && (
                            <a
                                href={`tel:${activeToast.phone.replace(/[^\d]/g, '')}`}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>โทรทันที</span>
                            </a>
                        )}
                        <Link
                            href={`/admin/manage?tab=consultation&highlight=${activeToast.id}`}
                            onClick={() => setActiveToast(null)}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>เปิดดูเคส</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
