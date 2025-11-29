/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Link as LinkIcon, Image as ImageIcon, Layout, FileText } from 'lucide-react';
import { Advertisement } from '../../../../types';
import { fetchWithAuth } from '../../../../lib/auth-client';

export default function ManageAdsPage() {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [formData, setFormData] = useState<Partial<Advertisement>>({
        imageUrl: '',
        linkUrl: '',
        title: '',
        description: ''
    });

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/ads');
            const data = await res.json();
            setAds(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ads:', error);
            setLoading(false);
        }
    };

    const handleOpenModal = (ad?: Advertisement) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                imageUrl: ad.imageUrl,
                linkUrl: ad.linkUrl || '',
                title: ad.title || '',
                description: ad.description || ''
            });
        } else {
            setEditingAd(null);
            setFormData({
                imageUrl: '',
                linkUrl: '',
                title: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAd(null);
        setFormData({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.imageUrl) {
            alert('กรุณาระบุ URL รูปภาพ');
            return;
        }

        try {
            if (editingAd) {
                // Update
                const res = await fetchWithAuth(`/api/ads/${editingAd.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    alert('อัปเดตข้อมูลสำเร็จ');
                    fetchAds();
                    handleCloseModal();
                } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดต');
                }
            } else {
                // Create
                const res = await fetchWithAuth('/api/ads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    alert('เพิ่มข้อมูลสำเร็จ');
                    fetchAds();
                    handleCloseModal();
                } else {
                    alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
                }
            }
        } catch (error) {
            console.error('Error saving ad:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) return;

        try {
            const res = await fetchWithAuth(`/api/ads/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('ลบข้อมูลสำเร็จ');
                fetchAds();
            } else {
                alert('เกิดข้อผิดพลาดในการลบ');
            }
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">จัดการโฆษณา (Ads)</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มโฆษณาใหม่</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลิงก์ปลายทาง</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {ads.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        ยังไม่มีรายการโฆษณา
                                    </td>
                                </tr>
                            ) : (
                                ads.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-16 w-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                <img
                                                    src={ad.imageUrl}
                                                    alt={ad.title || 'Ad'}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{ad.title || '-'}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{ad.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ad.linkUrl ? (
                                                <a
                                                    href={ad.linkUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                >
                                                    <LinkIcon className="w-3 h-3" />
                                                    เปิดลิงก์
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(ad)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ad.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop (พื้นหลังสีดำ) */}
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={handleCloseModal}></div>
                        </div>

                        {/* Spacer เพื่อจัดกึ่งกลาง */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal Content (กล่องฟอร์ม) - เพิ่ม relative และ z-10 เพื่อให้ลอยอยู่เหนือพื้นหลัง */}
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-6 pt-6 pb-4">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {editingAd ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณาใหม่'}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 p-2 rounded-full hover:bg-gray-200"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Form Grid Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                                        {/* Title */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                หัวข้อ (Title)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Layout className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                                                    placeholder="เช่น โปรโมชั่นพิเศษ"
                                                    value={formData.title || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Link URL */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                ลิงก์ปลายทาง (Link URL)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                                                    placeholder="https://..."
                                                    value={formData.linkUrl || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Image URL (Full Width) */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                URL รูปภาพ <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <ImageIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                                                    placeholder="https://example.com/image.jpg"
                                                    value={formData.imageUrl || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                                />
                                            </div>

                                            {/* Image Preview */}
                                            {formData.imageUrl && (
                                                <div className="mt-3 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center">
                                                    <img
                                                        src={formData.imageUrl}
                                                        alt="Preview"
                                                        className="h-full w-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '';
                                                            e.currentTarget.parentElement?.classList.add('bg-gray-50');
                                                            e.currentTarget.alt = 'ไม่สามารถโหลดรูปภาพได้';
                                                        }}
                                                    />
                                                    <span className="absolute text-gray-400 text-xs pointer-events-none">ตัวอย่างรูปภาพ</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description (Full Width) */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                รายละเอียด (Description)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute top-3 left-3 pointer-events-none">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow resize-none"
                                                    placeholder="รายละเอียดเพิ่มเติม..."
                                                    value={formData.description || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent px-4 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึกข้อมูล
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}