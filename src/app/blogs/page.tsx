/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
// สมมติว่าไฟล์ types.ts อยู่ในระดับบน
import { Blog } from '../../types';
import { Calendar, User, ArrowRight, BookOpen, Clock, Lightbulb, TrendingUp } from 'lucide-react';

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// กำหนดสีตามที่คุณต้องการ (#3a639b)
const MAIN_BLUE_HEX = '#3a639b';
const MAIN_BLUE_LIGHT = 'bg-[#3a639b]/5';

// ข้อมูลสำหรับ Footer Detail (ข้อแนะนำการอ่านหนังสือ)
const FooterDetail = {
    title: "คำแนะนำและข้อดีของการอ่านหนังสือสำหรับผู้สูงอายุ",
    intro: "การอ่านหนังสือเป็นกิจกรรมสำคัญที่มอบประโยชน์รอบด้านสำหรับผู้สูงอายุ เป็นเครื่องมืออันทรงพลังในการรักษาสุขภาพของสมองและจิตใจให้แข็งแรงและกระฉับกระเฉงอย่างต่อเนื่อง",
    benefits: [
        "กระตุ้นการทำงานของสมอง: ช่วยบริหารความจำ การคิดวิเคราะห์ และชะลอความเสื่อมของสมอง",
        "เพิ่มพูนความรู้และมุมมอง: ได้รับข้อมูลใหม่ ๆ ในหลากหลายสาขาที่เป็นประโยชน์ต่อการใช้ชีวิต",
        "พัฒนาทักษะทางภาษาและการสื่อสาร: เรียนรู้คำศัพท์และสำนวนใหม่ ๆ ช่วยให้สื่อสารได้อย่างมั่นใจ",
        "ฝึกสมาธิและความตั้งใจ: การจดจ่อกับเนื้อหาเป็นวิธีที่ดีในการฝึกสติ ทำให้จิตใจสงบ",
        "ส่งเสริมการผ่อนคลายและลดความเครียด: ช่วยให้จิตใจได้พักผ่อนจากความกังวลในชีวิตจริง",
        "เสริมสร้างจินตนาการและความคิดสร้างสรรค์: ได้ฝึกฝนการวาดภาพในใจตามเรื่องราวที่อ่าน",
        "เป็นแหล่งความบันเทิงชั้นดี: การเพลิดเพลินไปกับเรื่องราวที่น่าสนใจเป็นการเติมเต็มความสุขในแต่ละวัน"
    ],
    selectionGuide: [
        "เลือกจากความสนใจส่วนตัว: ให้ผู้สูงอายุเลือกอ่านในหัวข้อที่ตนเองชื่นชอบ เช่น สุขภาพ สวน ธรรมะ หรือชีวประวัติ",
        "พิจารณาความสะดวกในการอ่าน: ควรมีตัวอักษรขนาดใหญ่ ชัดเจนสบายตา และใช้ภาษาที่เข้าใจง่าย",
        "เน้นเนื้อหาที่สร้างสรรค์และเป็นประโยชน์: เลือกหนังสือที่ช่วยพัฒนาทักษะใหม่ ๆ มอบแรงบันดาลใจ หรือเข้าใจชีวิตได้ลึกซึ้งขึ้น"
    ]
};

interface BlogGridProps {
    blogList: Blog[];
    title: string;
    icon: ReactNode;
}

