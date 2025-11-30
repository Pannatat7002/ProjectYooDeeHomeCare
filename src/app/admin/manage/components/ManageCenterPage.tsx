'use client';

import { useState, useEffect } from 'react';
import {
    Plus, FilePenLine, Trash2, ChevronLeft, ChevronRight,
    X, Save, ImageIcon, XCircle, Megaphone
} from 'lucide-react';
import { CareCenter, Package } from '@/src/types';
import { fetchWithAuth } from '../../../../lib/auth-client';

const INITIAL_FORM_STATE: any = {
    name: '', address: '', lat: 13.7563, lng: 100.5018, price: 0,
    type: 'monthly', rating: 5, phone: '', website: '', mapUrl: '',
    imageUrls: [''], description: '', services: [], packages: [],
    hasGovernmentCertificate: false, brandName: '', brandLogoUrl: '',
    isPartner: false, province: 'กรุงเทพมหานคร', status: 'visible',
    // UTM Fields
    utmSource: '', utmMedium: '', utmCampaign: ''
};

const THAI_PROVINCES = [
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
    'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร',
    'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
    'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี',
    'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
    'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง',
    'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต',
    'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด',
    'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน',
    'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
    'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',
    'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง',
    'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

const MASTER_SERVICES = [
    'พยาบาล 24 ชม.', 'กายภาพบำบัด', 'กิจกรรมสันทนาการ', 'ดูแลผู้ป่วยติดเตียง', 'อาหารเฉพาะโรค',
    'ห้องพักส่วนตัว', 'Wi-Fi', 'บริการซักรีด', 'สวนหย่อม', 'ใกล้โรงพยาบาล', 'ดูแลผู้ป่วยอัลไซเมอร์'
];

// ตัวเลือก Medium มาตรฐาน
const MEDIUM_OPTIONS = [
    { value: 'cpc', label: 'CPC / Paid Ads (โฆษณาเสียเงิน)' },
    { value: 'social', label: 'Social Media (โพสต์โซเชียล)' },
    { value: 'banner', label: 'Banner / Display (แบนเนอร์)' },
    { value: 'email', label: 'Email / Newsletter (อีเมล)' },
    { value: 'referral', label: 'Referral (ลิงก์แนะนำ/บอกต่อ)' },
    { value: 'organic', label: 'Organic Search (ค้นหาเจอเอง)' },
    { value: 'offline', label: 'Offline / QR Code (สื่อสิ่งพิมพ์)' },
    { value: 'video', label: 'Video (วิดีโอ)' },
    { value: 'blog', label: 'Blog / Content (บทความ)' },
];

export default function ManageCenterPage() {
    const [centers, setCenters] = useState<CareCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const fetchCenters = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/care-centers');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCenters(data.sort((a: CareCenter, b: CareCenter) => b.id - a.id));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) return;
        try {
            const res = await fetchWithAuth(`/api/care-centers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCenters();
            } else {
                alert('ลบข้อมูลไม่สำเร็จ');
            }
        } catch (error) { console.error(error); alert('เกิดข้อผิดพลาดในการลบ'); }
    };

    const openModal = (center?: any) => {
        if (center) {
            setEditingId(center.id);
            setFormData({
                ...center,
                imageUrls: center.imageUrls?.length ? center.imageUrls : [''],
                packages: center.packages || [],
                services: center.services || [],
                hasGovernmentCertificate: center.hasGovernmentCertificate || false,
                brandName: center.brandName || '',
                brandLogoUrl: center.brandLogoUrl || '',
                isPartner: center.isPartner || false,
                province: center.province || 'กรุงเทพมหานคร',
                status: center.status || 'visible',
                utmSource: center.utmSource || '',
                utmMedium: center.utmMedium || '',
                utmCampaign: center.utmCampaign || ''
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
            imageUrls: formData.imageUrls.filter((url: string) => url.trim() !== ''),
            price: Number(formData.price),
            rating: Number(formData.rating)
        };
        const url = editingId ? `/api/care-centers/${editingId}` : '/api/care-centers';
        const method = editingId ? 'PUT' : 'POST';
        try {
            const res = await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Failed to save');
            alert('บันทึกข้อมูลสำเร็จ');
            closeModal();
            fetchCenters();
        } catch (error) { console.error(error); alert('เกิดข้อผิดพลาดในการบันทึก'); }
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.imageUrls];
        newImages[index] = value;
        setFormData({ ...formData, imageUrls: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
    };

    const removeImageField = (index: number) => {
        const newImages = formData.imageUrls.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, imageUrls: newImages });
    };

    const handlePackageChange = (index: number, field: keyof Package, value: string) => {
        const newPackages = [...formData.packages];
        if (field === 'details') {
            newPackages[index] = { ...newPackages[index], details: value.split(',').map((s: string) => s.trim()) };
        } else if (field === 'price') {
            newPackages[index] = { ...newPackages[index], price: Number(value) };
        } else {
            newPackages[index] = { ...newPackages[index], [field]: value };
        }
        setFormData({ ...formData, packages: newPackages });
    };

    const addPackage = () => {
        setFormData({ ...formData, packages: [...formData.packages, { name: '', price: 0, details: [] }] });
    };

    const removePackage = (index: number) => {
        const newPackages = formData.packages.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, packages: newPackages });
    };

    const toggleService = (service: string) => {
        const currentServices = formData.services;
        if (currentServices.includes(service)) {
            setFormData({ ...formData, services: currentServices.filter((s: string) => s !== service) });
        } else {
            setFormData({ ...formData, services: [...currentServices, service] });
        }
    };

    const totalPages = Math.ceil(centers.length / itemsPerPage);
    const paginatedCenters = centers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลศูนย์ดูแล</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5 mr-2" /> เพิ่มศูนย์ดูแลใหม่
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b">
                                <th className="py-4 px-4 w-16 text-center">ลำดับ</th>
                                <th className="py-4 px-4">ชื่อศูนย์ดูแล</th>
                                <th className="py-4 px-4">จังหวัด</th>
                                <th className="py-4 px-4">ราคา</th>
                                <th className="py-4 px-4">สถานะ</th>
                                <th className="py-4 px-4">Tracking (Source)</th>
                                <th className="py-4 px-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : paginatedCenters.length === 0 ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                            ) : (
                                paginatedCenters.map((center: any, index) => (
                                    <tr key={center.id} className="hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                        <td className="py-3 px-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="py-3 px-4 font-semibold">{center.name}</td>
                                        <td className="py-3 px-4">{center.province || '-'}</td>
                                        <td className="py-3 px-4">฿{center.price?.toLocaleString() ?? '0'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${center.status === 'visible' ? 'bg-green-100 text-green-800' :
                                                center.status === 'hidden' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {center.status === 'visible' ? 'เปิดการแสดง' :
                                                    center.status === 'hidden' ? 'ปิดการแสดง' : 'รอการอนุมัติ'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-gray-500">
                                            {center.utmSource ? (
                                                <span className="bg-gray-100 px-2 py-1 rounded border">
                                                    {center.utmSource}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center space-x-2">
                                            <button onClick={() => openModal(center)} className="text-blue-600 hover:text-blue-800">
                                                <FilePenLine className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(center.id)} className="text-red-600 hover:text-red-800">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600">
                        <span>หน้า {currentPage} จาก {totalPages}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingId ? 'แก้ไขข้อมูลศูนย์ดูแล' : 'เพิ่มศูนย์ดูแลใหม่'}
                                </h2>
                                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อศูนย์</label>
                                        <input required type="text" className="w-full border rounded-md px-3 py-2"
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                                        <select className="w-full border rounded-md px-3 py-2"
                                            value={formData.province}
                                            onChange={e => setFormData({ ...formData, province: e.target.value })}
                                        >
                                            {THAI_PROVINCES.map(prov => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ... (fields อื่นๆ เหมือนเดิม) ... */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                                        <textarea required rows={2} className="w-full border rounded-md px-3 py-2"
                                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input required type="text" className="w-full border rounded-md px-3 py-2"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เว็บไซต์</label>
                                        <input type="text" className="w-full border rounded-md px-3 py-2"
                                            value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ราคาเริ่มต้น</label>
                                        <input required type="number" className="w-full border rounded-md px-3 py-2"
                                            value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เรตติ้ง (0-5)</label>
                                        <input required type="number" step="0.1" min="0" max="5" className="w-full border rounded-md px-3 py-2"
                                            value={formData.rating} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                                        <select className="w-full border rounded-md px-3 py-2"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as 'daily' | 'monthly' | 'both' })}
                                        >
                                            <option value="monthly">รายเดือน</option>
                                            <option value="daily">รายวัน</option>
                                            <option value="both">รายวัน/รายเดือน</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                        <select className="w-full border rounded-md px-3 py-2"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as 'visible' | 'hidden' | 'pending' })}
                                        >
                                            <option value="visible">เปิดการแสดง</option>
                                            <option value="hidden">ปิดการแสดง</option>
                                            <option value="pending">รอการอนุมัติ</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed Code (Iframe)</label>
                                        <input type="text" className="w-full border rounded-md px-3 py-2"
                                            placeholder='<iframe src="..."></iframe>'
                                            value={formData.mapUrl || ''} onChange={e => setFormData({ ...formData, mapUrl: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด/คำอธิบาย</label>
                                        <textarea rows={5} className="w-full border rounded-md px-3 py-2"
                                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <input
                                                type="checkbox"
                                                id="hasGovernmentCertificate"
                                                className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                                                checked={formData.hasGovernmentCertificate || false}
                                                onChange={e => setFormData({ ...formData, hasGovernmentCertificate: e.target.checked })}
                                            />
                                            <label htmlFor="hasGovernmentCertificate" className="text-sm font-bold text-blue-800 select-none cursor-pointer">
                                                ได้รับรองจาก กรม สบส.
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                            <input
                                                type="checkbox"
                                                id="isPartner"
                                                className="rounded text-green-600 focus:ring-green-500 h-5 w-5"
                                                checked={formData.isPartner || false}
                                                onChange={e => setFormData({ ...formData, isPartner: e.target.checked })}
                                            />
                                            <label htmlFor="isPartner" className="text-sm font-bold text-green-800 select-none cursor-pointer">
                                                ผ่านการยืนยัน (พาร์ทเนอร์)
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแบรนด์/เครือ (Brand Name)</label>
                                        <input type="text" className="w-full border rounded-md px-3 py-2"
                                            placeholder="เช่น Home Care Piban"
                                            value={formData.brandName || ''} onChange={e => setFormData({ ...formData, brandName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">โลโก้แบรนด์ (URL)</label>
                                        <input type="text" className="w-full border rounded-md px-3 py-2"
                                            placeholder="https://..."
                                            value={formData.brandLogoUrl || ''} onChange={e => setFormData({ ...formData, brandLogoUrl: e.target.value })} />
                                    </div>
                                </div>

                                {/* Images Management */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-gray-700">รูปภาพ (URL)</label>
                                        <button type="button" onClick={addImageField} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center">
                                            <Plus className="w-3 h-3 mr-1" /> เพิ่มรูป
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.imageUrls.map((url: string, idx: number) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden shrink-0 flex items-center justify-center">
                                                    {url ? <img src={url} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=Error')} /> : <ImageIcon className="text-gray-300" />}
                                                </div>
                                                <input type="text" placeholder="https://example.com/image.jpg"
                                                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                                                    value={url} onChange={(e) => handleImageChange(idx, e.target.value)}
                                                />
                                                <button type="button" onClick={() => removeImageField(idx)} className="text-red-500 hover:text-red-700 p-2">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Services */}
                                <div className="border-t pt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">บริการและสิ่งอำนวยความสะดวก</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {MASTER_SERVICES.map(service => (
                                            <label key={service} className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                                                <input type="checkbox"
                                                    checked={formData.services.includes(service)}
                                                    onChange={() => toggleService(service)}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{service}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Packages */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-lg font-bold text-gray-800">แพ็กเกจค่าบริการ</label>
                                        <button type="button" onClick={addPackage} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center">
                                            <Plus className="w-4 h-4 mr-1" /> เพิ่มแพ็กเกจ
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.packages.map((pkg: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border relative">
                                                <button type="button" onClick={() => removePackage(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                    <div className="md:col-span-4">
                                                        <input type="text" placeholder="ชื่อแพ็กเกจ" required
                                                            className="w-full border rounded px-2 py-1.5 text-sm"
                                                            value={pkg.name} onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <input type="number" placeholder="ราคา" required
                                                            className="w-full border rounded px-2 py-1.5 text-sm"
                                                            value={pkg.price} onChange={(e) => handlePackageChange(idx, 'price', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <input type="text" placeholder="รายละเอียด (คั่นด้วย comma ,)"
                                                            className="w-full border rounded px-2 py-1.5 text-sm"
                                                            value={Array.isArray(pkg.details) ? pkg.details.join(', ') : ''} onChange={(e) => handlePackageChange(idx, 'details', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.packages.length === 0 && (
                                            <p className="text-center text-gray-500 text-sm py-4 border-2 border-dashed rounded-lg">ยังไม่มีแพ็กเกจ</p>
                                        )}
                                    </div>
                                </div>

                                {/* UTM Parameters Section */}
                                <div className="border-t pt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Megaphone className="w-5 h-5 text-indigo-600" />
                                        <label className="text-lg font-bold text-gray-800">การติดตามโฆษณา (UTM Parameters)</label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">UTM Source</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="e.g. facebook, google"
                                                value={formData.utmSource || ''}
                                                onChange={e => setFormData({ ...formData, utmSource: e.target.value })} />
                                        </div>
                                        <div>
                                            {/* เปลี่ยนเป็น Dropdown */}
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">UTM Medium</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.utmMedium || ''}
                                                onChange={e => setFormData({ ...formData, utmMedium: e.target.value })}
                                            >
                                                <option value="">-- เลือกประเภทสื่อ --</option>
                                                {MEDIUM_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                                <option value="other">Other (อื่นๆ)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">UTM Campaign</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="e.g. summer_sale"
                                                value={formData.utmCampaign || ''}
                                                onChange={e => setFormData({ ...formData, utmCampaign: e.target.value })} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">* ใช้สำหรับระบุแหล่งที่มาของข้อมูลเพื่อวัดผลทางการตลาด</p>
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