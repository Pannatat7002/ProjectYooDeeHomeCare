/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Link as LinkIcon, Image as ImageIcon, Copy, ExternalLink } from 'lucide-react';
import { Advertisement } from '../../../../types';
import { fetchWithAuth } from '../../../../lib/auth-client';
import ImageUploadButton from '@/src/components/ImageUploadButton';

// Helper function to extract UTM params from a URL
const parseUrlParams = (url: string) => {
    try {
        const urlObj = new URL(url);
        return {
            baseUrl: urlObj.origin + urlObj.pathname,
            utmSource: urlObj.searchParams.get('utm_source') || '',
            utmMedium: urlObj.searchParams.get('utm_medium') || '',
            utmCampaign: urlObj.searchParams.get('utm_campaign') || '',
        };
    } catch {
        return {
            baseUrl: url,
            utmSource: '',
            utmMedium: '',
            utmCampaign: '',
        };
    }
};

interface AdFormData extends Partial<Advertisement> {
    baseUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

export default function ManageAdsPage() {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

    // Expanded Form Data State
    const [formData, setFormData] = useState<AdFormData>({
        imageUrl: '',
        linkUrl: '',
        title: '',
        description: '',
        baseUrl: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
    });

    useEffect(() => {
        fetchAds();
    }, []);

    // Auto-generate linkUrl when UTM params change
    useEffect(() => {
        if (formData.baseUrl) {
            try {
                const url = new URL(formData.baseUrl);
                if (formData.utmSource) url.searchParams.set('utm_source', formData.utmSource);
                if (formData.utmMedium) url.searchParams.set('utm_medium', formData.utmMedium);
                if (formData.utmCampaign) url.searchParams.set('utm_campaign', formData.utmCampaign);

                // Only update if different to avoid loop
                const newUrl = url.toString();
                if (newUrl !== formData.linkUrl) {
                    setFormData(prev => ({ ...prev, linkUrl: newUrl }));
                }
            } catch {
                // Invalid URL, do nothing or keep as is
            }
        }
    }, [formData.baseUrl, formData.utmSource, formData.utmMedium, formData.utmCampaign]);

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
            // Parse existing URL to fill UTM fields
            const { baseUrl, utmSource, utmMedium, utmCampaign } = parseUrlParams(ad.linkUrl || '');

            setFormData({
                imageUrl: ad.imageUrl,
                linkUrl: ad.linkUrl || '',
                title: ad.title || '',
                description: ad.description || '',
                baseUrl,
                utmSource,
                utmMedium,
                utmCampaign
            });
        } else {
            setEditingAd(null);
            setFormData({
                imageUrl: '',
                linkUrl: '',
                title: '',
                description: '',
                baseUrl: '', // Default suggestion could go here
                utmSource: '', // Default empty allowing manual input
                utmMedium: 'cpc',
                utmCampaign: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAd(null);
        setFormData({});
    };

    const handleInputChange = (field: keyof AdFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.imageUrl) {
            alert('กรุณาอัปโหลดรูปภาพโฆษณา');
            return;
        }

        // Prepare payload (exclude temporary UTM fields from API body if backend doesn't need them)
        const payload = {
            imageUrl: formData.imageUrl,
            linkUrl: formData.linkUrl, // This is the final generated URL
            title: formData.title,
            description: formData.description
        };

        try {
            if (editingAd) {
                // Update
                const res = await fetchWithAuth(`/api/ads/${editingAd.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
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
                    body: JSON.stringify(payload),
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('คัดลอกลิงก์เรียบร้อยแล้ว');
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการโฆษณา (Ads)</h2>
                    <p className="text-sm text-gray-500 mt-1">สร้างแบนเนอร์โฆษณาพร้อมลิงก์ติดตามผล (UTM Tracking)</p>
                </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลิงก์ปลายทาง (UTM)</th>
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
                                            <div className="h-16 w-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative group">
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
                                        <td className="px-6 py-4">
                                            {ad.linkUrl ? (
                                                <div className="max-w-xs">
                                                    <div className="text-xs text-gray-500 truncate mb-1" title={ad.linkUrl}>
                                                        {ad.linkUrl}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => copyToClipboard(ad.linkUrl || '')}
                                                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                                                        >
                                                            <Copy className="w-3 h-3" /> คัดลอก
                                                        </button>
                                                        <a
                                                            href={ad.linkUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                                                        >
                                                            <ExternalLink className="w-3 h-3" /> เปิด
                                                        </a>
                                                    </div>
                                                </div>
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
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={handleCloseModal}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10">
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

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column: Basic Info & Image */}
                                        <div className="space-y-5">
                                            <h4 className="font-semibold text-gray-700 flex items-center">
                                                <ImageIcon className="w-4 h-4 mr-2" /> ข้อมูลทั่วไป
                                            </h4>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ (Title)</label>
                                                <input
                                                    type="text"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    placeholder="เช่น โปรโมชั่นพิเศษ"
                                                    value={formData.title || ''}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    รูปภาพโฆษณา <span className="text-red-500">*</span>
                                                </label>
                                                {formData.imageUrl ? (
                                                    <div className="relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-2 group">
                                                        <img
                                                            src={formData.imageUrl}
                                                            alt="Preview"
                                                            className="h-full w-full object-contain rounded-lg"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '';
                                                                e.currentTarget.parentElement?.classList.add('bg-gray-100');
                                                                e.currentTarget.alt = 'ไม่สามารถโหลดรูปภาพได้';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                                                            <ImageUploadButton
                                                                folder="ads"
                                                                label="เปลี่ยนรูปภาพ"
                                                                className="bg-white/95 hover:bg-white text-gray-800 border-white/50 shadow-md font-medium text-xs px-3 py-1.5"
                                                                onUploadSuccess={(url) => handleInputChange('imageUrl', url)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleInputChange('imageUrl', '')}
                                                                className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md flex items-center gap-1.5"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                <span>ลบรูป</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50 flex flex-col items-center justify-center gap-2">
                                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-700">ยังไม่มีรูปภาพโฆษณา</div>
                                                        <p className="text-xs text-gray-500">อัปโหลดไฟล์รูปภาพ (JPG, PNG, WEBP ขนาดไม่เกิน 10MB)</p>
                                                        <div className="mt-1">
                                                            <ImageUploadButton
                                                                folder="ads"
                                                                label="เลือกไฟล์และอัปโหลดรูปภาพ"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm px-4 py-2 text-xs"
                                                                onUploadSuccess={(url) => handleInputChange('imageUrl', url)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                                                <textarea
                                                    rows={3}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                                    placeholder="รายละเอียดเพิ่มเติม..."
                                                    value={formData.description || ''}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column: UTM Builder */}
                                        <div className="space-y-5">
                                            <h4 className="font-semibold text-gray-700 flex items-center">
                                                <LinkIcon className="w-4 h-4 mr-2" /> ตั้งค่าลิงก์ (UTM Builder)
                                            </h4>

                                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">เว็บปลายทาง (Base URL)</label>
                                                    <input
                                                        type="url"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        placeholder="https://yoodee.com/promotion"
                                                        value={formData.baseUrl || ''}
                                                        onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* แก้ไขตรงนี้: เปลี่ยนจาก Select เป็น Input Text */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Source (แหล่งที่มา)</label>
                                                        <input
                                                            type="text"
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                            placeholder="เช่น facebook, google, email"
                                                            value={formData.utmSource || ''}
                                                            onChange={(e) => handleInputChange('utmSource', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Medium (ประเภทสื่อ)</label>
                                                        <input
                                                            type="text"
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                            placeholder="cpc, banner, feed"
                                                            value={formData.utmMedium || ''}
                                                            onChange={(e) => handleInputChange('utmMedium', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Campaign Name (ชื่อแคมเปญ)</label>
                                                    <input
                                                        type="text"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        placeholder="promo_jan2025"
                                                        value={formData.utmCampaign || ''}
                                                        onChange={(e) => handleInputChange('utmCampaign', e.target.value)}
                                                    />
                                                </div>

                                                <div className="pt-3 border-t border-gray-200">
                                                    <label className="block text-xs font-bold text-green-700 mb-1.5">ผลลัพธ์ลิงก์ที่จะบันทึก (Generated URL)</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            className="flex-1 bg-green-50 text-green-800 text-xs p-2 rounded border border-green-200 font-mono focus:outline-none"
                                                            value={formData.linkUrl || ''}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => formData.linkUrl && copyToClipboard(formData.linkUrl)}
                                                            className="bg-white border border-gray-300 text-gray-600 p-2 rounded hover:bg-gray-50"
                                                            title="Copy"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3 mt-6 -mx-6 -mb-4 rounded-b-xl">
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent px-6 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
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
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}