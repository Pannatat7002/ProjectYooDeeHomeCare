'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, PhoneCall, Mail } from 'lucide-react';
import * as gtag from '../lib/gtag';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white pt-10">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">

                    {/* 1. Logo/Contact Info Column */}
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        {/* Logo with Image */}
                        <Link
                            href="/"
                            className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity duration-200 group mb-4"
                        >
                            {/* Logo Image */}
                            <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-full overflow-hidden">
                                <Image
                                    src="/favicon_io/android-chrome-192x192.png"
                                    alt="ThaiCareCenter Logo"
                                    fill
                                    className="object-contain" // อาจเปลี่ยนเป็น object-cover หากต้องการให้รูปเต็มวงกลมโดยไม่มีขอบว่าง
                                    priority
                                />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-semibold text-[#52a9ff] dark:text-blue-400 tracking-tight leading-none">
                                    ThaiCareCenter
                                </span>
                                <span className="text-xs md:text-sm text-white dark:text-gray-400 font-normal mt-1 group-hover:text-gray-300 transition-colors">
                                    เว็บไซต์รวบรวมศูนย์ดูแลผู้สูงอายุไทย
                                </span>
                            </div>
                        </Link>

                        <p className="text-sm text-gray-400 max-w-xs">
                            แพลตฟอร์มค้นหาและเปรียบเทียบศูนย์ดูแลผู้สูงอายุ และผู้ป่วยพักฟื้น ที่ครบถ้วนและน่าเชื่อถือที่สุด
                        </p>

                        {/* ข้อมูลติดต่อหลัก */}
                        <div className="space-y-2 pt-4">
                            <a href="tel:095-805-7052" className="flex items-center text-sm text-gray-300 hover:text-blue-400 transition-colors">
                                <PhoneCall className="h-4 w-4 mr-2 text-blue-400" />
                                <span>โทร: 095-805-7052</span>
                            </a>
                            <a href="mailto:thaicarecenter01@gmail.com" className="flex items-center text-sm text-gray-300 hover:text-blue-400 transition-colors">
                                <Mail className="h-4 w-4 mr-2 text-blue-400" />
                                <span>อีเมล: thaicarecenter01@gmail.com</span>
                            </a>
                            <a
                                href="https://line.me/R/ti/p/%40256zihiv"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-gray-300 hover:text-[#06C755] transition-colors"
                                onClick={() => {
                                    gtag.event({ action: 'click_footer_line_text', category: 'Conversion', label: 'LINE_Contact' });
                                    gtag.gtagReportLineConversion();
                                }}
                            >
                                <img
                                    src="/images/LINE_APP_iOS.png"
                                    alt="LINE Icon"
                                    className="h-4 w-4 mr-2 object-contain rounded-sm"
                                />
                                <span>LINE: Thai Care Center</span>
                            </a>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex space-x-3 pt-4">
                            <a
                                href="https://www.facebook.com/share/17rrsmB3fj"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="p-2 bg-gray-700 rounded-full text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://line.me/R/ti/p/@256zihiv"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Line"
                                className="w-9 h-9 flex items-center justify-center bg-gray-700 hover:bg-[#06C755] rounded-full transition-colors overflow-hidden"
                                onClick={() => {
                                    gtag.event({ action: 'click_footer_line_social', category: 'Conversion', label: 'LINE_Contact' });
                                    gtag.gtagReportLineConversion();
                                }}
                            >
                                <img
                                    src="/images/LINE_APP_iOS.png"
                                    alt="LINE Icon"
                                    className="w-5 h-5 object-contain rounded-sm"
                                />
                            </a>
                        </div>
                    </div>

                    {/* 2. เกี่ยวกับเรา (Quick Links) */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">เกี่ยวกับเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">เกี่ยวกับเรา</Link></li>
                            <li><Link href="/concept" className="hover:text-blue-400 transition-colors">แนวคิดโครงการ</Link></li>
                            <li><Link href="/whyus" className="hover:text-blue-400 transition-colors">ทำไมเราเลือกเรา</Link></li>
                            <li><Link href="/testimonials" className="hover:text-blue-400 transition-colors">คำรับรองจากลูกค้า</Link></li>
                            <li><Link href="/articles" className="hover:text-blue-400 transition-colors">สาระน่ารู้</Link></li>
                            <li><Link href="/blogs" className="hover:text-blue-400 transition-colors">บทความ</Link></li>
                            <li className="pt-2"><Link href="/contact" className="hover:text-blue-400 transition-colors font-semibold">ติดต่อเรา</Link></li>
                            <li><Link href="/provider-signup" className="hover:text-blue-400 transition-colors font-semibold">สมัครเป็นผู้ให้บริการ</Link></li>
                        </ul>
                    </div>

                    {/* 3. บริการของเรา (Services) */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">บริการของเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/services" className="hover:text-blue-400 transition-colors">บริการทั้งหมด</Link></li>
                            <li><Link href="/service/monthly" className="hover:text-blue-400 transition-colors">ศูนย์ดูแลรายเดือน</Link></li>
                            <li><Link href="/service/daily" className="hover:text-blue-400 transition-colors">ศูนย์ดูแลรายวัน</Link></li>
                            <li><Link href="/service/rehab" className="hover:text-blue-400 transition-colors">ดูแลฟื้นฟู/กลับบ้าน</Link></li>
                            <li><Link href="/service/aquatic" className="hover:text-blue-400 transition-colors">คลินิกกายภาพบำบัด</Link></li>
                            <li><Link href="/service/tms" className="hover:text-blue-400 transition-colors">คลินิก TMS</Link></li>
                        </ul>
                    </div>

                    {/* 4. โปรแกรมของเรา (Programs) */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">โปรแกรม & โครงการ</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/program/elderly" className="hover:text-blue-400 transition-colors">ดูแลผู้สูงอายุ</Link></li>
                            <li><Link href="/program/stroke" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยระยะพักฟื้น</Link></li>
                            <li><Link href="/program/bedridden" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยติดเตียง</Link></li>
                            <li><Link href="/program/alzheimer" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยอัลไซเมอร์</Link></li>
                            <li className="pt-2 border-t border-gray-800"><Link href="/project/wellness" className="hover:text-blue-400 transition-colors">โครงการ Wellness Center</Link></li>
                            <li><Link href="/project/homecare" className="hover:text-blue-400 transition-colors">โครงการ Home Care</Link></li>
                            <li><Link href="/investment" className="hover:text-blue-400 transition-colors">การลงทุน</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Copyright & Disclaimer */}
                <div className="mt-12 pt-6 border-t border-gray-800 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                    <p className="text-center md:text-left order-2 md:order-1">
                        ©{currentYear} **ThaiCareCenter**. All rights reserved.
                        <Link href="/privacy" className="text-blue-400 hover:text-blue-500 ml-3">| นโยบายความเป็นส่วนตัว</Link>
                        <Link href="/terms" className="text-blue-400 hover:text-blue-500 ml-3">| ข้อกำหนดและเงื่อนไข</Link>
                    </p>

                    {/* CTA Button */}
                    <a
                        href="https://line.me/R/ti/p/%40256zihiv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-[#06C755] rounded-full px-5 py-3 shadow-xl hover:bg-[#05b04b] transition-colors cursor-pointer text-white text-sm font-bold order-1 md:order-2"
                        onClick={() => {
                            gtag.event({ action: 'click_footer_line_cta', category: 'Conversion', label: 'LINE_Contact' });
                            gtag.gtagReportLineConversion();
                        }}
                    >
                        <img
                            src="/images/LINE_APP_iOS.png"
                            alt="LINE Icon"
                            className="w-5 h-5 object-contain rounded-sm flex-shrink-0"
                        />
                        <span>ปรึกษาฟรีกับเจ้าหน้าที่ผ่าน LINE</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}