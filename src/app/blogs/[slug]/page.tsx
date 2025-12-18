import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// ตรวจสอบ path
import { getBlogs } from '../../../lib/db';
import { Blog } from '../../../types';
import { Calendar, User, ArrowLeft, Clock, ClipboardCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
// สมมติว่า ShareButtons เป็น Client Component
import ShareButtons from './components/ShareButtons';

// Force dynamic rendering since we rely on external data
export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

// กำหนดสีหลักสำหรับความทางการ
const MAIN_BLUE_HEX = '#3a639b';

// --------------------------------------------------------------------------
// 1. Data Fetching and Helpers (คงเดิม)
// --------------------------------------------------------------------------

async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const blogs = await getBlogs();
    const decodedSlug = decodeURIComponent(slug).trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return blogs.find((b: any) => {
        const dbSlug = (b.slug || '').trim();
        return dbSlug === decodedSlug;
    });
}

const calculateReadingTime = (content: string) => {
    if (!content) return 1;
    const cleanContent = content.replace(/<[^>]*>?/gm, '');
    const wordCount = cleanContent.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// --------------------------------------------------------------------------
// 2. Metadata Generation (คงเดิม)
// --------------------------------------------------------------------------

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

// --------------------------------------------------------------------------
// 3. Main Page Component (ปรับปรุงให้กระชับ)
// --------------------------------------------------------------------------

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
        notFound();
    }

    const readingTime = calculateReadingTime(blog.content || '');

    return (
        <div className="min-h-screen bg-white">
            <article className="pt-10 pb-16"> {/* ลด pt และ pb */}
                <div className="container mx-auto max-w-4xl px-4">

                    {/* 1. Article Header (Compact Style) */}
                    <header className="mb-8 border-b border-gray-100 pb-5"> {/* ลด mb และ pb */}

                        {/* Back Link (กระชับ) */}
                        <Link
                            href="/blogs"
                            className="inline-flex items-center text-gray-500 hover:text-[#3a639b] transition-colors text-sm font-medium mb-4" // ลด mb
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> {/* ลด mr */}
                            กลับไปยังรายการบทความ
                        </Link>

                        {/* Title (ลดขนาด) */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-snug tracking-normal"> {/* ลดขนาด font และ mb */}
                            {blog.title}
                        </h1>

                        {/* Meta Info - จัดกลุ่มให้กระชับ */}
                        <div className="flex flex-wrap items-center gap-x-4 text-gray-600 text-xs md:text-sm font-medium"> {/* ลดขนาด font */}
                            {blog.author && (
                                <div className="flex items-center">
                                    <User className="w-3.5 h-3.5 mr-1 text-[#3a639b]" /> {/* ลดขนาด icon */}
                                    <span className="font-semibold text-gray-800">{blog.author}</span>
                                </div>
                            )}
                            <div className="flex items-center before:content-['•'] before:mx-2 before:text-gray-300"> {/* ลด mx */}
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                            <div className="flex items-center before:content-['•'] before:mx-2 before:text-gray-300">
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                <span>อ่าน {readingTime} นาที</span>
                            </div>
                        </div>

                        {/* Tags (กระชับ) */}
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100"> {/* ลด gap และ mt/pt */}
                            {blog.tags && blog.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold"> {/* ลด px และ py */}
                                    {tag}
                                </span>
                            ))}
                        </div>

                    </header>

                    {/* 2. Article Content */}
                    <div className="py-6"> {/* ลด py */}

                        {/* Excerpt / Abstract Blockquote (กระชับ) */}
                        {blog.excerpt && (
                            <blockquote className="text-lg md:text-xl text-gray-800 leading-normal mb-8 py-4 px-0 border-l-4 border-[#3a639b] bg-transparent rounded-none italic pl-4 md:pl-5"> {/* ลดขนาด font, leading, mb และ py */}
                                <div className='text-[#3a639b] font-bold mb-2 flex items-center'> {/* ลด mb */}
                                    <ClipboardCheck className="w-4 h-4 mr-1.5" /> {/* ลดขนาด icon */}
                                    สรุปย่อ (Abstract):
                                </div>
                                {blog.excerpt}
                            </blockquote>
                        )}

                        {/* Cover Image (ถ้ามี) */}
                        {blog.coverImage && (
                            <img
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-auto object-cover rounded-md shadow-md mb-8 border border-gray-100" // ลด mb
                            />
                        )}

                        {/* Body - Prose Classes (ปรับ Spacing ให้กระชับ) */}
                        <div
                            className={`prose prose-lg max-w-none 
                            prose-h2:text-2xl prose-h3:text-xl prose-headings:font-extrabold prose-headings:text-gray-900 
                            prose-h2:border-b prose-h2:border-[#3a639b]/20 prose-h2:pb-1.5 prose-h2:mt-10 // ลด Spacing
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 // ลด Leading & Margin
                            prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:leading-relaxed prose-li:my-2 // ลด Spacing ใน List
                            prose-a:text-[#3a639b] prose-a:font-semibold hover:prose-a:text-blue-700 prose-a:border-b prose-a:border-[#3a639b]/50
                            prose-img:rounded-lg prose-img:shadow-md prose-img:my-8 prose-img:border prose-img:border-gray-100 // ลด my
                            prose-blockquote:border-l-4 prose-blockquote:border-[#3a639b] prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic`}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>

                    {/* Share Buttons */}
                    <ShareButtons />

                </div>
            </article>

            {/* 3. CTA Section (Footer Look - กระชับ) */}
            <section className="bg-gray-900 py-12"> {/* ลด py */}
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-2xl font-extrabold text-white mb-3"> {/* ลดขนาด font และ mb */}
                        เข้าถึงข้อมูลเพิ่มเติม
                    </h2>
                    <p className="text-gray-300 text-base mb-6"> {/* ลดขนาด font และ mb */}
                        ท่านสามารถดูรายการเอกสาร/บทความวิชาการทั้งหมดที่เผยแพร่โดยหน่วยงานได้
                    </p>
                    {/* ปุ่ม CTA */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center justify-center px-6 py-2.5 text-base font-bold text-white bg-[#3a639b] rounded-md hover:bg-blue-700 transition-all shadow-md shadow-[#3a639b]/40"
                    >
                        ดูรายการบทความทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </section>
        </div>
    );
}