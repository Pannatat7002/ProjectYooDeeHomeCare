import React from 'react';
import Link from 'next/link';
import { Activity, HeartPulse, Home, Clock, CheckCircle, ArrowRight, TrendingUp, Briefcase, GraduationCap, Handshake, Megaphone, LayoutDashboard, Users, BarChart3, Store, CalendarCheck, Search, MessageSquare } from 'lucide-react';

export default function ServicesPage() {
    // const services = [
    //     {
    //         icon: <Home className="w-10 h-10 text-blue-600" />, // ลดขนาด Icon
    //         title: "ศูนย์ดูแลผู้สูงอายุรายเดือน",
    //         description: "บริการดูแลแบบพักค้างคืนระยะยาว เหมาะสำหรับผู้ที่ต้องการการดูแลอย่างใกล้ชิดตลอด 24 ชั่วโมง", // ทำให้ Description สั้นลงเล็กน้อย
    //         features: ["ห้องพักสะอาด ปลอดภัย", "อาหาร 3 มื้อ + อาหารว่าง", "พยาบาลวิชาชีพดูแล"] // จำกัด Features ที่แสดงใน List
    //     },
    //     {
    //         icon: <Clock className="w-10 h-10 text-blue-600" />,
    //         title: "ศูนย์ดูแลระหว่างวัน (Day Care)",
    //         description: "บริการดูแลแบบเช้าไปเย็นกลับ เหมาะสำหรับบุตรหลานที่ทำงาน และต้องการให้ผู้สูงอายุมีสังคมและกิจกรรมทำ",
    //         features: ["กิจกรรมฝึกสมอง", "กายภาพบำบัดเบื้องต้น", "อาหารกลางวันและอาหารว่าง"]
    //     },
    //     {
    //         icon: <HeartPulse className="w-10 h-10 text-blue-600" />,
    //         title: "ดูแลผู้ป่วยระยะพักฟื้น",
    //         description: "บริการดูแลผู้ป่วยหลังผ่าตัด หรือผู้ป่วยโรคหลอดเลือดสมองที่ต้องการการฟื้นฟูสมรรถภาพทางร่างกายอย่างเข้มข้น",
    //         features: ["กายภาพบำบัดโดยผู้เชี่ยวชาญ", "ดูแลแผลกดทับ", "ติดตามอาการใกล้ชิด"]
    //     },
    //     {
    //         icon: <Activity className="w-10 h-10 text-blue-600" />,
    //         title: "บริการจัดส่งผู้ดูแลตามบ้าน",
    //         description: "บริการส่งพนักงานดูแลผู้สูงอายุหรือผู้ป่วยไปดูแลที่บ้านของท่าน ทั้งแบบรายวันและรายเดือนเพื่อความสะดวกสบาย",
    //         features: ["ผู้ดูแลผ่านการอบรม", "เปลี่ยนตัวผู้ดูแลได้", "มีทีมพยาบาลให้คำปรึกษา"]
    //     }
    // ];
    const b2bPlatformServices = [
        {
            icon: <Store className="w-10 h-10 text-blue-600" />,
            title: "สร้างหน้าร้านออนไลน์ (Premium Profile)",
            description: "เปลี่ยนจากการมีชื่อแค่ในลิสต์ เป็น 'มินิเว็บไซต์' ส่วนตัวที่สวยงาม น่าเชื่อถือ ดึงดูดลูกค้าให้อยากคลิกเข้ามาดู",
            features: ["อัปโหลดรูปภาพและวิดีโอ 360°", "แสดงรีวิวและคะแนนจากผู้ใช้จริง", "ปุ่ม Call-to-Action (โทร/ไลน์) ที่ชัดเจน"]
        },
        {
            icon: <CalendarCheck className="w-10 h-10 text-blue-600" />,
            title: "ระบบนัดหมายเยี่ยมชม (Smart Booking)",
            description: "ไม่ต้องคอยตอบแชทเพื่อนัดเวลา ระบบจัดการตารางเยี่ยมชมศูนย์ให้อัตโนมัติ 24 ชม. ไม่พลาดลูกค้าแม้ตอนคุณหลับ",
            features: ["ซิงค์ปฏิทิน Real-time ลดการจองซ้อน", "ระบบแจ้งเตือน SMS/Email ก่อนถึงวันนัด", "เจ้าของกดยืนยันหรือเลื่อนนัดได้ง่าย"]
        },
        {
            icon: <Search className="w-10 h-10 text-blue-600" />,
            title: "ดันอันดับการค้นหา (Local SEO Booster)",
            description: "ทำให้ศูนย์ของคุณอยู่อันดับต้นๆ บน Google เมื่อมีคนค้นหาคำว่า 'ศูนย์ดูแลผู้สูงอายุ' ในพื้นที่ใกล้เคียงคุณ",
            features: ["ปรับแต่ง Keyword เฉพาะพื้นที่", "เพิ่มโอกาสติด Google Maps", "บทความแนะนำศูนย์ฯ ลงใน Blog ของเว็บ"]
        },
        {
            icon: <MessageSquare className="w-10 h-10 text-blue-600" />,
            title: "ระบบคัดกรองลูกค้า (Lead Qualification)",
            description: "ช่วยสแกนลูกค้าเบื้องต้น ส่งเฉพาะลูกค้าที่มี 'ความต้องการจริง' และ 'งบประมาณตรงกัน' ให้คุณ เพื่อไม่ให้เสียเวลา",
            features: ["ฟอร์มสอบถามอาการและงบประมาณ", "Dashboard จัดการสถานะลูกค้า", "แจ้งเตือนทันทีเมื่อมี Lead ใหม่เข้า"]
        }
    ];

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
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <h1 className="text-4xl font-bold mb-4">บริการของเรา</h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            ตอบโจทย์ทุกความต้องการในการดูแลผู้สูงอายุและผู้ป่วยพักฟื้น ด้วยบริการที่หลากหลาย
                        </p>
                    </div>
                </div>

                {/* Services Grid - ปรับให้กระชับ */}
                <div className="py-12 container mx-auto px-4"> {/* ลด py-16 เป็น py-12 */}
                    <div className="grid md:grid-cols-2 gap-6"> {/* ลด gap-8 เป็น gap-6 */}
                        {b2bPlatformServices.map((service, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="mb-4 bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center"> {/* ลดขนาดกล่อง icon และ mb */}
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3> {/* ลดขนาด H3 และ mb */}
                                <p className="text-gray-600 text-sm mb-4"> {/* ลดขนาด text และ mb */}
                                    {service.description}
                                </p>
                                <ul className="space-y-2 mb-6"> {/* ลด space-y และ mb */}
                                    {/* แสดงเฉพาะ 3 Features แรก เพื่อความกระชับ */}
                                    {service.features.slice(0, 3).map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-700 text-sm"> {/* ลดขนาด text */}
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> {/* ลดขนาด icon */}
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/contact" className="text-blue-600 text-sm font-semibold hover:text-blue-800 inline-flex items-center">
                                    สอบถามข้อมูลเพิ่มเติม <ArrowRight className="ml-2 w-3 h-3" /> {/* ลดขนาด icon */}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Process Section - ลดขนาด Padding */}
                <div className="bg-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">ขั้นตอนการใช้บริการ</h2>
                            <p className="text-gray-600 text-sm">ง่ายๆ เพียง 4 ขั้นตอน เพื่อเริ่มต้นการดูแลที่ดีที่สุด</p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-6 relative"> {/* ลด gap-8 เป็น gap-6 */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -z-10 transform -translate-y-1/2"></div>
                            {/* Process Steps (ไม่เปลี่ยนแปลงมากนัก แต่จะดูเล็กลงตามการลด P/M โดยรอบ) */}
                            {[
                                { step: "1", title: "ค้นหาข้อมูล", desc: "ค้นหาศูนย์ดูแลที่ตรงกับความต้องการของคุณ" },
                                { step: "2", title: "เปรียบเทียบ", desc: "เปรียบเทียบราคา บริการ และรีวิว" },
                                { step: "3", title: "นัดหมาย", desc: "นัดหมายเข้าเยี่ยมชมสถานที่จริง" },
                                { step: "4", title: "เข้าพัก", desc: "ยืนยันการจองและเริ่มรับบริการ" }
                            ].map((item, index) => (
                                <div key={index} className="bg-white p-4 text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold mx-auto mb-3 shadow-lg border-4 border-white">
                                        {item.step}
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 mb-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA - ลดขนาด Padding */}
                <div className="bg-blue-600 py-12 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold mb-4">ต้องการคำปรึกษาเพิ่มเติม?</h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-sm">
                            ทีมงานของเราพร้อมให้คำแนะนำในการเลือกรูปแบบการดูแลที่เหมาะสมที่สุดสำหรับคนที่คุณรัก โดยไม่มีค่าใช้จ่าย
                        </p>
                        <Link href="/contact" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-sm">
                            ติดต่อเจ้าหน้าที่
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}