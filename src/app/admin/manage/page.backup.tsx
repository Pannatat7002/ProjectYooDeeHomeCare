'use client';

import { useState, useEffect } from 'react';
import {
    Plus, FilePenLine, Trash2, ChevronLeft, ChevronRight,
    X, Save, ImageIcon, XCircle, User, Phone, Mail,
    MessageSquare, Clock, Home
} from 'lucide-react';
import { CareCenter, Package, Consultation, ContactMessage } from '@/src/types';

// ----------------------------------------------------------------------
// --- 2. ManagePage Component (จัดการศูนย์ดูแล) ---
// ----------------------------------------------------------------------

const INITIAL_FORM_STATE: Omit<CareCenter, 'id'> = {
    name: '', address: '', lat: 13.7563, lng: 100.5018, price: 0,
    type: 'monthly', rating: 5, phone: '', website: '', mapUrl: '',
    imageUrls: [''], description: '', services: [], packages: [],
    hasGovernmentCertificate: false, brandName: '', brandLogoUrl: '',
    isPartner: false, province: 'กรุงเทพมหานคร'
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

function ManageCenterPage() {
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
            const res = await fetch(`/api/care-centers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCenters();
            } else {
                alert('ลบข้อมูลไม่สำเร็จ');
            }
        } catch (error) { console.error(error); alert('เกิดข้อผิดพลาดในการลบ'); }
    };

    const openModal = (center?: CareCenter) => {
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
                province: center.province || 'กรุงเทพมหานคร'
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
            imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
            price: Number(formData.price),
            rating: Number(formData.rating)
        };
        const url = editingId ? `/api/care-centers/${editingId}` : '/api/care-centers';
        const method = editingId ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
        const newImages = formData.imageUrls.filter((_, i) => i !== index);
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
        const newPackages = formData.packages.filter((_, i) => i !== index);
        setFormData({ ...formData, packages: newPackages });
    };

    const toggleService = (service: string) => {
        const currentServices = formData.services;
        if (currentServices.includes(service)) {
            setFormData({ ...formData, services: currentServices.filter(s => s !== service) });
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
                                <th className="py-4 px-4">ที่อยู่</th>
                                <th className="py-4 px-4">ราคา</th>
                                <th className="py-4 px-4">เรตติ้ง</th>
                                <th className="py-4 px-4">ประเภท</th>
                                <th className="py-4 px-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={8} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : paginatedCenters.length === 0 ? (
                                <tr><td colSpan={8} className="py-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                            ) : (
                                paginatedCenters.map((center, index) => (
                                    <tr key={center.id} className="hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                        <td className="py-3 px-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="py-3 px-4 font-semibold">{center.name}</td>
                                        <td className="py-3 px-4">{center.province || '-'}</td>
                                        <td className="py-3 px-4 max-w-xs truncate" title={center.address}>{center.address}</td>
                                        <td className="py-3 px-4">฿{center.price?.toLocaleString() ?? '0'}</td>
                                        <td className="py-3 px-4">{(center.rating || 0).toFixed(1)}</td>
                                        <td className="py-3 px-4">
                                            {center.type === 'both' ? 'รายวัน/รายเดือน' : center.type === 'daily' ? 'รายวัน' : 'รายเดือน'}
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

                                    {/* New Fields: Government Certificate & Brand & Partner */}
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
                                        {formData.imageUrls.map((url, idx) => (
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

                                {/* Services Checkboxes */}
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

                                {/* Packages Management */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-lg font-bold text-gray-800">แพ็กเกจค่าบริการ</label>
                                        <button type="button" onClick={addPackage} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center">
                                            <Plus className="w-4 h-4 mr-1" /> เพิ่มแพ็กเกจ
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.packages.map((pkg, idx) => (
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

// ----------------------------------------------------------------------
// --- 3. ConsultationManagement Component (จัดการผู้ติดต่อ) ---
// ----------------------------------------------------------------------

function ConsultationManagement() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = '/api/care-centers/consultations';

    const fetchConsultations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to fetch consultations');

            const result: { data: Consultation[] } = await res.json();
            setConsultations(result.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('Fetch error:', error);
            alert('ไม่สามารถโหลดข้อมูล Consultations ได้');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('à¸„à¸¸à¸“à¹ à¸™à¹ˆà¹ƒà¸ˆà¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆà¸§à¹ˆà¸²à¸•à¹‰à¸­à¸‡à¸ à¸²à¸£à¸¥à¸šà¸£à¸²à¸¢à¸ à¸²à¸£à¸•à¸´à¸”à¸•à¹ˆà¸­à¸™à¸µà¹‰?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('ลบรายการสำเร็จ');
                fetchConsultations();
            } else {
                alert('ลบรายการไม่สำเร็จ (กรุณาตรวจสอบ API DELETE)');
            }
        } catch (error) { console.error('Delete error:', error); alert('เกิดข้อผิดพลาดในการลบ'); }
    };

    const handleUpdateStatus = async (consultation: Consultation, newStatus: string) => {
        const payload = { status: newStatus };
        try {
            const res = await fetch(`${API_URL}/${consultation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`เปลี่ยนสถานะเป็น "${newStatus}" สำเร็จ`);
                fetchConsultations();
            } else {
                alert(`เปลี่ยนสถานะไม่สำเร็จ (กรุณาตรวจสอบ API PUT/PATCH)`);
            }
        } catch (error) { console.error('Update status error:', error); alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ'); }
    };

    const totalPages = Math.ceil(consultations.length / itemsPerPage);
    const paginatedConsultations = consultations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return dateString; }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let text = status;
        let color = 'bg-gray-100 text-gray-700';
        switch (status.toLowerCase()) {
            case 'pending': text = 'รอติดตาม'; color = 'bg-yellow-100 text-yellow-700'; break;
            case 'followed_up': text = 'ติดตามแล้ว'; color = 'bg-green-100 text-green-700'; break;
            case 'closed': text = 'ปิดเคส'; color = 'bg-red-100 text-red-700'; break;
            case 'new': text = 'ใหม่'; color = 'bg-blue-100 text-blue-700'; break;
        }
        return (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${color}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2" /> รายการผู้สนใจ/ผู้ปรึกษา
            </h1>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-600 text-white text-sm font-semibold border-b">
                                <th className="py-4 px-4 w-12 text-center">#</th>
                                <th className="py-4 px-4">ข้อมูลผู้ติดต่อ</th>
                                <th className="py-4 px-4">รายละเอียด</th>
                                <th className="py-4 px-4 max-w-xs">ข้อความ</th>
                                <th className="py-4 px-4 w-28 text-center">สถานะ</th>
                                <th className="py-4 px-4 w-20 text-center">ลบ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : paginatedConsultations.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">ไม่พบรายการติดต่อ</td></tr>
                            ) : (
                                paginatedConsultations.map((consultation: Consultation, index) => (
                                    <tr key={consultation.id} className="hover:bg-blue-50 text-sm text-gray-800 transition-colors">
                                        <td className="py-3 px-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="py-3 px-4 font-medium min-w-[200px]">
                                            <p className='font-bold'>{consultation.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center"><Phone className='w-3 h-3 mr-1' /> {consultation.phone}</p>
                                            {consultation.email && (<p className="text-xs text-gray-500 flex items-center"><Mail className='w-3 h-3 mr-1' /> {consultation.email}</p>)}
                                            {consultation.lineId && (<p className="text-xs text-gray-500 flex items-center"><MessageSquare className='w-3 h-3 mr-1' /> LINE: {consultation.lineId}</p>)}
                                            <p className="text-xs text-gray-500 flex items-center mt-1"><Clock className='w-3 h-3 mr-1' /> ส่งเมื่อ: {formatDate(consultation.submittedAt)}</p>
                                        </td>
                                        <td className="py-3 px-4 min-w-[200px]">
                                            <p className="font-semibold text-blue-600">ศูนย์: {consultation.branch}</p>
                                            <p className="text-xs text-gray-700">งบประมาณ: {consultation.budget}</p>
                                            <p className="text-xs text-gray-700">ประเภทห้อง: {consultation.roomType}</p>
                                            <p className="text-xs text-gray-700">เวลาสะดวก: {consultation.convenientTime}</p>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate text-gray-600" title={consultation.message}>{consultation.message}</td>

                                        <td className="py-3 px-4 text-center min-w-[120px]">
                                            <StatusBadge status={consultation.status} />
                                            {consultation.status.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(consultation, 'followed_up')}
                                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline block"
                                                >
                                                    เปลี่ยนเป็น ติดตามแล้ว
                                                </button>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <button onClick={() => handleDelete(consultation.id)} className="text-red-500 hover:text-red-700 p-2">
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
                    <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600 bg-gray-50">
                        <span>แสดง {paginatedConsultations.length} รายการ จาก {consultations.length} รายการ | หน้า {currentPage} จาก {totalPages}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-blue-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// --- 3.5 ContactMessageManagement Component (จัดการข้อความจากหน้า Contact) ---
// ----------------------------------------------------------------------

function ContactMessageManagement() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = '/api/contact';

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to fetch messages');

            const result: { data: ContactMessage[] } = await res.json();
            setMessages(result.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('Fetch error:', error);
            alert('ไม่สามารถโหลดข้อมูลข้อความได้');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อความนี้?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('ลบข้อความสำเร็จ');
                fetchMessages();
            } else {
                alert('ลบข้อความไม่สำเร็จ');
            }
        } catch (error) { console.error('Delete error:', error); alert('เกิดข้อผิดพลาดในการลบ'); }
    };

    const handleUpdateStatus = async (message: ContactMessage, newStatus: string) => {
        try {
            const res = await fetch(`${API_URL}/${message.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchMessages();
            } else {
                alert('อัปเดตสถานะไม่สำเร็จ');
            }
        } catch (error) { console.error('Update status error:', error); alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ'); }
    };

    const totalPages = Math.ceil(messages.length / itemsPerPage);
    const paginatedMessages = messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return dateString; }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let text = status;
        let color = 'bg-gray-100 text-gray-700';
        switch (status.toLowerCase()) {
            case 'new': text = 'ใหม่'; color = 'bg-blue-100 text-blue-700'; break;
            case 'read': text = 'อ่านแล้ว'; color = 'bg-green-100 text-green-700'; break;
            case 'replied': text = 'ตอบกลับแล้ว'; color = 'bg-purple-100 text-purple-700'; break;
        }
        return (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${color}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Mail className="w-6 h-6 mr-2" /> ข้อความจากผู้ติดต่อ (Contact Us)
            </h1>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-purple-600 text-white text-sm font-semibold border-b">
                                <th className="py-4 px-4 w-12 text-center">#</th>
                                <th className="py-4 px-4">ผู้ส่ง</th>
                                <th className="py-4 px-4">หัวข้อ</th>
                                <th className="py-4 px-4">ข้อความ</th>
                                <th className="py-4 px-4 w-28 text-center">สถานะ</th>
                                <th className="py-4 px-4 w-20 text-center">ลบ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : paginatedMessages.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">ไม่พบข้อความ</td></tr>
                            ) : (
                                paginatedMessages.map((message, index) => (
                                    <tr key={message.id} className="hover:bg-purple-50 text-sm text-gray-800 transition-colors">
                                        <td className="py-3 px-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="py-3 px-4 font-medium min-w-[150px]">
                                            <p className='font-bold'>{message.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center"><Mail className='w-3 h-3 mr-1' /> {message.email}</p>
                                            <p className="text-xs text-gray-500 flex items-center"><Phone className='w-3 h-3 mr-1' /> {message.phone}</p>
                                            <p className="text-xs text-gray-500 flex items-center mt-1"><Clock className='w-3 h-3 mr-1' /> ส่งเมื่อ: {formatDate(message.submittedAt)}</p>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-purple-700 min-w-[150px]">
                                            {message.subject}
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate text-gray-600" title={message.message}>{message.message}</td>

                                        <td className="py-3 px-4 text-center min-w-[120px]">
                                            <StatusBadge status={message.status} />
                                            {message.status.toLowerCase() === 'new' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(message, 'read')}
                                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline block"
                                                >
                                                    ทำเครื่องหมายว่าอ่านแล้ว
                                                </button>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <button onClick={() => handleDelete(message.id)} className="text-red-500 hover:text-red-700 p-2">
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
                    <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600 bg-gray-50">
                        <span>แสดง {paginatedMessages.length} รายการ จาก {messages.length} รายการ | หน้า {currentPage} จาก {totalPages}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-blue-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// --- 4. AdminPage Main Component (รวมทุกส่วน) ---
// ----------------------------------------------------------------------

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'centers' | 'consultations' | 'messages'>('centers');

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-blue-600">YooDee Admin</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <button
                                    onClick={() => setActiveTab('centers')}
                                    className={`${activeTab === 'centers' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                >
                                    <Home className="w-4 h-4 mr-2" /> จัดการศูนย์ดูแล
                                </button>
                                <button
                                    onClick={() => setActiveTab('consultations')}
                                    className={`${activeTab === 'consultations' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                >
                                    <User className="w-4 h-4 mr-2" /> รายการผู้สนใจ
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={`${activeTab === 'messages' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                >
                                    <Mail className="w-4 h-4 mr-2" /> ข้อความติดต่อ
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <img className="h-8 w-8 rounded-full bg-gray-300" src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu */}
                <div className="sm:hidden border-t border-gray-200">
                    <div className="flex justify-around p-2 bg-gray-50">
                        <button onClick={() => setActiveTab('centers')} className={`p-2 rounded-lg ${activeTab === 'centers' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
                            <Home className="w-6 h-6" />
                        </button>
                        <button onClick={() => setActiveTab('consultations')} className={`p-2 rounded-lg ${activeTab === 'consultations' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
                            <User className="w-6 h-6" />
                        </button>
                        <button onClick={() => setActiveTab('messages')} className={`p-2 rounded-lg ${activeTab === 'messages' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
                            <Mail className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {activeTab === 'centers' && <ManageCenterPage />}
                {activeTab === 'consultations' && <ConsultationManagement />}
                {activeTab === 'messages' && <ContactMessageManagement />}
            </main>
        </div>
    );
}
