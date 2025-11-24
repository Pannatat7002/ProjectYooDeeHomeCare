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
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="container max-w-6xl mx-auto px-4 py-3 flex justify-between items-center min-h-[64px] md:h-20">
                    {/* Logo/Brand (Left) */}
                    <Link href="/" className="flex items-baseline text-xl sm:text-2xl font-extrabold tracking-tight">
                        <span className="text-[#0E1B4F] dark:text-[#18395B]">
                            YooDee
                        </span>
                        <span className="text-gray-900 dark:text-gray-200 font-semibold ml-0.5">
                            HomeCare
                        </span>
                    </Link>

                    {/* Navigation Links (Center) - Desktop Only */}
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="text-gray-900 hover:text-blue-600 font-semibold transition-colors">หน้าแรก</Link>
                        <Link href="/about" className="text-gray-900 hover:text-blue-600 transition-colors">เกี่ยวกับเรา</Link>
                        <Link href="/services" className="text-gray-900 hover:text-blue-600 transition-colors">บริการของเรา</Link>
                    </nav>

                    {/* Contact/CTA (Right) */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* TH/EN Switcher - Hidden on mobile */}
                        <div className="hidden md:flex items-center space-x-1 text-sm font-bold">
                            <span className="text-gray-900">TH</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-400 hover:text-gray-700 cursor-pointer">EN</span>
                        </div>
                        {/* CTA Button - Responsive */}
                        <Link
                            href="/contact"
                            className="hidden sm:flex px-3 md:px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-300/50"
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
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
                        <nav className="container max-w-6xl mx-auto px-4 py-4 flex flex-col space-y-3">
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
                            <Link
                                href="/contact"
                                className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded-lg font-bold text-center transition-all shadow-md"
                                onClick={() => {
                                    toggleMobileMenu();
                                    gtag.event({ action: 'click_mobile_menu_cta', category: 'Conversion', label: 'Contact_Consultation' });
                                }}
                            >
                                ติดต่อสอบถาม
                            </Link>
                            {/* Language Switcher in Mobile Menu */}
                            <div className="flex items-center justify-center space-x-2 text-sm font-bold pt-2 border-t border-gray-100">
                                <span className="text-gray-900">TH</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-400 hover:text-gray-700 cursor-pointer">EN</span>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}