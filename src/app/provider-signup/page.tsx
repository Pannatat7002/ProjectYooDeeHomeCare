'use client';

import React from 'react';
import { Heart, Users, TrendingUp, Shield, CheckCircle, MessageCircle, Phone, Mail, Clock, Award, Briefcase, GraduationCap } from 'lucide-react';

export default function ProviderSignupPage() {
    // LINE Official Account URL - แก้ไขเป็น LINE ID ของคุณ
    const LINE_URL = 'https://line.me/R/ti/p/@256zihiv'; // เปลี่ยนเป็น LINE Official Account ของคุณ

    const handleLineClick = () => {
        window.open(LINE_URL, '_blank');
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div
                    className="relative h-[450px] flex items-center justify-center bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/bg-home.jpg")',
                        backgroundPosition: 'center 40%',
                    }}
                >
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white py-20">
                        <div className="inline-block mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                            <span className="text-sm font-semibold">💼 ร่วมงานกับเรา</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            สมัครเป็นผู้ดูแลผู้สูงอายุ
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
                            ร่วมเป็นส่วนหนึ่งในการดูแลและมอบความสุขให้กับผู้สูงอายุ พร้อมรายได้ที่ดีและสวัสดิการครบครัน
                        </p>
                        <button
                            onClick={handleLineClick}
                            className="inline-flex items-center px-10 py-4 bg-[#06C755] hover:bg-[#05b04b] text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-green-500/30 transition-all transform hover:scale-105 hover:-translate-y-1"
                        >
                            <img
                                src="/images/LINE_APP_iOS.png"
                                alt="LINE Icon"
                                className="w-8 h-8 mr-3 object-contain rounded-md flex-shrink-0"
                            />
                            Add LINE เพื่อสมัครงาน
                        </button>
                        <p className="mt-4 text-blue-200 text-sm">
                            💬 ติดต่อทีมงานผ่าน LINE เพื่อเริ่มต้นการสมัครงาน
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-6xl mx-auto">
                        {/* Benefits Section */}
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                ทำไมต้องเป็น Caregiver กับเรา?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                งานที่มีความหมาย รายได้ดี และสวัสดิการครบครัน
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">งานที่มีคุณค่า</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    ทำงานที่มีความหมาย ช่วยเหลือและดูแลผู้สูงอายุด้วยความรักและใส่ใจ
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">รายได้ดี</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    รายได้ที่เหมาะสมกับประสบการณ์ พร้อมโบนัสและสวัสดิการเพิ่มเติม
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">พัฒนาทักษะ</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    ได้รับการอบรมและพัฒนาทักษะอย่างต่อเนื่อง เพิ่มความเชี่ยวชาญ
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">สวัสดิการครบ</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    ประกันสุขภาพ ประกันอุบัติเหตุ และสวัสดิการอื่นๆ ครบครัน
                                </p>
                            </div>
                        </div>

                        {/* Requirements Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 mb-16 border-2 border-blue-100">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                คุณสมบัติผู้สมัคร
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">อายุ 20-55 ปี</h4>
                                        <p className="text-gray-600 text-sm">มีสุขภาพร่างกายแข็งแรง พร้อมทำงาน</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">มีใจรักในงานบริการ</h4>
                                        <p className="text-gray-600 text-sm">อดทน เสียสละ และรักในการดูแลผู้อื่น</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">มีประสบการณ์ (พิจารณาพิเศษ)</h4>
                                        <p className="text-gray-600 text-sm">ยินดีรับทั้งมีและไม่มีประสบการณ์ มีอบรมให้</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">พร้อมเรียนรู้และพัฒนา</h4>
                                        <p className="text-gray-600 text-sm">เปิดใจเรียนรู้สิ่งใหม่และพัฒนาตนเอง</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Types Section */}
                        <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                � ตำแหน่งงานที่เปิดรับ
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
                                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-lg">ผู้ดูแลประจำศูนย์</h4>
                                    <p className="text-gray-700 text-sm mb-3">ทำงานที่ศูนย์ดูแลผู้สูงอายุ</p>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• เวลา: 08:00-17:00 น.</li>
                                        <li>• หยุดวันอาทิตย์</li>
                                        <li>• เงินเดือน 15,000-25,000 บาท</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-indigo-200">
                                    <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-lg">ผู้ดูแลถึงบ้าน</h4>
                                    <p className="text-gray-700 text-sm mb-3">ดูแลผู้สูงอายุที่บ้านของลูกค้า</p>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• เวลา: ตามตกลง</li>
                                        <li>• ยืดหยุ่น Part-time/Full-time</li>
                                        <li>• รายได้ 400-800 บาท/วัน</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
                                    <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-lg">ผู้ดูแลพิเศษ (Live-in)</h4>
                                    <p className="text-gray-700 text-sm mb-3">ดูแลผู้ป่วยติดเตียง 24 ชม.</p>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• พักที่บ้านลูกค้า</li>
                                        <li>• หยุดตามตกลง</li>
                                        <li>• เงินเดือน 25,000-40,000 บาท</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Training & Benefits */}
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 border-2 border-green-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <GraduationCap className="w-7 h-7 mr-2 text-green-600" />
                                    การอบรม & พัฒนา
                                </h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>อบรมการดูแลผู้สูงอายุเบื้องต้น (ฟรี)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>อบรมการปฐมพยาบาลเบื้องต้น</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>อบรมการดูแลผู้ป่วยติดเตียง</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>Workshop และสัมมนาประจำเดือน</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>ใบประกาศนียบัตรหลังจบอบรม</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border-2 border-blue-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <Briefcase className="w-7 h-7 mr-2 text-blue-600" />
                                    สวัสดิการ
                                </h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">✓</span>
                                        <span>ประกันสุขภาพและอุบัติเหตุ</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">✓</span>
                                        <span>โบนัสตามผลงาน</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">✓</span>
                                        <span>ค่าเดินทาง/ค่าที่พัก (กรณีดูแลถึงบ้าน)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">✓</span>
                                        <span>วันหยุดตามกฎหมาย</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">✓</span>
                                        <span>เครื่องแบบและอุปกรณ์การทำงาน</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* How to Apply Section */}
                        <div className="mb-16 relative rounded-3xl overflow-hidden">
                            {/* 1. Background Image (อยู่ล่างสุด) */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: 'url("/images/hero-background.jpg")',
                                    backgroundPosition: 'center 40%',
                                }}
                            ></div>

                            {/* 2. Overlay (อยู่ตรงกลาง) - ใช้ Gradient สีน้ำเงิน-ม่วง ที่คุณระบุ */}
                            <div className="absolute inset-0 "></div>

                            {/* 3. Content (อยู่บนสุด) - มี Padding และ Text Color */}
                            <div className="relative z-10 p-10 text-white">
                                <h2 className="text-3xl font-bold mb-8 text-center">
                                    ขั้นตอนการสมัครงาน
                                </h2>
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                            1
                                        </div>
                                        <h4 className="font-bold text-lg mb-2">Add LINE</h4>
                                        <p className="text-blue-100 text-sm">
                                            เพิ่มเพื่อนและแจ้งความประสงค์สมัครงาน
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                            2
                                        </div>
                                        <h4 className="font-bold text-lg mb-2">ส่งข้อมูล</h4>
                                        <p className="text-blue-100 text-sm">
                                            ส่งประวัติและข้อมูลส่วนตัว
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                            3
                                        </div>
                                        <h4 className="font-bold text-lg mb-2">สัมภาษณ์</h4>
                                        <p className="text-blue-100 text-sm">
                                            นัดสัมภาษณ์และทดสอบความเหมาะสม
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                            4
                                        </div>
                                        <h4 className="font-bold text-lg mb-2">เริ่มงาน</h4>
                                        <p className="text-blue-100 text-sm">
                                            อบรมและเริ่มปฏิบัติงาน
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center bg-white rounded-3xl p-12 shadow-2xl border-2 border-blue-100">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                พร้อมเริ่มต้นอาชีพใหม่แล้วใช่ไหม?
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                ติดต่อเราวันนี้เพื่อสมัครงานและเริ่มต้นเส้นทางอาชีพที่มีความหมาย
                            </p>
                            <button
                                onClick={handleLineClick}
                                className="inline-flex items-center px-12 py-5 bg-[#06C755] hover:bg-[#05b04b] text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-green-500/30 transition-all transform hover:scale-105 hover:-translate-y-1 mb-6"
                            >
                                <img
                                    src="/images/LINE_APP_iOS.png"
                                    alt="LINE Icon"
                                    className="w-9 h-9 mr-3 object-contain rounded-md flex-shrink-0"
                                />
                                Add LINE เพื่อสมัครงานเลย
                            </button>

                            {/* Contact Info */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <p className="text-gray-600 mb-6 font-semibold">หรือติดต่อเราผ่านช่องทางอื่น</p>
                                <div className="flex flex-wrap justify-center gap-6">
                                    <div className="flex items-center text-gray-700">
                                        <Phone className="w-5 h-5 mr-2 text-blue-600" />
                                        <span className="font-medium">095-805-7052</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                        <span className="font-medium">thaicarecenter01@gmail.com</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                        <span className="font-medium">จันทร์-ศุกร์ 09:00-18:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
