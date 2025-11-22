'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import * as gtag from '../lib/gtag';

export default function Header() {
    return (
        <header className="sticky top-0 z-20">
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="container max-w-6xl mx-auto px-4 py-3 flex justify-between items-center h-20">
                    {/* Logo/Brand (Left) */}
                    <div className="flex items-center gap-2">
                        <img src="/YooDeeHomeCare.png" alt="YoodeeHomeCare Logo" className="h-8 w-auto" />
                        {/* <YoodeeHomeCareLogoText size="xl" /> */}
                    </div>

                    {/* Navigation Links (Center) - Simplified Nav for Detail Page */}
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="text-gray-900 hover:text-blue-600 font-semibold">หน้าแรก</Link>
                        <Link href="/about" className="text-gray-900 hover:text-blue-600">เกี่ยวกับเรา</Link>
                        <Link href="/services" className="text-gray-900 hover:text-blue-600">บริการของเรา</Link>
                        <Link href="/contact" className="text-gray-900 hover:text-blue-600">ติดต่อเรา</Link>
                    </nav>

                    {/* Contact/CTA (Right) */}
                    <div className="flex items-center space-x-4">
                        {/* TH/EN Switcher */}
                        <div className="flex items-center space-x-1 text-sm font-bold hidden sm:flex">
                            <span className="text-gray-900">TH</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-400 hover:text-gray-700">EN</span>
                        </div>
                        {/* CTA Button */}
                        <Link
                            href="/contact"
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-300/50"
                            onClick={() => gtag.event({ action: 'click_header_cta', category: 'Conversion', label: 'Contact_Consultation' })}
                        >
                            ติดต่อสอบถาม
                        </Link>
                        {/* Mobile Menu Icon (Placeholder) */}
                        <button className="lg:hidden text-gray-700 cursor-pointer p-2">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}