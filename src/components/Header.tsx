'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import * as gtag from '../lib/gtag';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="sticky top-0 z-50">
            <div className="bg-white shadow-lg border-b border-gray-100">
                {/* เปลี่ยน py-3 เป็น py-4 และปรับ min-h-[64px]
                */}
                <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center min-h-[72px] md:h-24">
                    {/* Logo/Brand (Left) - ปรับการแสดงผลให้เห็น Brand ชัดขึ้น
                    */}
                    <Link
                        href="/"
                        className="flex items-center text-2xl sm:text-3xl font-extrabold tracking-tight"
                    >
                        {/* ปรับขนาดและเน้นสี: text-2xl/3xl, font-black, เน้นสีน้ำเงินของแบรนด์
                        */}
                        <span className="text-[#0E1B4F] dark:text-[#18395B] font-black">
                            YooDee
                        </span>
                        {/* ปรับขนาดและเน้นสี: font-extrabold, ใช้สีน้ำเงินอ่อนลงเล็กน้อย 
                        */}
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold ml-1">
                            HomeCare
                        </span>
                    </Link>

                    {/* Navigation Links (Center) - Desktop Only */}
                    <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="text-gray-900 hover:text-blue-600 transition-colors">หน้าแรก</Link>
                        <Link href="/about" className="text-gray-900 hover:text-blue-600 transition-colors">เกี่ยวกับเรา</Link>
                        <Link href="/services" className="text-gray-900 hover:text-blue-600 transition-colors">บริการของเรา</Link>
                        {/* เพิ่มลิงก์ 'สมัครเป็นผู้ให้บริการ' ในเมนูหลัก (Desktop) */}
                        <Link href="/provider-signup" className="text-gray-900 hover:text-blue-600 transition-colors">สมัครเป็นผู้ให้บริการ</Link>
                    </nav>

                    {/* Contact/CTA (Right) */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* TH/EN Switcher - Hidden on mobile */}
                        <div className="hidden md:flex items-center space-x-1 text-sm font-bold">
                            <span className="text-blue-600">TH</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">EN</span>
                        </div>
                        {/* CTA Button - Responsive */}
                        <Link
                            href="/contact"
                            className="hidden sm:flex px-4 md:px-6 py-2.5 bg-blue-600 text-white text-sm md:text-base rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-xl shadow-blue-400/30"
                            onClick={() => gtag.event({ action: 'click_header_cta', category: 'Conversion', label: 'Contact_Consultation' })}
                        >
                            ติดต่อสอบถาม
                        </Link>
                        {/* Mobile Menu Toggle */}
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
                        <nav className="container max-w-6xl mx-auto px-4 py-4 flex flex-col space-y-2">
                            <Link
                                href="/"
                                className="text-gray-900 hover:text-blue-600 font-semibold py-2 px-3 rounded-lg hover:bg-blue-50 transition-all"
                                onClick={toggleMobileMenu}
                            >
                                หน้าแรก
                            </Link>
                            <Link
                                href="/about"
                                className="text-gray-900 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-all"
                                onClick={toggleMobileMenu}
                            >
                                เกี่ยวกับเรา
                            </Link>
                            <Link
                                href="/services"
                                className="text-gray-900 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-all"
                                onClick={toggleMobileMenu}
                            >
                                บริการของเรา
                            </Link>
                            {/* แก้ไข/เพิ่มลิงก์ให้ชัดเจนและถูกต้องตามชื่อ */}
                            <Link
                                href="/provider-signup"
                                className="text-gray-900 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-all"
                                onClick={toggleMobileMenu}
                            >
                                สมัครเป็นผู้ให้บริการ
                            </Link>
                            <Link
                                href="/contact"
                                className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 mt-4 rounded-lg font-bold text-center transition-all shadow-md"
                                onClick={() => {
                                    toggleMobileMenu();
                                    gtag.event({ action: 'click_mobile_menu_cta', category: 'Conversion', label: 'Contact_Consultation' });
                                }}
                            >
                                ติดต่อสอบถาม
                            </Link>
                            {/* Language Switcher in Mobile Menu */}
                            <div className="flex items-center justify-center space-x-2 text-sm font-bold pt-4 border-t mt-4 border-gray-100">
                                <span className="text-blue-600">TH</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">EN</span>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}