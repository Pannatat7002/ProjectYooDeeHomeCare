import Link from 'next/link';
import Image from 'next/image';
import { Facebook, PhoneCall, Mail } from 'lucide-react';

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
                            <a href="tel:+66987654321" className="flex items-center text-sm text-gray-300 hover:text-blue-400 transition-colors">
                                <PhoneCall className="h-4 w-4 mr-2 text-blue-400" />
                                <span>โทร: 095-805-7052</span>
                            </a>
                            <a href="mailto:pannatat7002@gmail.com" className="flex items-center text-sm text-gray-300 hover:text-blue-400 transition-colors">
                                <Mail className="h-4 w-4 mr-2 text-blue-400" />
                                <span>อีเมล: pannatat7002@gmail.com</span>
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
                                className="p-2 bg-gray-700 rounded-full text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.111 6.889c.175.05.289.245.289.43v.222c0 .285-.18.537-.444.608l-2.611.696.555 1.5c.08.214-.028.455-.25.535l-2.667.926c-.222.078-.465-.03-.544-.252l-.667-1.833a.444.444 0 0 1 .43-.608l2.611-.696-.555-1.5c-.08-.214.028-.455.25-.535l2.667-.926c.222-.078.465.03.544.252l.667 1.833z" />
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path fill="currentColor" d="M15.444 8.889c.175.05.289.245.289.43v.222c0 .285-.18.537-.444.608l-2.611.696.555 1.5c.08.214-.028.455-.25.535l-2.667.926c-.222.078-.465-.03-.544-.252l-.667-1.833a.444.444 0 0 1 .43-.608l2.611-.696-.555-1.5c-.08-.214.028-.455.25-.535l2.667-.926c.222-.078.465.03.544.252z" />
                                </svg>
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
                    <Link
                        href="/contact"
                        className="flex items-center space-x-2 bg-green-500 rounded-full px-5 py-3 shadow-xl hover:bg-green-600 transition-colors cursor-pointer text-white text-sm font-bold order-1 md:order-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-9.25 13c-.1 1 .5 2 1.25 2.75L2 22l3.5-1.5c.75.75 1.75 1.25 2.75 1.25A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                        <span>ปรึกษาฟรีกับเจ้าหน้าที่</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}