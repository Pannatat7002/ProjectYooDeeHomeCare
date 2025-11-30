/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Blog } from '../../types';

import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blogs?published=true')
            .then(res => res.json())
            .then(data => {
                setBlogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <div
                className="relative h-[300px] flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: 'url("/images/bg-home.jpg")',
                    backgroundPosition: 'center 40%',
                }}
            >
                <div className="absolute inset-0 bg-blue-900/50"></div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">บทความและสาระน่ารู้</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        รวมบทความเกี่ยวกับการดูแลผู้สูงอายุ สุขภาพ และเทคนิคการเลือกศูนย์ดูแลที่ดีที่สุดสำหรับคนที่คุณรัก
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto max-w-6xl px-4 py-12 flex-grow">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 text-lg">ยังไม่มีบทความในขณะนี้</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <Link
                                key={blog.id}
                                href={`/blogs/${blog.slug}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={blog.coverImage || 'https://via.placeholder.com/600x400?text=No+Image'}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                                        <span className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(blog.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        {blog.author && (
                                            <span className="flex items-center">
                                                <User className="w-3 h-3 mr-1" />
                                                {blog.author}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {blog.title}
                                    </h2>

                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                                        {blog.excerpt}
                                    </p>

                                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                        อ่านเพิ่มเติม <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>


        </div>
    );
}
