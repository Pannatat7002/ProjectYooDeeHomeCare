import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// ต้องแน่ใจว่า path ไปยัง getBlogs และ Blog type ถูกต้อง
import { getBlogs } from '../../../lib/db';
import { Blog } from '../../../types';
import { Calendar, User, ArrowLeft, Clock, ArrowRight, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
// สมมติว่า ShareButtons เป็น Client Component ที่สามารถทำงานได้ตามปกติ
import ShareButtons from './components/ShareButtons';

// Force dynamic rendering since we rely on external data
export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

// กำหนดสีหลักสำหรับความทางการ
const MAIN_BLUE_HEX = '#3a639b';

async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const blogs = await getBlogs();
    const decodedSlug = decodeURIComponent(slug).trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return blogs.find((b: any) => {
        const dbSlug = (b.slug || '').trim();
        return dbSlug === decodedSlug;
    });
}

// Helper function to calculate estimated reading time (simple, based on 200 words/min)
const calculateReadingTime = (content: string) => {
    if (!content) return 1;
    // Strip HTML tags for a better word count estimate
    const cleanContent = content.replace(/<[^>]*>?/gm, '');
    const wordCount = cleanContent.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
};

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
        return {
            title: 'ไม่พบเนื้อหา',
        };
    }

    return {
        title: `${blog.title} | ThaiCareCenter`,
        description: blog.excerpt,
        openGraph: {
            title: blog.title,
            description: blog.excerpt,
            images: blog.coverImage ? [blog.coverImage] : [],
            type: 'article',
            publishedTime: blog.createdAt,
            authors: blog.author ? [blog.author] : [],
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
        notFound();
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(blog.content || '');

    return (
        // พื้นหลังเป็นสีเทาอ่อนเพื่อให้เนื้อหาโดดเด่น
        <div className="min-h-screen bg-gray-100/50">
            <article>
                {/* 1. Article Header / Hero - ปรับให้เป็นทางการและใช้สีหลัก */}
                <header className="relative w-full h-[55vh] min-h-[450px] overflow-hidden bg-gray-900 border-b-4 border-[#3a639b]">
                    <div className="absolute inset-0">
                        {/* Image: ลดความสว่าง/เพิ่ม Overlay เพื่อให้ Text อ่านง่าย */}
                        <img
                            src={blog.coverImage || 'https://via.placeholder.com/1200x800?text=No+Image'}
                            alt={blog.title}
                            className="w-full h-full object-cover opacity-30" // ลด opacity ของรูปภาพ
                        />
                        {/* Stronger Gradient Overlay */}
                        <div className="absolute inset-0 bg-gray-900/80"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 to-transparent"></div>
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-end pb-12 pt-20">
                        <div className="container mx-auto max-w-4xl px-4">
                            {/* Breadcrumb / Back */}
                            <Link
                                href="/blogs"
                                // ปรับปุ่มให้เป็นทางการและใช้สีหลัก
                                className="inline-flex items-center px-4 py-2 text-white bg-[#3a639b]/90 rounded-md hover:bg-[#3a639b] transition-all mb-8 text-sm font-semibold shadow-md border border-[#3a639b]/50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับไปยังรายการเอกสาร/บทความ
                            </Link>

                            {/* Title - ชัดเจนและตัวหนา */}
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-md">
                                {blog.title}
                            </h1>

                            {/* Meta Info - จัดระเบียบให้เป็นทางการ */}
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-white/90 text-sm md:text-base font-medium border-t border-b border-white/20 py-3">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-white/70" />
                                    <span>**เผยแพร่เมื่อ:** {formatDate(blog.createdAt)}</span>
                                </div>
                                {blog.author && (
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mr-2">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold">**ผู้เขียน:** {blog.author}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-white/70">
                                    <Clock className="w-5 h-5 mr-2" />
                                    <span>**เวลาอ่านโดยประมาณ:** {readingTime} นาที</span>
                                </div>
                            </div>

                            {/* Tags (คงไว้) */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {blog.tags && blog.tags.map(tag => (
                                    <span key={tag} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/30 shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. Article Content */}
                {/* ใช้ max-w-4xl สำหรับการอ่านที่สบายตาในหน้าเว็บทางการ */}
                <div className="container mx-auto max-w-4xl px-4 py-16">
                    <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-200">
                        {/* Excerpt / Lead - ปรับให้ดูเป็นข้อมูลสรุปเบื้องต้น */}
                        {blog.excerpt && (
                            <blockquote className="text-xl md:text-2xl text-gray-700 font-serif leading-relaxed mb-12 py-6 px-8 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-xl shadow-inner italic">
                                <div className='text-[#3a639b] font-bold mb-2 flex items-center'>
                                    <ClipboardCheck className='w-5 h-5 mr-2' /> สรุปย่อ (Abstract):
                                </div>
                                {blog.excerpt}
                            </blockquote>
                        )}

                        {/* Body - ปรับ Prose Classes ให้เป็นทางการและอ่านง่ายขึ้น */}
                        <div
                            className={`prose prose-xl max-w-none 
                            prose-h2:text-3xl prose-h3:text-2xl prose-headings:font-extrabold prose-headings:text-[#3a639b] 
                            prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-10
                            prose-p:text-gray-700 prose-p:leading-loose
                            prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:leading-loose
                            prose-a:text-[#3a639b] prose-a:font-semibold hover:prose-a:text-blue-700 prose-a:border-b prose-a:border-[#3a639b]/50
                            prose-img:rounded-lg prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-gray-100
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic`}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>

                    {/* Share Buttons (ยังคงต้องเป็น Client Component) */}
                    <div className="mt-12">
                        <ShareButtons />
                    </div>

                </div>
            </article>

            {/* 3. Related / CTA Section - ปรับสไตล์ให้เป็นทางการ */}
            <section className="bg-white py-16 border-t border-gray-200 shadow-lg">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 border-b border-[#3a639b] inline-block pb-1">
                        เข้าถึงข้อมูลเพิ่มเติม
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        ท่านสามารถดูรายการเอกสาร/บทความวิชาการทั้งหมดที่เผยแพร่โดยหน่วยงานได้
                    </p>
                    <Link
                        href="/blogs"
                        className="inline-flex items-center justify-center px-10 py-3.5 text-base font-bold text-white bg-[#3a639b] rounded-md hover:bg-[#3a639b]/90 transition-all shadow-lg shadow-[#3a639b]/30"
                    >
                        ดูรายการบทความทั้งหมด <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </section>
        </div>
    );
}