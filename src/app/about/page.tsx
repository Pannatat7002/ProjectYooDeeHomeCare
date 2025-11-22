
import React from 'react';
import Link from 'next/link';
import { Heart, Shield, Users, Clock, ArrowRight } from 'lucide-react';
export default function AboutPage() {
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div
                    className="relative h-[450px] flex items-center justify-center bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/hero-background.jpg")',
                        backgroundPosition: 'center 40%',
                    }}
                >
                    <div className="absolute inset-0 bg-blue-900/60"></div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">เกี่ยวกับเรา</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            YoodeeHomeCare มุ่งมั่นที่จะยกระดับคุณภาพชีวิตของผู้สูงอายุและผู้ป่วยพักฟื้น
                            ด้วยการเชื่อมโยงท่านกับศูนย์ดูแลที่มีคุณภาพและได้มาตรฐาน
                        </p>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="py-16 container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">วิสัยทัศน์และพันธกิจ</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                เราเชื่อว่าทุกคนสมควรได้รับการดูแลที่ดีที่สุดในช่วงเวลาที่สำคัญของชีวิต
                                พันธกิจของเราคือการสร้างแพลตฟอร์มที่รวบรวมศูนย์ดูแลผู้สูงอายุและผู้ป่วยพักฟื้นที่น่าเชื่อถือ
                                เพื่อให้ครอบครัวสามารถตัดสินใจเลือกสิ่งที่ดีที่สุดให้กับคนที่พวกเขารักได้อย่างมั่นใจ
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                เราคัดกรองและตรวจสอบคุณภาพของศูนย์ดูแลทุกแห่งที่เข้าร่วมกับเรา
                                เพื่อให้มั่นใจว่าผู้ใช้บริการจะได้รับบริการที่ปลอดภัย อบอุ่น และได้มาตรฐานวิชาชีพ
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <Heart className="w-10 h-10 text-blue-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">ใส่ใจด้วยรัก</h3>
                                <p className="text-sm text-gray-500">การดูแลที่เปี่ยมด้วยความเข้าใจและเอื้ออาทร</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-8">
                                <Shield className="w-10 h-10 text-blue-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">มาตรฐานความปลอดภัย</h3>
                                <p className="text-sm text-gray-500">คัดกรองศูนย์ดูแลที่ได้มาตรฐานและปลอดภัย</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <Users className="w-10 h-10 text-blue-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">ทีมงานมืออาชีพ</h3>
                                <p className="text-sm text-gray-500">บุคลากรที่มีความเชี่ยวชาญและประสบการณ์</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-8">
                                <Clock className="w-10 h-10 text-blue-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">ดูแลตลอด 24 ชม.</h3>
                                <p className="text-sm text-gray-500">อุ่นใจได้ตลอดเวลากับการดูแลอย่างใกล้ชิด</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Story */}
                <div className="bg-white py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">เรื่องราวของเรา</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                YoodeeHomeCare ก่อตั้งขึ้นจากประสบการณ์ส่วนตัวที่ต้องมองหาสถานที่ดูแลสำหรับคนในครอบครัว
                                เราพบว่าการหาข้อมูลที่ครบถ้วนและน่าเชื่อถือนั้นเป็นเรื่องยาก
                                จึงเกิดเป็นแรงบันดาลใจในการสร้างพื้นที่กลางที่รวบรวมข้อมูลศูนย์ดูแลต่างๆ ไว้อย่างเป็นระบบ
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                วันนี้ เราภูมิใจที่เป็นส่วนหนึ่งในการช่วยเหลือหลายพันครอบครัวให้พบกับสถานที่ดูแลที่ ใช่
                                และเรายังคงมุ่งมั่นพัฒนาบริการของเราต่อไปเพื่อคุณภาพชีวิตที่ดีขึ้นของสังคมผู้สูงอายุไทย
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-blue-50 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">พร้อมที่จะค้นหาสถานที่ดูแลที่ใช่หรือยัง?</h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            ให้เราช่วยคุณค้นหาศูนย์ดูแลที่เหมาะสมที่สุดสำหรับคนที่คุณรัก
                            ด้วยฐานข้อมูลที่ครอบคลุมและทีมงานที่พร้อมให้คำปรึกษา
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
                                ค้นหาศูนย์ดูแล <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link href="/contact" className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                ติดต่อเรา
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
