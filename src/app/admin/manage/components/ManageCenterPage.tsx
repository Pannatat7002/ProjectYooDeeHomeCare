/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Plus, FilePenLine, Trash2, ChevronLeft, ChevronRight,
    X, Save, ImageIcon, XCircle, Megaphone, Filter, Search, RotateCcw
} from 'lucide-react';
import { CareCenter, Package } from '@/src/types';
import { fetchWithAuth } from '../../../../lib/auth-client';
import RichTextEditor from '@/src/components/RichTextEditor';
import ImageUploadButton from '@/src/components/ImageUploadButton';

const INITIAL_FORM_STATE: any = {
    name: '', address: '', lat: 13.7563, lng: 100.5018, price: 0,
    type: 'monthly', rating: 5, phone: '', website: '', mapUrl: '',
    imageUrls: [], description: '', services: [], packages: [],
    roomTypes: [],
    hasGovernmentCertificate: false, brandName: '', brandLogoUrl: '',
    isPartner: false, province: 'กรุงเทพมหานคร', status: 'visible',
    // UTM Fields
    utmSource: '', utmMedium: '', utmCampaign: ''
};

const THAI_PROVINCES = [
    'ทั้งหมด',
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

const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

export default function ManageCenterPage() {
    const [centers, setCenters] = useState<CareCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // --- State สำหรับตัวกรองต่างๆ ---
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterProvince, setFilterProvince] = useState<string>('ทั้งหมด');
    const [filterStatus, setFilterStatus] = useState<string>('all'); // กรองสถานะ
    const [filterType, setFilterType] = useState<string>('all');   // กรองประเภท (รายวัน/เดือน)
    const [filterPartner, setFilterPartner] = useState<string>('all'); // กรองพาร์ทเนอร์

    const fetchCenters = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/care-centers');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            const normalizedData = data.map((center: CareCenter) => ({
                ...center,
                imageUrls: Array.isArray(center.imageUrls) ? center.imageUrls.filter((u: string) => u && u.trim() !== '') : [],
            }));
            setCenters(normalizedData.sort((a: CareCenter, b: CareCenter) => b.id - a.id));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    // --- Logic การกรองแบบรวมศูนย์ ---
    const filteredCenters = useMemo(() => {
        let currentCenters = centers;
        const lowerCaseSearch = searchTerm.toLowerCase().trim();

        // 1. กรองตามจังหวัด
        if (filterProvince !== 'ทั้งหมด') {
            currentCenters = currentCenters.filter(center => center.province === filterProvince);
        }

        // 2. กรองตามสถานะ (Status)
        if (filterStatus !== 'all') {
            currentCenters = currentCenters.filter(center => center.status === filterStatus);
        }

        // 3. กรองตามประเภท (Type)
        if (filterType !== 'all') {
            currentCenters = currentCenters.filter(center => {
                // ถ้าเลือกรายเดือน ต้องเจอ monthly หรือ both
                if (filterType === 'monthly') return center.type === 'monthly' || center.type === 'both';
                // ถ้าเลือกรายวัน ต้องเจอ daily หรือ both
                if (filterType === 'daily') return center.type === 'daily' || center.type === 'both';
                return true;
            });
        }

        // 4. กรองตามพาร์ทเนอร์ (Partner)
        if (filterPartner !== 'all') {
            const isPartnerBool = filterPartner === 'true';
            currentCenters = currentCenters.filter(center => center.isPartner === isPartnerBool);
        }

        // 5. กรองตามข้อความค้นหา (Search)
        if (lowerCaseSearch) {
            currentCenters = currentCenters.filter(center =>
                center.name.toLowerCase().includes(lowerCaseSearch) ||
                (center.province && center.province.toLowerCase().includes(lowerCaseSearch)) ||
                (center.utmSource && center.utmSource.toLowerCase().includes(lowerCaseSearch))
            );
        }

        return currentCenters;
    }, [centers, filterProvince, searchTerm, filterStatus, filterType, filterPartner]);

    const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
    const paginatedCenters = filteredCenters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- Reset Function ---
    const resetFilters = () => {
        setSearchTerm('');
        setFilterProvince('ทั้งหมด');
        setFilterStatus('all');
        setFilterType('all');
        setFilterPartner('all');
        setCurrentPage(1);
    };

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
                imageUrls: Array.isArray(center.imageUrls) ? center.imageUrls.filter((u: string) => u && u.trim() !== '') : [],
                packages: center.packages || [],
                services: center.services || [],
                roomTypes: Array.isArray(center.roomTypes) ? center.roomTypes.map((rt: any) => ({
                    name: rt.name || '',
                    status: rt.status || 'เตียงว่างพร้อมดูแลทันที',
                    description: rt.description || '',
                    facilities: Array.isArray(rt.facilities) ? rt.facilities : [],
                    imageUrls: Array.isArray(rt.imageUrls) ? rt.imageUrls.filter((u: string) => u && u.trim() !== '') : []
                })) : [],
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
            rating: Number(formData.rating),
            roomTypes: Array.isArray(formData.roomTypes) ? formData.roomTypes.map((rt: any) => ({
                name: rt.name || '',
                status: rt.status || 'เตียงว่างพร้อมดูแลทันที',
                description: rt.description || '',
                facilities: Array.isArray(rt.facilities) ? rt.facilities.filter((f: string) => f.trim() !== '') : [],
                imageUrls: Array.isArray(rt.imageUrls) ? rt.imageUrls.filter((url: string) => url.trim() !== '') : []
            })) : []
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

    // Helper functions for form
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

    // Room type helpers
    const handleRoomTypeChange = (index: number, field: string, value: any) => {
        const newRoomTypes = [...formData.roomTypes];
        newRoomTypes[index] = { ...newRoomTypes[index], [field]: value };
        setFormData({ ...formData, roomTypes: newRoomTypes });
    };

    const addRoomType = () => {
        setFormData({
            ...formData,
            roomTypes: [
                ...formData.roomTypes,
                { name: 'ห้องเดี่ยว', status: 'เตียงว่างพร้อมดูแลทันที', description: '', facilities: [], imageUrls: [] }
            ]
        });
    };

    const removeRoomType = (index: number) => {
        const newRoomTypes = formData.roomTypes.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, roomTypes: newRoomTypes });
    };

    const handleRoomTypeImageChange = (roomIndex: number, imageIndex: number, value: string) => {
        const newRoomTypes = [...formData.roomTypes];
        const newImages = [...newRoomTypes[roomIndex].imageUrls];
        newImages[imageIndex] = value;
        newRoomTypes[roomIndex] = { ...newRoomTypes[roomIndex], imageUrls: newImages };
        setFormData({ ...formData, roomTypes: newRoomTypes });
    };

    const addRoomTypeImage = (roomIndex: number) => {
        const newRoomTypes = [...formData.roomTypes];
        newRoomTypes[roomIndex] = {
            ...newRoomTypes[roomIndex],
            imageUrls: [...newRoomTypes[roomIndex].imageUrls, '']
        };
        setFormData({ ...formData, roomTypes: newRoomTypes });
    };

    const removeRoomTypeImage = (roomIndex: number, imageIndex: number) => {
        const newRoomTypes = [...formData.roomTypes];
        const newImages = (newRoomTypes[roomIndex].imageUrls || []).filter((_: any, i: number) => i !== imageIndex);
        newRoomTypes[roomIndex] = { ...newRoomTypes[roomIndex], imageUrls: newImages };
        setFormData({ ...formData, roomTypes: newRoomTypes });
    };


    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลศูนย์ดูแล</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto justify-center md:justify-start shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" /> เพิ่มศูนย์ดูแลใหม่
                </button>
            </div>

            {/* --- Filter Bar Section --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col space-y-4">

                    {/* Top Row: Search */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อศูนย์, จังหวัด, หรือ Tracking Source..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">ตัวกรอง:</span>
                        </div>

                        {/* Province Filter */}
                        <select
                            value={filterProvince}
                            onChange={(e) => { setFilterProvince(e.target.value); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 max-w-[160px]"
                        >
                            {THAI_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov === 'ทั้งหมด' ? 'ทุกจังหวัด' : prov}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="visible">เปิดแสดง (Visible)</option>
                            <option value="hidden">ซ่อน (Hidden)</option>
                            <option value="pending">รออนุมัติ (Pending)</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">ประเภททั้งหมด</option>
                            <option value="monthly">รายเดือน</option>
                            <option value="daily">รายวัน</option>
                        </select>

                        {/* Partner Filter */}
                        <select
                            value={filterPartner}
                            onChange={(e) => { setFilterPartner(e.target.value); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">พาร์ทเนอร์ทั้งหมด</option>
                            <option value="true">เฉพาะพาร์ทเนอร์</option>
                            <option value="false">ทั่วไป</option>
                        </select>

                        {/* Reset Button */}
                        <button
                            onClick={resetFilters}
                            className="ml-auto md:ml-0 flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            title="ล้างตัวกรองทั้งหมด"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> ล้างค่า
                        </button>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                        พบข้อมูลทั้งหมด: <strong>{filteredCenters.length}</strong> รายการ
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b">
                                <th className="py-4 px-4 w-16 text-center">ลำดับ</th>
                                <th className="py-4 px-4">ชื่อศูนย์ดูแล</th>
                                <th className="py-4 px-4">จังหวัด</th>
                                <th className="py-4 px-4">ประเภท</th>
                                <th className="py-4 px-4">ราคา</th>
                                <th className="py-4 px-4">สถานะ</th>
                                <th className="py-4 px-4">Tracking</th>
                                <th className="py-4 px-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={8} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : filteredCenters.length === 0 ? (
                                <tr><td colSpan={8} className="py-8 text-center text-gray-500">ไม่พบข้อมูลตามเงื่อนไขที่กำหนด</td></tr>
                            ) : (
                                paginatedCenters.map((center: any, index) => (
                                    <tr key={center.id} className="hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                        <td className="py-3 px-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-gray-900 max-w-xs overflow-hidden whitespace-nowrap text-ellipsis" title={center.name}>
                                                {truncateText(center.name, 35)}
                                            </div>
                                            {center.isPartner && (
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 mt-1">
                                                    Partner
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">{center.province || '-'}</td>
                                        <td className="py-3 px-4">
                                            {center.type === 'both' ? 'ทั้งคู่' : center.type === 'daily' ? 'รายวัน' : 'รายเดือน'}
                                        </td>
                                        <td className="py-3 px-4 font-medium">฿{center.price?.toLocaleString() ?? '0'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${center.status === 'visible' ? 'bg-green-50 text-green-700 border-green-200' :
                                                center.status === 'hidden' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {center.status === 'visible' ? 'เปิดการแสดง' :
                                                    center.status === 'hidden' ? 'ปิดการแสดง' : 'รอการอนุมัติ'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-gray-500">
                                            {center.utmSource ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 w-fit" title={`Source: ${center.utmSource}`}>
                                                        src: {truncateText(center.utmSource, 10)}
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center space-x-2">
                                            <button onClick={() => openModal(center)} className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 p-1.5 rounded-md">
                                                <FilePenLine className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(center.id)} className="text-red-600 hover:text-red-800 transition-colors bg-red-50 p-1.5 rounded-md">
                                                <Trash2 className="w-4 h-4" />
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
                        <span>หน้า {currentPage} จาก {totalPages}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent bg-white shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border rounded-md hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent bg-white shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
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
                                            {THAI_PROVINCES.filter(p => p !== 'ทั้งหมด').map(prov => (
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
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={(content) => setFormData({ ...formData, description: content })}
                                            placeholder="เขียนรายละเอียดศูนย์ดูแลที่นี่..."
                                        />
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">โลโก้แบรนด์</label>
                                        {formData.brandLogoUrl ? (
                                            <div className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                                <div className="w-14 h-14 bg-white rounded-md border overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                                                    <img src={formData.brandLogoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-green-600 font-medium">✓ อัปโหลดโลโก้แล้ว</div>
                                                    <div className="text-[11px] text-gray-400 truncate font-mono">{formData.brandLogoUrl}</div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <ImageUploadButton
                                                        folder="centers/logos"
                                                        label="เปลี่ยนโลโก้"
                                                        className="bg-white hover:bg-gray-100 text-gray-700 border-gray-300 text-xs px-2.5 py-1"
                                                        onUploadSuccess={(url) => setFormData((prev: any) => ({ ...prev, brandLogoUrl: url }))}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData((prev: any) => ({ ...prev, brandLogoUrl: '' }))}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                        title="ลบโลโก้"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-md bg-gray-100 border text-gray-400 flex items-center justify-center">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs text-gray-500">ยังไม่มีโลโก้ (อัปโหลดรูปภาพ)</span>
                                                </div>
                                                <ImageUploadButton
                                                    folder="centers/logos"
                                                    label="อัปโหลดโลโก้"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs text-xs px-3 py-1.5"
                                                    onUploadSuccess={(url) => setFormData((prev: any) => ({ ...prev, brandLogoUrl: url }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Images Management */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">รูปภาพศูนย์ดูแล</label>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                อัปโหลดรูปภาพบรรยากาศ สิ่งอำนวยความสะดวก หรือบริเวณรอบศูนย์ (อัปโหลดไฟล์เท่านั้น)
                                            </p>
                                        </div>
                                        <ImageUploadButton
                                            folder="centers/photos"
                                            label="อัปโหลดรูปภาพเพิ่ม"
                                            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs text-xs px-3 py-1.5"
                                            onUploadSuccess={(url) => {
                                                setFormData((prev: any) => ({
                                                    ...prev,
                                                    imageUrls: [...(prev.imageUrls || []).filter(Boolean), url]
                                                }));
                                            }}
                                        />
                                    </div>

                                    {formData.imageUrls && formData.imageUrls.filter(Boolean).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {formData.imageUrls.filter(Boolean).map((url: string, idx: number) => (
                                                <div key={idx} className="relative bg-white border border-gray-200 rounded-xl overflow-hidden group shadow-xs">
                                                    <div className="relative h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={url}
                                                            alt={`Photo ${idx + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Error')}
                                                        />
                                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                                                            {idx === 0 ? 'รูปหลัก' : `#${idx + 1}`}
                                                        </div>
                                                    </div>
                                                    <div className="p-2.5 flex items-center justify-between bg-white border-t border-gray-100">
                                                        <div className="text-[11px] text-gray-400 truncate max-w-[120px] font-mono">
                                                            {url}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <ImageUploadButton
                                                                folder="centers/photos"
                                                                label="เปลี่ยนรูป"
                                                                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 text-[11px] px-2 py-1"
                                                                onUploadSuccess={(uploadedUrl) => handleImageChange(idx, uploadedUrl)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImageField(idx)}
                                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                title="ลบรูปภาพ"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50 flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">ยังไม่มีรูปภาพศูนย์ดูแล</div>
                                            <p className="text-xs text-gray-500">คลิกปุ่มด้านล่างเพื่อเลือกไฟล์รูปภาพและอัปโหลดเข้าสู่ระบบ</p>
                                            <div className="mt-2">
                                                <ImageUploadButton
                                                    folder="centers/photos"
                                                    label="เลือกไฟล์และอัปโหลดรูปภาพ"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm px-4 py-2 text-xs"
                                                    onUploadSuccess={(url) => {
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            imageUrls: [...(prev.imageUrls || []).filter(Boolean), url]
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
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

                                {/* Room Types */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex flex-col">
                                            <label className="text-lg font-bold text-gray-800">ประเภทห้องพักและการแสดงความพร้อม</label>
                                            <span className="text-xs text-blue-600 font-semibold mt-0.5">
                                                * รูปแต่ละประเภทห้องควรมีขั้นต่ำ 3-6 รูป เพื่อแสดงความพร้อมของเตียงพัก
                                            </span>
                                        </div>
                                        <button type="button" onClick={addRoomType} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center">
                                            <Plus className="w-4 h-4 mr-1" /> เพิ่มประเภทห้องพัก
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.roomTypes && formData.roomTypes.map((room: any, rIdx: number) => {
                                            const imgCount = room.imageUrls ? room.imageUrls.filter((url: string) => url.trim() !== '').length : 0;
                                            return (
                                                <div key={rIdx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 relative space-y-4 animate-in fade-in duration-200">
                                                    <button type="button" onClick={() => removeRoomType(rIdx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-600 mb-1 font-sans">ประเภทห้องพัก</label>
                                                            <div className="flex gap-2">
                                                                <select
                                                                    className="border rounded px-2 py-1.5 text-sm w-1/2 bg-white text-gray-800"
                                                                    value={['ห้องเดี่ยว', 'ห้องรวม', 'ห้องพิเศษ', 'ห้อง premium'].includes(room.name) ? room.name : 'custom'}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        handleRoomTypeChange(rIdx, 'name', val === 'custom' ? '' : val);
                                                                    }}
                                                                >
                                                                    <option value="ห้องเดี่ยว">ห้องเดี่ยว</option>
                                                                    <option value="ห้องรวม">ห้องรวม</option>
                                                                    <option value="ห้องพิเศษ">ห้องพิเศษ</option>
                                                                    <option value="ห้อง premium">ห้อง premium</option>
                                                                    <option value="custom">ระบุเอง...</option>
                                                                </select>
                                                                <input
                                                                    type="text"
                                                                    placeholder="ระบุเอง..."
                                                                    required
                                                                    className="border rounded px-2 py-1.5 text-sm w-1/2 bg-white text-gray-800"
                                                                    value={room.name}
                                                                    onChange={(e) => handleRoomTypeChange(rIdx, 'name', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-600 mb-1 font-sans">สถานะความพร้อม</label>
                                                            <div className="flex gap-2">
                                                                <select
                                                                    className="border rounded px-2 py-1.5 text-sm w-1/2 bg-white text-gray-800"
                                                                    value={['เตียงว่างพร้อมดูแลทันที', 'เตียงว่างพร้อมบริการ', 'มีเตียงว่าง', 'เต็มชั่วคราว'].includes(room.status) ? room.status : 'custom'}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        handleRoomTypeChange(rIdx, 'status', val === 'custom' ? '' : val);
                                                                    }}
                                                                >
                                                                    <option value="เตียงว่างพร้อมดูแลทันที">เตียงว่างพร้อมดูแลทันที</option>
                                                                    <option value="เตียงว่างพร้อมบริการ">เตียงว่างพร้อมบริการ</option>
                                                                    <option value="มีเตียงว่าง">มีเตียงว่าง</option>
                                                                    <option value="เต็มชั่วคราว">เต็มชั่วคราว</option>
                                                                    <option value="custom">ระบุเอง...</option>
                                                                </select>
                                                                <input
                                                                    type="text"
                                                                    placeholder="ระบุเอง..."
                                                                    required
                                                                    className="border rounded px-2 py-1.5 text-sm w-1/2 bg-white text-gray-800"
                                                                    value={room.status}
                                                                    onChange={(e) => handleRoomTypeChange(rIdx, 'status', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-bold text-gray-600 mb-1 font-sans">คำอธิบายห้องพัก</label>
                                                            <input
                                                                type="text"
                                                                placeholder="คำอธิบายสั้นๆ เช่น ห้องเดี่ยวขนาดใหญ่ หน้าต่างบานใหญ่ วิวสวนหย่อมสงบเงียบ"
                                                                className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-800"
                                                                value={room.description || ''}
                                                                onChange={(e) => handleRoomTypeChange(rIdx, 'description', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-bold text-gray-600 mb-1 font-sans">สิ่งอำนวยความสะดวกในห้องพัก (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="เช่น เตียงปรับไฟฟ้า, ปุ่มกดฉุกเฉิน, เครื่องปรับอากาศ, กล้องวงจรปิด"
                                                                className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-800"
                                                                value={Array.isArray(room.facilities) ? room.facilities.join(', ') : ''}
                                                                onChange={(e) => handleRoomTypeChange(rIdx, 'facilities', e.target.value.split(',').map((s: string) => s.trim()))}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Room Type Images */}
                                                    <div className="border-t border-slate-200 pt-3 mt-2.5">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-700 font-sans">
                                                                    รูปภาพห้องพัก ({imgCount} รูป)
                                                                </span>
                                                                {imgCount === 0 ? (
                                                                    <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-medium font-sans">
                                                                        ยังไม่มีรูปภาพ
                                                                    </span>
                                                                ) : imgCount < 3 ? (
                                                                    <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded font-medium font-sans">
                                                                        ✓ จำนวนรูปเหมาะสม
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-medium font-sans">
                                                                        ✓ รูปเยอะจุใจ
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <ImageUploadButton
                                                                folder="centers/rooms"
                                                                label="อัปโหลดรูปห้อง"
                                                                className="bg-slate-800 hover:bg-slate-900 text-white border-slate-800 text-[11px] px-2.5 py-1"
                                                                onUploadSuccess={(uploadedUrl) => {
                                                                    const currentImgs = (room.imageUrls || []).filter(Boolean);
                                                                    handleRoomTypeChange(rIdx, 'imageUrls', [...currentImgs, uploadedUrl]);
                                                                }}
                                                            />
                                                        </div>

                                                        {room.imageUrls && room.imageUrls.filter(Boolean).length > 0 ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {room.imageUrls.filter(Boolean).map((url: string, iIdx: number) => (
                                                                    <div key={iIdx} className="relative bg-white rounded-lg border border-slate-200 overflow-hidden group shadow-xs">
                                                                        <div className="h-24 bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                            <img
                                                                                src={url}
                                                                                alt={`Room photo ${iIdx + 1}`}
                                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')}
                                                                            />
                                                                        </div>
                                                                        <div className="p-1.5 flex items-center justify-between bg-white border-t border-slate-100">
                                                                            <ImageUploadButton
                                                                                folder="centers/rooms"
                                                                                label="เปลี่ยนรูป"
                                                                                className="p-1 px-2 text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                                                                onUploadSuccess={(uploadedUrl) => handleRoomTypeImageChange(rIdx, iIdx, uploadedUrl)}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeRoomTypeImage(rIdx, iIdx)}
                                                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                                                title="ลบรูปนี้"
                                                                            >
                                                                                <X className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 text-xs text-slate-500 flex items-center justify-center gap-2">
                                                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                                                <span>ยังไม่มีรูปภาพห้องพัก คลิก &quot;อัปโหลดรูปห้อง&quot; เพื่อเพิ่มรูปภาพ</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!formData.roomTypes || formData.roomTypes.length === 0) && (
                                            <p className="text-center text-gray-500 text-sm py-4 border-2 border-dashed rounded-lg font-sans">ยังไม่มีข้อมูลประเภทห้องพัก</p>
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