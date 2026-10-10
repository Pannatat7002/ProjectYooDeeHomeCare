import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Users,
    ArrowRight,
    Target,
    Globe,
    Handshake,
    Quote,
    ShieldCheck,
    HeartHandshake,
    Phone,
    CheckCircle2,
    Building2,
    MapPin,
    Award,
    Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'เกี่ยวกับเรา',
    description: 'ทำความรู้จักกับ ThaiCareCenter แพลตฟอร์มรวมศูนย์ดูแลผู้สูงอายุและผู้ป่วยพักฟื้นอันดับหนึ่งของไทย มุ่งมั่นยกระดับคุณภาพชีวิตผู้สูงอายุด้วยความโปร่งใสและได้มาตรฐาน',
};

export default function AboutPage() {
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
                    {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs md:text-sm font-semibold mb-6 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>เรื่องราวและพันธกิจของเรา · About ThaiCareCenter</span>
                    </div> */}

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
                        เราคือเพื่อนคู่คิด <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white">
                            เพื่อความอุ่นใจของทุกครอบครัว
                        </span>
                    </h1>

                    <p className="text-blue-100/90 text-base md:text-xl font-light drop-shadow-lg max-w-3xl mx-auto px-4 leading-relaxed">
                        มุ่งมั่นยกระดับคุณภาพชีวิตผู้สูงอายุไทย ด้วยการเชื่อมโยงครอบครัวเข้ากับศูนย์ดูแลที่ได้มาตรฐาน โปร่งใส และปลอดภัยในทุกมิติ
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">1,150+</div>
                            <div className="text-xs text-blue-200 font-medium">ศูนย์ดูแลทั่วประเทศ</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">77</div>
                            <div className="text-xs text-blue-200 font-medium">จังหวัดครอบคลุม</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-extrabold text-emerald-300 mb-1">ฟรี 100%</div>
                            <div className="text-xs text-blue-200 font-medium">ปรึกษา Care Advisor</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-extrabold text-amber-300 mb-1">สบส.</div>
                            <div className="text-xs text-blue-200 font-medium">คัดกรองมาตรฐานวิชาชีพ</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Vision Section (วิสัยทัศน์) */}
            <div className="py-20 bg-white border-b border-gray-100">
                <div className="container max-w-5xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4 border border-blue-100">
                            <Target className="w-3.5 h-3.5" /> วิสัยทัศน์ของเรา (Our Vision)
                        </div>

                        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-snug mb-6">
                            มุ่งสู่การเป็นแพลตฟอร์มศูนย์กลางอันดับหนึ่งของไทย <br />
                            ที่สร้างมาตรฐานการดูแลที่ <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">เท่าเทียม</span> และ <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">โปร่งใส</span>
                        </h2>

                        <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                            เราเชื่อว่าการตัดสินใจเลือกสถานที่ดูแลผู้สูงอายุไม่ควรเป็นเรื่องที่ต้องเสี่ยงดวง แต่ต้องเป็นกระบวนการที่เต็มไปด้วยข้อมูลที่ถูกต้อง ชัดเจน และมีผู้เชี่ยวชาญคอยให้คำแนะนำอยู่เคียงข้างเสมอ
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Mission Section (พันธกิจหลัก 3 ด้าน) */}
            <div className="py-20 bg-slate-50/70 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-14">
                        {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full mb-3 border border-emerald-200">
                            🎯 เป้าหมายการดำเนินงาน
                        </div> */}
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">พันธกิจของเรา (Our Mission)</h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                            มุ่งมั่นส่งมอบคุณค่าที่เป็นรูปธรรมให้แก่ทุกฝ่ายในระบบนิเวศการดูแลผู้สูงอายุไทย
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Mission 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Users className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">01. เพื่อผู้รับบริการ</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">เพื่อนคู่คิดของทุกครอบครัว</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                ช่วยค้นหาและคัดเลือกศูนย์ดูแลที่เหมาะสมกับอาการ งบประมาณ และทำเลที่สะดวกที่สุด พร้อมข้อมูลราคาและบริการที่โปร่งใส ตรวจสอบได้จริง
                            </p>
                        </div>

                        {/* Mission 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Globe className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">02. เพื่อสังคมผู้สูงอายุ</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">สร้างมาตรฐานที่เป็นธรรม</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                ผลักดันการสร้างฐานข้อมูลราคากลาง การรับรองตามมาตรฐาน สบส. และการรีวิวที่เชื่อถือได้ เพื่อยกระดับสุขภาวะของสังคมผู้สูงอายุไทย
                            </p>
                        </div>

                        {/* Mission 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Handshake className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">03. เพื่อศูนย์ดูแลและพาร์ทเนอร์</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">สนับสนุนสถานดูแลคุณภาพ</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                เปิดโอกาสให้สถานประกอบการที่มีหัวใจบริการ ทั้งขนาดเล็กและขนาดใหญ่ ได้นำเสนอคุณภาพอย่างเท่าเทียม และเข้าถึงครอบครัวที่ต้องการการดูแล
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Care Advisor Showcase (ทีมที่ปรึกษาประจำครอบครัว) */}
            <div className="py-20 bg-white border-y border-gray-100">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Image Showcase */}
                        <div className="lg:col-span-6 relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
                                <img
                                    src="/images/mascot/about-care-team.jpg"
                                    alt="ThaiCareCenter Care Advisor and Senior Care"
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">ทีม Care Advisor</h4>
                                            <p className="text-xs text-gray-500">ที่ปรึกษาประจำครอบครัว พร้อมดูแลและเคียงข้างคุณทุกวัน</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-6 space-y-6">
                            {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                💡 บริการที่ปรึกษาส่วนตัวฟรี
                            </div> */}

                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
                                มากกว่าแค่ระบบค้นหา <br />
                                เรามี <span className="text-blue-600">Care Advisor</span> คอยเคียงข้างคุณ
                            </h2>

                            <p className="text-gray-600 text-base leading-relaxed">
                                การตัดสินใจเลือกบ้านพักหรือศูนย์ดูแลสำหรับคุณพ่อคุณแม่และคนที่เรารัก เป็นเรื่องละเอียดอ่อนที่สุดของทุกครอบครัว ThaiCareCenter จึงออกแบบและสร้างทีม <span className="font-semibold text-gray-900">Care Advisor</span> ขึ้นมาเพื่อเป็นเพื่อนคู่คิดที่รับฟังทุกความกังวล
                            </p>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">คัดกรองศูนย์ดูแลอย่างเป็นกลาง</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">วิเคราะห์ตามอาการของผู้ป่วย (ติดเตียง, พักฟื้น, สมองเสื่อม) งบประมาณ และทำเลที่สะดวก</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">ประสานงานนัดหมายเข้าชมสถานที่</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">อำนวยความสะดวกในการติดต่อและนัดพบกับเจ้าหน้าที่และผู้บริหารของศูนย์ดูแลโดยตรง</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <HeartHandshake className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">บริการฟรี ไม่มีค่าใช้จ่ายแอบแฝง</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">ให้คำปรึกษาด้วยความจริงใจ เพื่อประโยชน์และความปลอดภัยสูงสุดของผู้สูงอายุ</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <a
                                    href="tel:095-805-7052"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>โทรปรึกษาฟรี: 095-805-7052</span>
                                </a>
                                <a
                                    href="https://line.me/R/ti/p/%40256zihiv"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#06C755] hover:bg-[#05b04b] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
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
                    </div>
                </div>
            </div>

            {/* 5. Core Values (คุณค่าหลัก 4 ประการ) */}
            <div className="py-20 bg-slate-50/60">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3 border border-blue-100">
                            ⭐ มาตรฐานการบริการ
                        </div> */}
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">ทำไมครอบครัวไทยจึงไว้วางใจเรา</h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                            เรายึดมั่นใน 4 หลักการสำคัญ เพื่อให้คุณได้รับสิ่งที่ดีที่สุดสำหรับคนที่คุณรัก
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">ตรวจสอบมาตรฐานจริง</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                คัดกรองศูนย์ที่มีใบอนุญาตถูกต้อง และมีทีมผู้ดูแลที่ผ่านการฝึกอบรมคอยดูแลอย่างใกล้ชิด
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">ค้นหาง่ายทุกทำเล</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                เลือกศูนย์ตามแนวรถไฟฟ้า BTS/MRT หรือใกล้โรงพยาบาลชั้นนำได้อย่างแม่นยำ
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">ราคาโปร่งใส</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                แสดงช่วงราคาเริ่มต้นชัดเจน เปรียบเทียบได้ทันที ไม่มีค่าบริการแอบแฝง
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">ดูแลด้วยหัวใจ</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                ทีมที่ปรึกษาพร้อมรับฟังและแนะนำอย่างจริงใจ เสมือนคนในครอบครัวของเราเอง
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Founder's Note (แนวคิดผู้ก่อตั้ง - Home Banner Palette) */}
            <div className="py-20 bg-white">
                <div className="container max-w-4xl mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white p-8 md:p-12 shadow-2xl border border-blue-700/50">
                        {/* Background glow decoration */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <Quote className="absolute top-8 left-8 w-16 h-16 text-blue-400/20 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-6 border border-blue-400/30">
                                💬 สารจากใจผู้ก่อตั้ง ThaiCareCenter
                            </div>

                            <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-6 italic text-blue-100">
                                “เราเริ่มต้นจากความเชื่อที่ว่า <br className="hidden sm:inline" />
                                <span className="text-white font-medium">การค้นหาที่พักพิงให้คนที่เรารัก ไม่ควรเป็นเรื่องยากหรือต้องเสี่ยงดวงอีกต่อไป”</span>
                            </blockquote>

                            <div className="space-y-4 text-blue-100/90 font-light leading-relaxed text-sm md:text-base">
                                <p>
                                    เราจึงมุ่งมั่นสร้าง ThaiCareCenter เพื่อเป็นพื้นที่กลางที่รวบรวมสถานดูแลมาตรฐานให้อยู่ในที่เดียวกัน
                                    ความตั้งใจสูงสุดคือการสร้างมาตรฐานที่เป็นธรรมให้กับวงการดูแลผู้สูงอายุไทย
                                </p>
                                <p>
                                    เพื่อให้โอกาสผู้ประกอบการทุกรายที่มีหัวใจบริการ ได้นำเสนอคุณภาพอย่างเท่าเทียม
                                    และทำให้คนไทยทุกคนเข้าถึงบริการการดูแลที่ดีได้อย่างสะดวก รวดเร็ว และอุ่นใจที่สุด
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-blue-700/60 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-600/80 border border-blue-400/40 flex items-center justify-center font-bold text-white text-base shadow-inner">
                                    TC
                                </div>
                                <div>
                                    <div className="font-semibold text-white">ทีมผู้ก่อตั้ง ThaiCareCenter</div>
                                    <div className="text-xs text-blue-300">Co-Founders & Care Advisory Board</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. CTA Banner (Home Theme Care Advisor Banner) */}
            <div className="pb-20 bg-white">
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
                                    พร้อมค้นหาศูนย์ดูแลที่เหมาะสมสำหรับคนที่คุณรักแล้วหรือยัง?
                                </h2>

                                <p className="text-blue-100 text-sm md:text-base leading-relaxed font-light">
                                    ให้ทีม <span className="font-semibold text-white">Care Advisor</span> ช่วยคัดกรองศูนย์ดูแลที่ได้มาตรฐาน ปลอดภัย ตรงตามงบประมาณและทำเลที่คุณสะดวกที่สุด
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
                                        <span>ข้อมูลโปร่งใส ตรวจสอบได้</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-wrap gap-3">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-white text-blue-900 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <span>ค้นหาศูนย์ดูแลทันที</span>
                                        <ArrowRight className="w-4 h-4 text-blue-600" />
                                    </Link>
                                    <a
                                        href="tel:095-805-7052"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>โทร 095-805-7052</span>
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