'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2, X, Trash2, Phone, ExternalLink,
    CheckCircle2, Sparkles, MapPin, ChevronRight,
    MessageCircle, Share2
} from 'lucide-react';
import {
    SavedCenterItem,
    getCenterBasket,
    removeCenterFromBasket,
    clearCenterBasket
} from '../lib/centerBasketSession';
import { getVerifiedLead, VerifiedLeadData } from '../lib/leadSession';
import * as gtag from '../lib/gtag';

export default function CenterBasketDrawer() {
    const pathname = usePathname();
    const [items, setItems] = useState<SavedCenterItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [verifiedLead, setVerifiedLead] = useState<VerifiedLeadData | null>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    // ซ่อนบนหน้า Admin และ Login
    const isHiddenPage = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

    // โหลดข้อมูลศูนย์ในตระกร้าและข้อมูล Lead
    const refreshData = () => {
        const basket = getCenterBasket();
        setItems(basket);
        const lead = getVerifiedLead();
        setVerifiedLead(lead);
    };

    useEffect(() => {
        if (isHiddenPage) return;
        refreshData();

        // ดักฟัง event เมื่อมีการเพิ่ม/ลบศูนย์ในตระกร้า
        const handleBasketUpdated = () => {
            refreshData();
            // เอฟเฟกต์กระดิก/เด้งเตือนเมื่อมีรายการใหม่
            setHasAnimated(true);
            setTimeout(() => setHasAnimated(false), 800);
        };

        const handleLeadUpdated = () => {
            refreshData();
        };

        const handleOpenBasket = () => {
            setIsOpen(true);
        };

        window.addEventListener('tcc_basket_updated', handleBasketUpdated);
        window.addEventListener('tcc_lead_updated', handleLeadUpdated);
        window.addEventListener('tcc_open_basket', handleOpenBasket);

        return () => {
            window.removeEventListener('tcc_basket_updated', handleBasketUpdated);
            window.removeEventListener('tcc_lead_updated', handleLeadUpdated);
            window.removeEventListener('tcc_open_basket', handleOpenBasket);
        };
    }, [isHiddenPage]);

    if (isHiddenPage) return null;

    // ถ้าไม่มีรายการในตระกร้า ไม่แสดงปุ่มลอยเพื่อความสะอาดตา (หรือจะแสดงเมื่อมีอย่างน้อย 1 รายการ)
    if (items.length === 0 && !isOpen) {
        return null;
    }

    const handleRemove = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        e.preventDefault();
        const updated = removeCenterFromBasket(id);
        setItems(updated);
        if (updated.length === 0) {
            setIsOpen(false);
        }
    };

    const handleClearAll = () => {
        if (window.confirm('คุณต้องการลบศูนย์ทั้งหมดออกจากรายการที่เลือกใช่หรือไม่?')) {
            clearCenterBasket();
            setItems([]);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Floating Basket Button (มุมขวาล่าง) */}
            <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label={`ศูนย์ที่เลือกไว้ (${items.length})`}
                    className={`group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 cursor-pointer backdrop-blur-md ${
                        hasAnimated ? 'animate-bounce' : ''
                    }`}
                >
                    <div className="relative">
                        <Building2 className="w-5 h-5 text-blue-100 group-hover:rotate-6 transition-transform" />
                        <span className="absolute -top-2 -right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
                            {items.length}
                        </span>
                    </div>
                    <span className="hidden sm:inline">ศูนย์ที่เลือกไว้</span>
                    <span className="sm:hidden font-extrabold">({items.length})</span>
                </button>
            </div>

            {/* Slide-over Drawer Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Drawer Content */}
                    <div
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0 shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold leading-tight flex items-center gap-2">
                                        <span>ศูนย์ที่คุณเลือกไว้</span>
                                        <span className="text-xs bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                                            {items.length} แห่ง
                                        </span>
                                    </h3>
                                    <p className="text-[11px] text-blue-100 mt-0.5">
                                        บันทึกใน Cookie 30 วัน เพื่อเปรียบเทียบหรือติดต่อภายหลัง
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
                                aria-label="ปิดหน้าต่าง"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Customer Info Pill (ถ้าเคยกรอก Lead ไว้) */}
                        {verifiedLead && verifiedLead.name && (
                            <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 shrink-0">
                                <div className="flex items-center gap-1.5 truncate">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span className="truncate">
                                        <strong>{verifiedLead.name}</strong> ({verifiedLead.phone})
                                    </span>
                                </div>
                                <span className="text-[10px] text-blue-600 font-medium shrink-0 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                                    พร้อมใช้ติดต่อ
                                </span>
                            </div>
                        )}

                        {/* Drawer Body: List of Saved Centers */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
                            {items.length === 0 ? (
                                <div className="py-16 text-center text-gray-400 space-y-3">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">
                                        ยังไม่มีศูนย์ที่คุณเลือกไว้ในตระกร้า
                                    </p>
                                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                                        เมื่อคุณกดติดต่อ นัดหมาย หรือกดบันทึกศูนย์ดูแล ศูนย์จะถูกเก็บไว้ที่นี่อัตโนมัติ
                                    </p>
                                </div>
                            ) : (
                                items.map((center) => {
                                    const dateStr = center.selectedAt
                                        ? new Date(center.selectedAt).toLocaleDateString('th-TH', {
                                              day: 'numeric',
                                              month: 'short',
                                          })
                                        : '';

                                    return (
                                        <div
                                            key={center.id}
                                            className="pt-3 first:pt-0 group relative flex gap-3 items-start hover:bg-slate-50 p-2.5 rounded-xl transition"
                                        >
                                            {/* Image Thumbnail */}
                                            <Link
                                                href={`/${center.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 group-hover:opacity-95"
                                            >
                                                {center.imageUrl ? (
                                                    <Image
                                                        src={center.imageUrl}
                                                        alt={center.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Building2 className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Detail Info */}
                                            <div className="flex-1 min-w-0 pr-6">
                                                <Link
                                                    href={`/${center.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block font-bold text-sm text-gray-900 truncate hover:text-blue-600 transition"
                                                >
                                                    {center.name}
                                                </Link>

                                                {(center.province || center.address) && (
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span className="truncate">{center.province || center.address}</span>
                                                    </p>
                                                )}

                                                {center.price ? (
                                                    <p className="text-xs font-bold text-blue-700 mt-1">
                                                        ฿{center.price.toLocaleString()}{' '}
                                                        <span className="text-[10px] text-gray-400 font-normal">/เดือน</span>
                                                    </p>
                                                ) : null}

                                                {/* Action Buttons for this center */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {center.phone && (
                                                        <a
                                                            href={`tel:${center.phone}`}
                                                            onClick={() => {
                                                                gtag.event({
                                                                    action: 'basket_click_call',
                                                                    category: 'Conversion',
                                                                    label: center.name,
                                                                });
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                                                        >
                                                            <Phone className="w-3 h-3 text-emerald-600" />
                                                            <span>โทร</span>
                                                        </a>
                                                    )}

                                                    <a
                                                        href="https://line.me/R/ti/p/%40256zihiv"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                                                    >
                                                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                                                        <span>LINE</span>
                                                    </a>

                                                    <Link
                                                        href={`/${center.slug}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 ml-auto"
                                                    >
                                                        <span>ดูศูนย์</span>
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Delete Button (มุมขวาบนของการ์ด) */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemove(e, center.id)}
                                                title="ลบออกจากตระกร้า"
                                                className="absolute top-2.5 right-2 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Drawer Footer */}
                        {items.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-gray-500 hover:text-red-600 font-medium transition cursor-pointer flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>ล้างรายการทั้งหมด</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                                >
                                    ปิดหน้าต่าง
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
