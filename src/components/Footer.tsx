
import Link from 'next/link';
import { Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-12">
            <div className="container max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

                    {/* 1. Logo/Address Column */}
                    <div className="col-span-2 lg:col-span-1 space-y-4">
                        <div className="flex flex-col leading-tight">
                            <div className="flex items-baseline text-2xl sm:text-2xl font-extrabold tracking-tight">
                                <span className="text-[#0E1B4F] dark:text-[#18395B]">
                                    YooDee
                                </span>
                                <span className="text-gray-900 dark:text-gray-200 font-semibold ml-0.5">
                                    HomeCare
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">
                            แพลตฟอร์มค้นหาและเปรียบเทียบศูนย์ดูแลผู้สูงอายุ และผู้ป่วยพักฟื้น ที่ครบถ้วนและน่าเชื่อถือที่สุด
                        </p>
                        <div className="flex space-x-3 pt-2">
                            <a href="https://www.facebook.com/share/17rrsmB3fj" aria-label="Facebook" className="p-2 bg-gray-700 rounded-full text-blue-400 hover:text-blue-600 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" aria-label="Line" className="p-2 bg-gray-700 rounded-full text-blue-400 hover:text-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-code h-4 w-4"><path d="M7.9 20A9 9 0 0 1 12 12V8" /><path d="M12 2a10 10 0 0 0-9.25 13c-.1 1 .5 2 1.25 2.75L2 22l3.5-1.5c.75.75 1.75 1.25 2.75 1.25A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z" /><path d="m10 10-2 2 2 2" /><path d="m14 10 2 2-2 2" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* 2. เกี่ยวกับเรา (Quick Links) */}
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white mb-3">เกี่ยวกับเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">เกี่ยวกับเรา</Link></li>
                            <li><Link href="/concept" className="hover:text-blue-400 transition-colors">แนวคิดโครงการ</Link></li>
                            <li><Link href="/whyus" className="hover:text-blue-400 transition-colors">ทำไมเราเลือกเรา</Link></li>
                            <li><Link href="/testimonials" className="hover:text-blue-400 transition-colors">คำรับรองจากลูกค้า</Link></li>
                            <li><Link href="/articles" className="hover:text-blue-400 transition-colors">สาระน่ารู้</Link></li>
                        </ul>
                    </div>

                    {/* 3. บริการของเรา (Services) */}
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white mb-3">บริการของเรา</h4>
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
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white mb-3">โปรแกรมของเรา</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/program/elderly" className="hover:text-blue-400 transition-colors">ดูแลผู้สูงอายุ</Link></li>
                            <li><Link href="/program/stroke" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยระยะพักฟื้น</Link></li>
                            <li><Link href="/program/bedridden" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยติดเตียง</Link></li>
                            <li><Link href="/program/alzheimer" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยอัลไซเมอร์</Link></li>
                            <li><Link href="/program/parkinson" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยพาร์กินสัน</Link></li>
                            <li><Link href="/program/cancer" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยมะเร็ง/เคมีบำบัด</Link></li>
                            <li><Link href="/program/palliative" className="hover:text-blue-400 transition-colors">ดูแลผู้ป่วยระยะสุดท้าย</Link></li>
                        </ul>
                    </div>

                    {/* 5. โครงการอื่นๆ (Projects) */}
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white mb-3">โครงการอื่นๆ</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/project/wellness" className="hover:text-blue-400 transition-colors">โครงการ Wellness Center</Link></li>
                            <li><Link href="/project/homecare" className="hover:text-blue-400 transition-colors">โครงการ Home Care</Link></li>
                            <li><Link href="/project/academy" className="hover:text-blue-400 transition-colors">โครงการ Healthcare Academy</Link></li>
                            <li><Link href="/project/foundation" className="hover:text-blue-400 transition-colors">โครงการ Foundation</Link></li>
                            <li><Link href="/investment" className="hover:text-blue-400 transition-colors">การลงทุน</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Copyright & Disclaimer */}
                <div className="mt-10 pt-4 border-t border-gray-800 text-sm text-gray-400 flex justify-between items-end flex-wrap">
                    <p>
                        ©{new Date().getFullYear()} YoodeeHomeCare. All rights reserved. |
                        <Link href="/privacy" className="text-blue-400 hover:text-blue-500 ml-1">นโยบายความเป็นส่วนตัว</Link>
                    </p>
                    <Link href="/contact" className="bg-green-600 rounded-full p-3 shadow-lg hover:bg-green-700 transition-colors mt-4 md:mt-0 cursor-pointer block">
                        <span className="text-white text-xs font-semibold">ปรึกษาเรื่องที่พักกับเจ้าหน้าที่</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
