import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Search,
    Phone,
    CalendarCheck,
    BookOpen,
    Store,
    TrendingUp,
    Users,
    CheckCircle2,
    ArrowRight,
    Building2,
    ShieldCheck,
    Sparkles,
    HeartHandshake,
    Train,
    Hospital,
    BadgeCheck,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'บริการของเรา',
    description: 'บริการครบวงจรของ ThaiCareCenter ทั้งการค้นหาศูนย์ดูแลผู้สูงอายุ ปรึกษา Care Advisor ฟรี และบริการสนับสนุนศูนย์ดูแลผู้สูงอายุพาร์ทเนอร์ทั่วไทย',
};

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800">

            {/* 1. Hero Section (Home Theme: Sophisticated Dark Gradient & Ambient Vignette) */}
            <div
                className="relative pt-24 pb-20 px-4 bg-cover bg-center min-h-[520px] md:min-h-[560px] flex items-center overflow-hidden"
                style={{
                    backgroundImage: 'url("/images/hero-care-home-bg.jpg")',
                    backgroundPosition: 'center 38%',
                }}
            >
                {/* Sophisticated Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/60 to-slate-950/90"></div>
                {/* Soft Radial Ambient Lighting */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none"></div>

                <div className="relative z-10 container max-w-5xl mx-auto text-center">
                    {/* Pill Tag */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs md:text-sm font-semibold mb-6 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>บริการครบวงจร · Our Comprehensive Services</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
                        บริการที่ครอบคลุม <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white">
                            เพื่อครอบครัวและศูนย์ดูแลผู้สูงอายุ
                        </span>
                    </h1>

                    <p className="text-blue-100/90 text-base md:text-xl font-light drop-shadow-lg max-w-3xl mx-auto px-4 leading-relaxed mb-8">
                        เชื่อมโยงครอบครัวที่ต้องการการดูแลที่มีคุณภาพ เข้ากับศูนย์ดูแลที่ได้มาตรฐานทั่วประเทศ พร้อมทีม Care Advisor ดูแลฟรีไม่มีค่าใช้จ่าย
                    </p>

                    {/* Quick Section Anchors */}
                    <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
                        <a
                            href="#b2c-services"
                            className="px-5 py-2.5 rounded-full bg-white text-blue-900 font-semibold text-xs md:text-sm shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span>สำหรับครอบครัวและผู้สูงอายุ</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="#b2b-services"
                            className="px-5 py-2.5 rounded-full bg-blue-600/60 border border-blue-400/40 text-white font-semibold text-xs md:text-sm hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2 backdrop-blur-md"
                        >
                            <span>สำหรับศูนย์ดูแล (พาร์ทเนอร์)</span>
                            <Building2 className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* 2. SECTION: สำหรับครอบครัวและผู้สูงอายุ (B2C Services) */}
            <section id="b2c-services" className="py-20 bg-white border-b border-gray-100 scroll-mt-20">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3 border border-blue-100">
                            💙 บริการฟรีสำหรับผู้ใช้บริการ
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                            บริการสำหรับครอบครัวและผู้สูงอายุ
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                            เราช่วยให้คุณค้นหาและเลือกศูนย์ดูแลที่เหมาะสมที่สุดอย่างมั่นใจ โปร่งใส และประหยัดเวลา
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Service Card 1: ระบบค้นหาอัจฉริยะ */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Search className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">01. ค้นหาแม่นยำ</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">ค้นหาและเปรียบเทียบศูนย์ดูแลอัจฉริยะ</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                ค้นหาศูนย์ดูแลจากฐานข้อมูลกว่า 1,150 แห่งทั่วประเทศ กรองได้ตามทำเล แนวรถไฟฟ้า BTS/MRT หรือใกล้โรงพยาบาล พร้อมคำนวณระยะทางจริงให้คุณทันที
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ค้นหาตามแนวรถไฟฟ้า BTS / MRT และรัศมีกิโลเมตร</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ค้นหาศูนย์ดูแลใกล้โรงพยาบาลชั้นนำเพื่อความสะดวกในการพบแพทย์</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>เปรียบเทียบราคาเริ่มต้น สิ่งอำนวยความสะดวก และรีวิว</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-2">
                                <Link
                                    href="/"
                                    className="text-blue-600 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                                >
                                    <span>ลองค้นหาศูนย์ดูแล</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Service Card 2: ทีม Care Advisor ปรึกษาฟรี */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <HeartHandshake className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">02. ที่ปรึกษาส่วนตัว</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">ทีม Care Advisor ให้คำปรึกษาฟรี 100%</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                เพื่อนคู่คิดที่รับฟังทุกความกังวล ช่วยวิเคราะห์อาการผู้ป่วย (ติดเตียง, พักฟื้น, สมองเสื่อม) แนะนำศูนย์ที่ตรงอาการและงบประมาณอย่างเป็นกลาง
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ให้คำปรึกษาโดยไม่มีค่าใช้จ่าย ไม่มีบวกราคาเพิ่ม</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>คัดกรองศูนย์ที่ผ่านมาตรฐาน สบส. และมีความพร้อมในการดูแลผู้สูงอายุ</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ช่วยวางแผนงบประมาณให้เหมาะกับระยะยาวของครอบครัว</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-2">
                                <a
                                    href="tel:095-805-7052"
                                    className="text-emerald-700 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>โทรปรึกษา Care Advisor ฟรี (095-805-7052)</span>
                                </a>
                            </div>
                        </div>

                        {/* Service Card 3: นัดหมายเข้าชมศูนย์ */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <CalendarCheck className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">03. สะดวกสบาย</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">ประสานงานนัดหมายเข้าชมสถานที่</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                อำนวยความสะดวกในการนัดหมายเยี่ยมชมศูนย์ดูแลจริงล่วงหน้า พร้อมรับคำแนะนำสิ่งที่ควรตรวจสอบหน้างาน เพื่อให้ครอบครัวตัดสินใจได้อย่างสบายใจ
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ล็อกเวลาเข้าชมกับเจ้าหน้าที่และผู้ดูแลประจำศูนย์โดยตรง</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>แจก Checklist ตรวจสอบความสะอาดและความปลอดภัยสถานที่</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>แจ้งเตือนก่อนถึงวันนัดหมายผ่าน SMS / โทรศัพท์</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-2">
                                <Link
                                    href="/contact"
                                    className="text-indigo-600 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                                >
                                    <span>ติดต่อประสานงานนัดหมาย</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Service Card 4: คลังข้อมูลและบทความ */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">04. องค์ความรู้</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">คลังบทความและคู่มือการดูแลผู้สูงอายุ</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                รวบรวมองค์ความรู้ด้านสุขภาพผู้สูงอายุ สัญญาณเตือนโรคสมองเสื่อม การดูแลผู้ป่วยติดเตียง และเทคนิคการฟื้นฟูสมรรถภาพกายภาพบำบัด
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>รวบรวมสาระความรู้และคำแนะนำที่เป็นประโยชน์ต่อการดูแลผู้สูงอายุ</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>คู่มือเปรียบเทียบศูนย์ดูแลและสิ่งที่ต้องสอบถามก่อนเข้าพัก</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>อัปเดตสาระน่ารู้เป็นประจำเพื่อเสริมสร้างสุขภาวะครอบครัว</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-2">
                                <Link
                                    href="/blogs"
                                    className="text-amber-700 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                                >
                                    <span>อ่านบทความสาระน่ารู้</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SECTION: ขั้นตอนการใช้บริการ (How It Works Timeline) */}
            <section className="py-20 bg-slate-50/70 border-b border-gray-100">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full mb-3 border border-emerald-200">
                            ⚙️ สะดวกและรวดเร็ว
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                            ขั้นตอนการใช้บริการ (4 ขั้นตอนง่ายๆ)
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                            เริ่มต้นค้นหาและเข้าพักในศูนย์ดูแลที่ได้มาตรฐานด้วยกระบวนการที่ราบรื่น
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Step 1 */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                                1
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">ค้นหาหรือระบุความต้องการ</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                เลือกทำเลใกล้บ้าน ใกล้แนวรถไฟฟ้า หรือโทรปรึกษา Care Advisor เพื่อช่วยแนะนำ
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                                2
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">คัดเลือกและเปรียบเทียบ</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                ดูรูปภาพจริง ตรวจสอบราคาเริ่มต้น สิ่งอำนวยความสะดวก และประเมินความพร้อม
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                                3
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">นัดหมายเข้าชมสถานที่</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                ประสานงานนัดหมายเข้าเยี่ยมชมสถานที่จริง พูดคุยกับทีมผู้ดูแลประจำศูนย์ก่อนตัดสินใจ
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
                                4
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">เข้าพักอย่างอุ่นใจ</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                ยืนยันการเข้าพัก พร้อมการติดตามดูแลความพึงพอใจจากทีมงาน ThaiCareCenter
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SECTION: สำหรับศูนย์ดูแลผู้สูงอายุและพาร์ทเนอร์ (B2B Services) */}
            <section id="b2b-services" className="py-20 bg-white border-b border-gray-100 scroll-mt-20">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-3 border border-indigo-100">
                            🏢 โซลูชันสำหรับสถานประกอบการ
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                            บริการสำหรับศูนย์ดูแลผู้สูงอายุ (พาร์ทเนอร์)
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                            ยกระดับศูนย์ดูแลของคุณให้เติบโตอย่างมั่นคง เข้าถึงกลุ่มครอบครัวที่กำลังมองหาการดูแลอย่างตรงจุด
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* B2B 1: หน้าร้านออนไลน์พรีเมียม */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Store className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">B2B Feature 01</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">สร้างหน้าร้านออนไลน์ (Premium Profile)</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                ยกระดับจากแค่ชื่อในลิสต์ เป็นมินิเว็บไซต์ส่วนตัวที่สวยงาม น่าเชื่อถือ พร้อมเครื่องหมาย Official Partner แสดงจุดเด่นและบริการของคุณได้อย่างโดดเด่น
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>แกลเลอรีรูปภาพความคมชัดสูง และวิดีโอนำชมสถานที่</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ป้ายยืนยันตัวตน Official Partner เพิ่มความไว้วางใจ</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ปุ่มโทรติดต่อตรงและแอดไลน์ผู้ดูแลศูนย์ทันที</span>
                                </div>
                            </div>
                        </div>

                        {/* B2B 2: ระบบคัดกรองผู้ป่วยคุณภาพ */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Users className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">B2B Feature 02</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">ระบบคัดกรองผู้รับบริการ (Qualified Referrals)</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                ช่วยคัดกรองเคสผู้สูงอายุเบื้องต้น ทั้งระดับการดูแลที่ต้องการและงบประมาณ ให้ตรงกับความเชี่ยวชาญและความพร้อมของศูนย์คุณ ช่วยลดเวลาการประสานงาน
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ส่งต่อเฉพาะครอบครัวที่มีความต้องการจริงและพร้อมเข้าพัก</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Dashboard ติดตามสถานะผู้ป่วยและการประสานงาน</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>การแจ้งเตือนเคสใหม่ผ่านระบบอัตโนมัติ</span>
                                </div>
                            </div>
                        </div>

                        {/* B2B 3: ระบบนัดหมายเยี่ยมชม Smart Booking */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <CalendarCheck className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">B2B Feature 03</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">ระบบนัดหมายเยี่ยมชมศูนย์ (Smart Booking)</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                จัดการตารางเยี่ยมชมศูนย์ตลอด 24 ชั่วโมง ลดปัญหาการจองซ้อน และช่วยให้ทีมงานจัดเตรียมการต้อนรับครอบครัวได้อย่างเป็นมืออาชีพ
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ปฏิทินนัดหมายแบบ Real-time จัดการวันว่างได้อิสระ</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ระบบส่งข้อความแจ้งเตือนลูกค้าล่วงหน้า ลดอัตรา No-show</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>กดยืนยันหรือเลื่อนเวลานัดหมายได้สะดวกเพียงคลิกเดียว</span>
                                </div>
                            </div>
                        </div>

                        {/* B2B 4: การดันอันดับ Local SEO */}
                        <div className="bg-slate-50/70 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">B2B Feature 04</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">ดันอันดับการค้นหาพื้นที่ (Local Care SEO)</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                ทำให้ศูนย์ดูแลของคุณขึ้นอันดับต้นๆ เมื่อมีผู้ค้นหาในทำเลใกล้เคียง ทั้งคำค้นหาใกล้สถานีรถไฟฟ้า และใกล้โรงพยาบาลในจังหวัดของคุณ
                            </p>
                            <div className="space-y-2.5 border-t border-gray-200/60 pt-5">
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>ปรับแต่ง Keyword เฉพาะพื้นที่และเขตเทศบาล</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>เชื่อมโยงระบบค้นหาตามสถานี BTS/MRT และโรงพยาบาล</span>
                                </div>
                                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>โอกาสได้รับการคัดเลือกในบทความแนะนำศูนย์ดีเด่น</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href="/provider-signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all active:scale-95"
                        >
                            <Building2 className="w-5 h-5" />
                            <span>สมัครเป็นพาร์ทเนอร์ศูนย์ดูแล (ลงทะเบียนฟรี)</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. CTA Banner (Home Theme Care Advisor Banner) */}
            <div className="py-20 bg-white">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-2xl border border-blue-700/50">
                        {/* Background decorative circles */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 md:p-12">
                            <div className="lg:col-span-7 space-y-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                                    บริการฟรี · ไม่มีค่าใช้จ่ายแอบแฝง
                                </p>

                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                                    ต้องการปรึกษาเพื่อเลือกบริการที่เหมาะสมที่สุด?
                                </h2>

                                <p className="text-blue-100 text-sm md:text-base leading-relaxed font-light">
                                    ไม่ว่าคุณจะเป็นครอบครัวที่กำลังมองหาการดูแล หรือศูนย์ดูแลที่ต้องการร่วมงานกับเรา ทีมงาน <span className="font-semibold text-white">ThaiCareCenter</span> ยินดีดูแลคุณเสมอครับ
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-blue-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span>แนะนำศูนย์ตรงงบประมาณ</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span>ประสานงานนัดหมายเข้าชม</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span>ให้คำปรึกษาฟรี 100%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span>รับสมัครพาร์ทเนอร์ศูนย์ดูแล</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-wrap gap-3">
                                    <a
                                        href="tel:095-805-7052"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-white text-blue-900 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <Phone className="w-4 h-4 text-blue-600" />
                                        <span>โทรปรึกษาฟรี: 095-805-7052</span>
                                    </a>
                                    <a
                                        href="https://line.me/R/ti/p/%40256zihiv"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-[#06C755] hover:bg-[#05b04b] text-white transition-all shadow-md active:scale-95"
                                    >
                                        <img
                                            src="/images/LINE_APP_iOS.png"
                                            alt="LINE Icon"
                                            className="w-5 h-5 object-contain rounded-xs shrink-0"
                                        />
                                        <span>ติดต่อผ่าน LINE</span>
                                    </a>
                                </div>
                            </div>

                            <div className="lg:col-span-5 flex justify-center">
                                <div className="relative w-48 h-64 md:w-56 md:h-72">
                                    <img
                                        src="/images/mascot/mascot-welcoming.png"
                                        alt="ThaiCareCenter Care Advisor Mascot"
                                        className="w-full h-full object-contain filter drop-shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}