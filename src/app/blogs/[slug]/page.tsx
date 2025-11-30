import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogs } from '../../../lib/db';
import { Blog } from '../../../types';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering since we rely on external data (Google Sheets)
export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const blogs = await getBlogs();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return blogs.find((b: any) => b.slug === slug);
}

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <article className="flex-grow">
                {/* Hero / Header Image */}
                <div className="relative h-[400px] md:h-[500px] w-full">
                    <img
                        src={blog.coverImage || 'https://via.placeholder.com/1200x600?text=No+Image'}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="container max-w-4xl px-4 text-center text-white">
                            <Link href="/blogs" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับไปหน้าบทความ
                            </Link>
                            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                {blog.title}
                            </h1>
                            <div className="flex items-center justify-center space-x-6 text-sm md:text-base text-white/90">
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(blog.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                {blog.author && (
                                    <span className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        {blog.author}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container max-w-4xl mx-auto px-4 py-12 -mt-20 relative z-10">
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                        <div
                            className="prose prose-lg max-w-none prose-blue prose-img:rounded-xl prose-headings:text-gray-800 prose-p:text-gray-600"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map(tag => (
                                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}
