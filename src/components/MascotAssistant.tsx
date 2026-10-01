'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Mail, Search, X, HelpCircle } from 'lucide-react';
import * as gtag from '../lib/gtag';

export default function MascotAssistant() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [hasDismissedBadge, setHasDismissedBadge] = useState(false);

    // ซ่อน Mascot หน้าบ้านบนหน้า Admin และหน้า Login
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
        return null;
    }

    const handleOpen = () => {
        setIsOpen(true);
        gtag.event({ action: 'open_mascot_assistant', category: 'Engagement', label: 'Mascot Assistant Click' });
    };

    const handleCall = () => {
        gtag.event({ action: 'call_mascot_advisor', category: 'Conversion', label: '095-805-7052' });
    };

    const handleLine = () => {
        gtag.event({ action: 'line_mascot_advisor', category: 'Conversion', label: 'LINE Contact' });
    };

    return (
        <div className="fixed bottom-6 right-5 z-40 font-sans print:hidden select-none">
            {/* Popover Card */}
            {isOpen && (
                <div
                    className="mb-3 w-[320px] sm:w-[350px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 transform transition-all"
                >
                    {/* Header with Mascot Theme */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white">
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="ปิดกล่องข้อความ"
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-2xl bg-white/10 p-0.5 border border-white/30 overflow-hidden shadow-inner flex-shrink-0">
                                <Image
                                    src="/images/mascot/mascot-avatar.jpg"
                                    alt="Care Advisor Mascot"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-medium border border-emerald-400/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    ออนไลน์ พร้อมให้คำปรึกษา
                                </div>
                                <h3 className="font-bold text-base text-white mt-1">ที่ปรึกษา (Care Advisor)</h3>
                                <p className="text-xs text-blue-100 font-light">ที่ปรึกษาการเลือกศูนย์ดูแลผู้สูงอายุ</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                        <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100/60 text-xs text-gray-700 leading-relaxed">
                            <p className="font-medium text-blue-900 mb-0.5">ยินดีต้อนรับครับ! 👋</p>
                            กำลังมองหาศูนย์ดูแลที่เหมาะกับอาการ งบประมาณ หรือทำเลที่ต้องการอยู่ใช่ไหมครับ? ปรึกษาทีมงานได้เลยครับ ฟรี!
                        </div>

                        {/* Quick Contact Buttons */}
                        <div className="space-y-2">
                            <a
                                href="tel:095-805-7052"
                                onClick={handleCall}
                                className="flex items-center justify-between w-full px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[11px] text-blue-100">โทรปรึกษาด่วนฟรี</div>
                                        <div className="font-semibold text-sm">095-805-7052</div>
                                    </div>
                                </div>
                                <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full">โทรออก</span>
                            </a>

                            <a
                                href="https://line.me/R/ti/p/%40256zihiv"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleLine}
                                className="flex items-center justify-between w-full px-3.5 py-2.5 bg-[#06C755] hover:bg-[#05b04b] text-white rounded-xl font-medium text-xs shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[11px] text-green-100">คุยผ่าน LINE สะดวก รวดเร็ว</div>
                                        <div className="font-semibold text-sm">LINE: @256zihiv</div>
                                    </div>
                                </div>
                                <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full">แชทเลย</span>
                            </a>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    href="/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors"
                                >
                                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                                    <span>ส่งข้อความ</span>
                                </Link>

                                <Link
                                    href="/#results-section"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors"
                                >
                                    <Search className="w-3.5 h-3.5 text-gray-500" />
                                    <span>ค้นหาศูนย์ดูแล</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mascot Floating Trigger Button */}
            <div className="flex items-center gap-2 justify-end">
                {/* Speech Bubble Reminder (can be dismissed) */}
                {!isOpen && !hasDismissedBadge && (
                    <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-blue-100 text-xs font-medium text-gray-800 animate-bounce duration-1000">
                        <span className="text-blue-600 font-bold">ปรึกษาฟรี!</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">ช่วยเลือกศูนย์ดูแล</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setHasDismissedBadge(true);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-0.5"
                            aria-label="ปิดข้อความแนะนำ"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <button
                    onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                    aria-label="ติดต่อที่ปรึกษา Care Advisor"
                    className="relative group p-1 bg-white hover:bg-blue-50 rounded-full shadow-xl hover:shadow-2xl border-2 border-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                    {/* Ring animation */}
                    <span className="absolute -inset-1 rounded-full bg-blue-400/30 animate-ping opacity-60 group-hover:opacity-100"></span>

                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
                        <Image
                            src="/images/mascot/mascot-avatar.jpg"
                            alt="Care Advisor Mascot"
                            width={56}
                            height={56}
                            className="object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                    </div>

                    {/* Status badge */}
                    {/* <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span> */}
                </button>
            </div>
        </div>
    );
}
