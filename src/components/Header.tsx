'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import * as gtag from '../lib/gtag';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Style สำหรับ Link ใน Mobile Menu เพื่อลดความซ้ำซ้อน
    const mobileLinkClasses = "text-gray-900 hover:text-blue-600 py-2 px-3 rounded-md hover:bg-blue-50 transition-all text-base";

    return (
        <header className="sticky top-0 z-50">
            <div className="bg-white shadow-md border-b border-gray-100">
                {/* 1. ปรับความสูงของ Header: min-h-[64px] และ md:h-20 (ลดลงจากเดิม 72px/24) */}
                <div className="container max-w-6xl mx-auto px-4 py-3 flex justify-between items-center min-h-[64px] md:h-20">

                    {/* Logo/Brand (Left) - ปรับขนาด Logo และ Text ให้เล็กลง */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity duration-200 group"
                    >
                        {/* 2. ลดขนาด Logo Image: w-10 h-10 md:w-12 md:h-12 (ลดลงจากเดิม 12/16) */}
                        <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full overflow-hidden">
                            <Image
                                src="/favicon_io/android-chrome-192x192.png"
                                alt="ThaiCareCenter Logo"
                                fill
                                className="object-cover" // ใช้ object-cover เพื่อให้เต็มวงกลม
                                priority
                            />
                        </div>

                        {/* Text Content - ลดขนาดตัวอักษร */}
                        <div className="flex flex-col">
                            {/* ส่วนหัวข้อภาษาอังกฤษ: ThaiCareCenter (ลดเป็น text-xl md:text-2xl) */}
                            <span className="text-xl md:text-2xl font-semibold text-[#2b64a0] tracking-tight leading-snug">
                                ThaiCareCenter
                            </span>

                            {/* ส่วนคำอธิบายภาษาไทย (คงขนาดเดิมหรือลดเล็กน้อย) */}
                            <span className="text-xs md:text-sm text-gray-600 font-normal mt-0.5 group-hover:text-gray-700 transition-colors">
                                เว็บไซต์รวบรวมศูนย์ดูแลผู้สูงอายุไทย
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links (Center) - Desktop Only (คงเดิม) */}
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">หน้าแรก</Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">เกี่ยวกับเรา</Link>
                        <Link href="/services" className="text-gray-700 hover:text-blue-600 transition-colors">บริการของเรา</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">ติดต่อเรา</Link>
                        <Link href="/blogs" className="text-gray-700 hover:text-blue-600 transition-colors">บทความ</Link>
                        <Link href="/provider-signup" className="text-gray-700 hover:text-blue-600 transition-colors">สมัครเป็นผู้ให้บริการ</Link>
                    </nav>

                    {/* Contact/CTA (Right) */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* TH/EN Switcher (คงเดิม) */}
                        <div className="hidden md:flex items-center space-x-1 text-sm font-bold">
                            <span className="text-blue-600">TH</span>
                            <span className="text-gray-400">|</span> {/* ปรับกลับเป็น 400 ให้ดูซอฟต์ลง */}
                            <span className="text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">EN</span>
                        </div>

                        {/* 3. CTA Button - ปรับขนาดและ padding ให้เล็กลง: px-3 py-2 */}
                        <Link
                            href="/contact"
                            className="hidden sm:flex px-3 md:px-5 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-400/30"
                            onClick={() => gtag.event({ action: 'click_header_cta', category: 'Conversion', label: 'Contact_Consultation' })}
                        >
                            ลงประกาศ
                        </Link>

                        {/* Mobile Menu Toggle (คงเดิม) */}
                        <button
                            className="lg:hidden text-gray-700 hover:text-blue-600 cursor-pointer p-2 transition-colors"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
                        {/* 4. ปรับลด spacing ใน Mobile Menu */}
                        <nav className="container max-w-6xl mx-auto px-4 py-3 flex flex-col space-y-1">
                            <Link href="/" className={mobileLinkClasses} onClick={toggleMobileMenu}>หน้าแรก</Link>
                            <Link href="/about" className={mobileLinkClasses} onClick={toggleMobileMenu}>เกี่ยวกับเรา</Link>
                            <Link href="/services" className={mobileLinkClasses} onClick={toggleMobileMenu}>บริการของเรา</Link>
                            <Link href="/contact" className={mobileLinkClasses} onClick={toggleMobileMenu}>ติดต่อเรา</Link>
                            <Link href="/blogs" className={mobileLinkClasses} onClick={toggleMobileMenu}>บทความ</Link>
                            <Link href="/provider-signup" className={mobileLinkClasses} onClick={toggleMobileMenu}>สมัครเป็นผู้ให้บริการ</Link>

                            {/* CTA Button ใน Mobile Menu - ปรับเป็น mt-3 และ py-2 */}
                            <Link
                                href="/contact"
                                className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 mt-3 rounded-lg font-bold text-center transition-all shadow-md"
                                onClick={() => {
                                    toggleMobileMenu();
                                    gtag.event({ action: 'click_mobile_menu_cta', category: 'Conversion', label: 'Contact_Consultation' });
                                }}
                            >
                                สนใจเข้ารวม
                            </Link>

                            {/* Language Switcher ใน Mobile Menu (คงเดิม) */}
                            <div className="flex items-center justify-center space-x-2 text-sm font-bold pt-3 mt-3 border-t border-gray-100">
                                <span className="text-blue-600">TH</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">EN</span>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}