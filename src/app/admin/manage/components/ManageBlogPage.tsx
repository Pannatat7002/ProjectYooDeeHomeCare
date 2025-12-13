'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, FilePenLine, Trash2, X, Save, ImageIcon, Search, RotateCcw
} from 'lucide-react';
import { Blog } from '@/src/types';
import { fetchWithAuth } from '@/src/lib/auth-client';
import RichTextEditor from '@/src/components/RichTextEditor';

const INITIAL_FORM_STATE = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: '',
    tags: '', // Managed as comma-separated string in form
    isPublished: false
};

export default function ManageBlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/blogs');
            if (!res.ok) throw new Error('Failed to fetch blogs');
            const data = await res.json();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) return;
        try {
            const res = await fetchWithAuth(`/api/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBlogs();
            } else {
                alert('ลบข้อมูลไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    const openModal = (blog?: Blog) => {
        if (blog) {
            setEditingId(blog.id);
            setFormData({
                title: blog.title || '',
                slug: blog.slug || '',
                excerpt: blog.excerpt || '',
                content: blog.content || '',
                coverImage: blog.coverImage || '',
                author: blog.author || '',
                tags: blog.tags ? blog.tags.join(', ') : '',
                isPublished: blog.isPublished || false
            });
        } else {
            setEditingId(null);
            setFormData(INITIAL_FORM_STATE);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        };

        const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save blog');

            alert('บันทึกข้อมูลสำเร็จ');
            closeModal();
            fetchBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        (blog.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.author || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">จัดการบทความ (Blogs)</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto justify-center md:justify-start shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" /> เพิ่มบทความใหม่
                </button>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative flex-grow max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อบทความ หรือ ผู้เขียน..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> ล้างค่า
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b">
                                <th className="py-4 px-4 w-16 text-center">ID</th>
                                <th className="py-4 px-4 w-24">รูปปก</th>
                                <th className="py-4 px-4">หัวข้อ</th>
                                <th className="py-4 px-4">ผู้เขียน</th>
                                <th className="py-4 px-4">สถานะ</th>
                                <th className="py-4 px-4">วันที่สร้าง</th>
                                <th className="py-4 px-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                            ) : (
                                filteredBlogs.map((blog, index) => (
                                    <tr key={blog.id || `blog-${index}`} className="hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                        <td className="py-3 px-4 text-center">{blog.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                                {blog.coverImage ? (
                                                    <img src={blog.coverImage} alt="cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-gray-900">{blog.title}</td>
                                        <td className="py-3 px-4">{blog.author}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${blog.isPublished
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {blog.isPublished ? 'เผยแพร่' : 'ซ่อน'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-center space-x-2">
                                            <button
                                                onClick={() => openModal(blog)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 p-1.5 rounded-md"
                                                title="แก้ไข"
                                            >
                                                <FilePenLine className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(blog.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors bg-red-50 p-1.5 rounded-md"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingId ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}
                                </h2>
                                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อบทความ</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md px-3 py-2"
                                            placeholder="ปล่อยว่างเพื่อสร้างอัตโนมัติ"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ผู้เขียน</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.author}
                                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">คำเกริ่นนำ (Excerpt)</label>
                                        <textarea
                                            rows={2}
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.excerpt}
                                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหาบทความ (รองรับ HTML เบื้องต้น)</label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(content) => setFormData({ ...formData, content })}
                                        placeholder="เขียนเนื้อหาบทความที่นี่..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รูปปก (URL)</label>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-24 h-24 bg-gray-100 rounded border overflow-hidden shrink-0 flex items-center justify-center">
                                                {formData.coverImage ? (
                                                    <img src={formData.coverImage} alt="preview" className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/96?text=Error')}
                                                    />
                                                ) : (
                                                    <ImageIcon className="text-gray-300 w-8 h-8" />
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                className="flex-1 border rounded-md px-3 py-2"
                                                placeholder="https://example.com/image.jpg"
                                                value={formData.coverImage}
                                                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tag (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md px-3 py-2"
                                            placeholder="Healthcare, ผู้สูงอายุ, ..."
                                            value={formData.tags}
                                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center h-full pt-6">
                                        <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100 w-full">
                                            <input
                                                type="checkbox"
                                                id="isPublished"
                                                className="rounded text-green-600 focus:ring-green-500 h-5 w-5"
                                                checked={formData.isPublished}
                                                onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                            />
                                            <label htmlFor="isPublished" className="text-sm font-bold text-green-800 select-none cursor-pointer">
                                                เผยแพร่ทันที
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t flex justify-end space-x-3 sticky bottom-0 bg-white pb-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                    ยกเลิก
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-lg">
                                    <Save className="w-4 h-4 mr-2" /> บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
