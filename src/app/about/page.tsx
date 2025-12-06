import React from 'react';
import Link from 'next/link';
import { Heart, Shield, Users, Clock, ArrowRight, Target, Globe, Handshake, Quote } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* 1. Hero Section: เรียบหรู ดูน่าเชื่อถือ */}
            <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{
                        backgroundImage: 'url("/images/bg-home.jpg")', // อย่าลืมใส่รูปจริงที่นี่
                        backgroundPosition: 'center 20%',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r bg-black/50"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-100 text-sm font-medium mb-4 backdrop-blur-sm">
                        ThaiCareCenter
                    </span>
                    <h1 className="text-4xl md:text-4xl font-bold mb-6 text-white tracking-tight">
                        เราคือเพื่อนคู่คิด เพื่อคนที่คุณรัก
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-light">
                        มุ่งมั่นยกระดับคุณภาพชีวิตผู้สูงอายุไทย ด้วยการเชื่อมโยงครอบครัว
                        เข้ากับศูนย์ดูแลที่มีมาตรฐานและปลอดภัย
                    </p>
                </div>
            </div>

            {/* 2. Vision Section: เน้นข้อความให้มีพลัง */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Target className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-6 uppercase tracking-wider">วิสัยทัศน์ของเรา</h2>
                        <h3 className="text-3xl md:text-4xl font-medium text-slate-800 leading-snug mb-8">
                            มุ่งสู่การเป็นแพลตฟอร์มศูนย์กลางอันดับหนึ่งของไทย <br className="hidden md:block" />
                            ที่สร้างมาตรฐานการดูแลที่<span className="text-blue-600">เท่าเทียม</span> และ <span className="text-blue-600">โปร่งใส</span>
                        </h3>
                        <div className="w-24 h-1 bg-blue-200 mx-auto rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* 3. Mission Cards: เปลี่ยนจาก List เป็น Card ให้อ่านง่าย */}
            <div className="py-20 bg-slate-50 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">พันธกิจของเรา (Mission)</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">เพื่อผู้ใช้บริการ</h3>
                            <p className="text-slate-600 leading-relaxed">
                                เป็นผู้ช่วยค้นหาสถานที่ดูแลที่ ใช่ ที่สุด ตรงตามงบประมาณและทำเลที่ตั้ง ด้วยข้อมูลที่โปร่งใส
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">เพื่อสังคม</h3>
                            <p className="text-slate-600 leading-relaxed">
                                สร้างมาตรฐานราคากลางและการบริการที่เป็นระบบ ให้ครอบครัวไทยตัดสินใจได้อย่างมั่นใจ
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">เพื่อพันธมิตร</h3>
                            <p className="text-slate-600 leading-relaxed">
                                เปิดโอกาสให้สถานประกอบการคุณภาพ ทั้งรายเล็กและใหญ่ ได้นำเสนอบริการอย่างเท่าเทียม
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Core Values: จุดแข็งของเรา (แยกออกมาให้เด่น) */}
            {/* <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">ทำไมต้อง ThaiCareCenter?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">เราคัดสรรสิ่งที่ดีที่สุด เพื่อความสบายใจของคนในครอบครัว</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Heart, color: "text-rose-500", bg: "bg-rose-50", title: "ใส่ใจด้วยรัก", desc: "การดูแลที่เปี่ยมด้วยความเข้าใจและเอื้ออาทร" },
                            { icon: Shield, color: "text-blue-600", bg: "bg-blue-50", title: "มาตรฐานความปลอดภัย", desc: "คัดกรองศูนย์ดูแลที่ได้มาตรฐานและปลอดภัย" },
                            { icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", title: "ทีมงานมืออาชีพ", desc: "บุคลากรที่มีความเชี่ยวชาญและประสบการณ์" },
                            { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", title: "ดูแลตลอด 24 ชม.", desc: "อุ่นใจได้ตลอดเวลากับการดูแลอย่างใกล้ชิด" }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mb-4 ${item.color}`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div> */}

            {/* 5. Founder's Note: ทำเป็น Quote สวยๆ */}
            <div className="py-20 bg-blue-900 text-white relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-blue-800/50 rounded-3xl p-8 md:p-12 relative backdrop-blur-sm border border-blue-700">
                        <Quote className="absolute top-8 left-8 w-12 h-12 text-blue-500/30 -translate-x-2 -translate-y-2" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-blue-400"></span>
                                แนวคิดผู้ก่อตั้ง
                            </h2>
                            <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic text-blue-100">
                                เราเริ่มต้นจากความเชื่อที่ว่า <br />
                                <span className="text-white font-medium">การค้นหาที่พักพิงให้คนที่เรารัก ไม่ควรเป็นเรื่องยากหรือต้องเสี่ยงดวง</span>
                            </blockquote>

                            <div className="space-y-4 text-blue-200 font-light leading-relaxed text-lg">
                                <p>
                                    เราจึงมุ่งมั่นสร้าง ThaiCareCenter เพื่อเป็น พื้นที่กลาง ที่รวบรวมสถานดูแลมาตรฐานให้อยู่ในที่เดียวกัน
                                    ความตั้งใจสูงสุดคือการสร้าง มาตรฐานเดียว ให้กับวงการดูแลผู้สูงอายุไทย
                                </p>
                                <p>
                                    เพื่อให้โอกาสผู้ประกอบการทุกรายที่มีหัวใจบริการ ได้นำเสนอคุณภาพอย่างเท่าเทียม
                                    และทำให้คนไทยทุกคนเข้าถึงบริการสาธารณสุขที่ดีได้อย่างสะดวก รวดเร็ว และอุ่นใจที่สุด
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-blue-700/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    PS
                                </div>
                                <div>
                                    <div className="font-semibold text-white">ผู้ก่อตั้ง ThaiCareCenter</div>
                                    <div className="text-sm text-blue-300">Co-Founder</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. CTA Section */}
            <div className="py-24 bg-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                        พร้อมที่จะค้นหาสถานที่ดูแลที่ใช่หรือยัง?
                    </h2>
                    <p className="text-slate-600 mb-10 max-w-2xl mx-auto text-lg">
                        ให้เราช่วยคุณค้นหาศูนย์ดูแลที่เหมาะสมที่สุดสำหรับคนที่คุณรัก
                        ด้วยฐานข้อมูลที่ครอบคลุมและทีมงานที่พร้อมให้คำปรึกษา
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/" className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1">
                            ค้นหาศูนย์ดูแล <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                            ติดต่อทีมงาน
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}