const BlogGrid = ({ blogList, title, icon }: BlogGridProps) => (
    <>
        <h2 className="text-2xl font-bold text-gray-800 mb-8 mt-12 flex items-center border-b border-gray-200 pb-3">
            {icon}
            <span className="text-[#3a639b]">{title}</span>
        </h2>
        {blogList.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200 text-gray-500">
                ยังไม่มีบทความในหมวดหมู่นี้
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogList.map((blog) => (
                    <Link
                        key={blog.id}
                        href={`/blogs/${blog.slug}`}
                        className="group flex flex-col h-full bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
                    >
                        {/* Card Content (ใช้โค้ดเดิม) */}
                        <div className="relative h-48 md:h-52 overflow-hidden bg-gray-100 border-b border-gray-200">
                            {blog.isRecent && (
                                <div className="absolute top-0 left-0 z-10 bg-[#3a639b] px-3 py-1">
                                    <span className="text-white text-xs font-semibold">
                                        ล่าสุด
                                    </span>
                                </div>
                            )}
                            <img
                                src={blog.coverImage || 'https://via.placeholder.com/800x600?text=Official+Document+Cover'}
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:opacity-90"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available')}
                            />
                        </div>

                        <div className="flex flex-col flex-grow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-[#3a639b] transition-colors">
                                {blog.title}
                            </h2>

                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                {blog.excerpt || 'คลิกเพื่อเข้าถึงเอกสารฉบับเต็มและรายละเอียดเพิ่มเติม...'}
                            </p>

                            <div className="text-xs font-medium text-gray-500 space-y-2 pt-3 border-t border-gray-100 mt-auto">
                                <div className="flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-2 text-[#3a639b]" />
                                    <span className='text-gray-700'>วันที่เผยแพร่: **{formatDate(blog.createdAt)}**</span>
                                </div>
                                {blog.author && (
                                    <div className="flex items-center">
                                        <User className="w-3.5 h-3.5 mr-2 text-[#3a639b]" />
                                        <span className="truncate max-w-[200px] text-gray-700">โดย: {blog.author}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <span className="text-sm font-semibold text-[#3a639b] hover:text-[#3a639b]/80 transition-colors flex items-center border border-[#3a639b]/50 px-3 py-2 rounded-md justify-center bg-[#3a639b]/5">
                                    อ่าน/ดาวน์โหลดเอกสาร
                                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </>
);

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blogs?published=true')
            .then(res => res.json())
            .then(data => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const modifiedData = data.map((blog: Blog) => ({
                    ...blog,
                    isRecent: new Date(blog.createdAt) > sevenDaysAgo,
                    // สมมติว่า 2 บทความแรกเป็นบทความแนะนำ (Featured)
                    isFeatured: blog.id % 5 === 0 // ตัวอย่างการกำหนด featured
                }));

                setBlogs(modifiedData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
    }, []);

    const featuredBlogs = blogs.filter(blog => blog.isFeatured);
    const otherBlogs = blogs.filter(blog => !blog.isFeatured);
    // ในชีวิตจริง อาจจะต้องมี logic สำหรับบทความยอดนิยม (Popular) เช่น อิงจาก view count



    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Official Hero Section */}
            <div className="relative bg-white border-b-4 border-[#3a639b] shadow-md overflow-hidden">
                <div className="relative container mx-auto px-4 py-16 text-center">
                    <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wide text-[#3a639b] uppercase bg-[#3a639b]/10 border-b-2 border-[#3a639b]/50">
                        ศูนย์กลางข้อมูลสารสนเทศ (Information Center)
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-snug">
                        เอกสาร <span className="text-[#3a639b]">บทความวิชาการ</span> และข่าวสาร
                    </h1>
                    <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed border-t pt-4 mt-6">
                        รวมเกร็ดความรู้เกี่ยวกับการดูแลผู้สูงอายุ สุขภาพ และเทคนิคการเลือกศูนย์ดูแลที่ดีที่สุด
                        เพื่อคนที่คุณรัก **ตามหลักวิชาการและแนวทางปฏิบัติของหน่วยงาน**
                    </p>
                </div>
            </div>

            {/* 2. Content Section - Grid of Official-looking Cards */}
            <div className="container mx-auto max-w-7xl px-4 py-16">

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse">
                                <div className="bg-gray-100 h-40 rounded-md mb-4"></div>
                                <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2 mb-6"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-11/12"></div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-inner border border-gray-300">
                        <div className="mx-auto w-14 h-14 bg-[#3a639b]/10 border border-[#3a639b]/30 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="w-7 h-7 text-[#3a639b]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่มีข้อมูลบทความที่เผยแพร่</h3>
                        <p className="text-gray-500">
                            อยู่ระหว่างการรวบรวมและตรวจสอบความถูกต้องของเนื้อหาตามระเบียบ
                        </p>
                    </div>
                ) : (
                    <>
                        {/* 2.1 บทความแนะนำ (Featured Articles) */}
                        <BlogGrid
                            blogList={featuredBlogs}
                            title="บทความแนะนำ"
                            icon={<Lightbulb className="w-5 h-5 mr-3 text-yellow-600" />}
                        />

                        {/* 2.2 บทความยอดนิยม (Popular Articles) - แสดงเฉพาะหัวข้อ, หากมีข้อมูลก็สามารถแสดงได้ */}
                        {/* เนื่องจากไม่มีข้อมูลยอดนิยม จึงใส่เป็นส่วนที่สองที่อาจจะว่าง หรือใช้ logic อื่น ๆ แทน */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 mt-12 flex items-center border-b border-gray-200 pb-3">
                            <TrendingUp className="w-5 h-5 mr-3 text-green-600" />
                            <span className="text-[#3a639b]">บทความยอดนิยม (Trending)</span>
                        </h2>
                        <div className="text-center py-5 bg-gray-100 rounded-lg border border-gray-200 text-gray-700 text-sm">
                            <p>ข้อมูลบทความยอดนิยมอยู่ระหว่างการประมวลผลสถิติ</p>
                        </div>


                        {/* 2.3 บทความอื่นๆ (Other Articles) */}
                        <BlogGrid
                            blogList={otherBlogs}
                            title="บทความอื่นๆ ทั้งหมด"
                            icon={<BookOpen className="w-5 h-5 mr-3 text-[#3a639b]" />}
                        />
                    </>
                )}
            </div>

            {/* 3. Footer Detail - ข้อแนะนำการอ่านหนังสือสำหรับผู้สูงอายุ */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-16">
                <div className="container mx-auto max-w-7xl px-4 py-16">
                    {/* กล่องคำแนะนำหลัก - ใช้สีน้ำเงินเข้ม/ทองอ่อน เพื่อความรู้สึกมั่นคงและมีคุณภาพ */}
                    <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-blue-100/70">
                        <h3 className="text-3xl font-extrabold text-blue-900 mb-6 flex items-center justify-center text-center">
                            {/* BookOpen ควรถูก import มาใช้งาน */}
                            <BookOpen className="w-8 h-8 mr-3 text-amber-500" />
                            {FooterDetail.title}
                        </h3>
                        <p className="text-gray-600 mb-8 text-center md:text-lg leading-relaxed max-w-4xl mx-auto">
                            {FooterDetail.intro}
                        </p>

                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* ส่วนที่ 1: ประโยชน์ - เน้นสีเขียว (สื่อถึงสุขภาพ/การเติบโต) */}
                            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 shadow-md">
                                <h4 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                                    <span className='mr-2 text-2xl'>🌿</span> ประโยชน์อันน่าทึ่งของการอ่าน
                                </h4>
                                <ul className="space-y-3 text-gray-700 list-none pl-0">
                                    {FooterDetail.benefits.map((item, index) => (
                                        <li key={index} className="flex items-start text-base">
                                            <span className="text-green-500 font-bold mr-3 mt-1">✔</span>
                                            <p className="flex-1">{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ส่วนที่ 2: ข้อแนะนำในการเลือกหนังสือ - เน้นสีน้ำเงิน/ม่วง (สื่อถึงสติปัญญา/การเรียนรู้) */}
                            <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500 shadow-md">
                                <h4 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
                                    <span className='mr-2 text-2xl'>💡</span> แนวทางการเลือกหนังสือที่เหมาะสม
                                </h4>
                                <ol className="space-y-3 text-gray-700 list-decimal ml-5 text-base">
                                    {FooterDetail.selectionGuide.map((item, index) => (
                                        <li key={index} className="pl-1 font-medium">
                                            {item}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                    </div>

                    {/* ส่วนลิขสิทธิ์ */}
                    <div className='text-center text-xs text-gray-500 mt-12 pt-5 border-t border-gray-200'>
                        © {new Date().getFullYear()} ศูนย์กลางข้อมูลสารสนเทศ. สงวนลิขสิทธิ์.
                    </div>
                </div>
            </footer>
        </div >
    );
}