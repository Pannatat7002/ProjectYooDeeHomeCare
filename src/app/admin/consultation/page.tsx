'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Trash2, Phone, Mail, User, Clock, ChevronLeft, ChevronRight,
    MessageSquare, Search, Filter, Edit3, X, Save, Building2,
    Heart, BedSingle, BedDouble, DollarSign, Calendar, AlertCircle,
    CheckCircle2, Sparkles, PhoneCall, Check, ExternalLink
} from 'lucide-react';
import { fetchWithAuth } from '../../../lib/auth-client';

export interface Consultation {
    id: number;
    name: string;
    phone: string;
    lineId?: string;
    line_id?: string;
    email?: string;
    roomType?: string;
    room_type?: string;
    branch: string;
    budget?: string;
    convenientTime?: string;
    convenient_time?: string;
    message?: string;
    status: string;
    submittedAt: string;
    submitted_at?: string;
    // Senior Details
    recipientName?: string;
    recipient_name?: string;
    recipientAge?: number;
    recipient_age?: number;
    relationshipToRecipient?: string;
    relationship_to_recipient?: string;
    // CRM Advisor & Center Status
    notes?: string;
    centerCallStatus?: string;
    center_call_status?: string;
    hasCommission?: boolean;
    has_commission?: boolean;
    commissionRate?: string;
    commission_rate?: string;
    hasSingleRoom?: boolean;
    has_single_room?: boolean;
    hasSharedRoom?: boolean;
    has_shared_room?: boolean;
    customPrice?: string;
    custom_price?: string;
    utmSource?: string;
    utm_source?: string;
}

const API_URL = '/api/care-centers/consultations';

// Normalize phone for Single Customer View deduplication
const normalizePhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/[^\d]/g, '');
};

const CALL_STATUS_OPTIONS = [
    { value: 'not_called', label: 'ยังไม่โทร', color: 'bg-slate-100 text-slate-700' },
    { value: 'no_answer', label: 'ไม่รับสาย', color: 'bg-amber-100 text-amber-800' },
    { value: 'contacted', label: 'ติดต่อแล้ว', color: 'bg-blue-100 text-blue-800' },
    { value: 'appointment', label: 'นัดหมายดูศูนย์', color: 'bg-purple-100 text-purple-800' },
    { value: 'accepted', label: 'ศูนย์รับเคส', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'rejected', label: 'ศูนย์ปฏิเสธ/ไม่รับ', color: 'bg-rose-100 text-rose-800' },
];

const LEAD_STATUS_OPTIONS = [
    { value: 'pending', label: 'รอติดต่อ', color: 'bg-amber-100 text-amber-800' },
    { value: 'urgent', label: 'ด่วนมาก', color: 'bg-rose-100 text-rose-800' },
    { value: 'verified', label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-800' },
    { value: 'followed_up', label: 'ประสานงานแล้ว', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'closed', label: 'ปิดเคส', color: 'bg-slate-100 text-slate-700' },
];

export default function ConsultationManagement() {
    // --- State ---
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Selected Consultation for Detail / Edit Modal
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit Modal Form State
    const [editForm, setEditForm] = useState({
        status: 'pending',
        notes: '',
        centerCallStatus: 'not_called',
        hasCommission: false,
        commissionRate: '',
        hasSingleRoom: false,
        hasSharedRoom: false,
        customPrice: '',
        recipientName: '',
        recipientAge: '',
        relationshipToRecipient: '',
        patientCondition: '',
        roomType: '',
        budget: '',
        convenientTime: '',
        message: '',
        lineId: '',
        email: '',
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Fetch Data ---
    const fetchConsultations = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(API_URL);
            if (!res.ok) throw new Error('Failed to fetch consultations');

            const result: { data: Consultation[] } = await res.json();
            const list = (result.data || []).sort((a, b) => Number(b.id) - Number(a.id));
            setConsultations(list);
        } catch (error) {
            console.error('Fetch error:', error);
            alert('ไม่สามารถโหลดข้อมูลการติดต่อได้');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    // Helper: Map all inquiries for a phone number (Single Customer View)
    const phoneToInquiries = useMemo(() => {
        const map = new Map<string, Consultation[]>();
        for (const c of consultations) {
            const clean = normalizePhone(c.phone);
            if (!clean) continue;
            if (!map.has(clean)) {
                map.set(clean, []);
            }
            map.get(clean)!.push(c);
        }
        return map;
    }, [consultations]);

    // Open Modal and pre-fill form
    const handleOpenDetailModal = (item: Consultation) => {
        const cleanPhone = normalizePhone(item.phone);
        const related = phoneToInquiries.get(cleanPhone) || [item];

        // Sync Senior and preference info from related records if current is empty
        const withSenior = related.find(c => (c.recipientName || c.recipient_name) || (c.recipientAge || c.recipient_age)) || item;
        const withRoom = related.find(c => (c.roomType || c.room_type)) || item;
        const withBudget = related.find(c => c.budget) || item;
        const withMsg = related.find(c => c.message) || item;
        const withLine = related.find(c => (c.lineId || c.line_id)) || item;
        const withEmail = related.find(c => c.email) || item;

        setSelectedConsultation(item);
        setEditForm({
            status: item.status || 'pending',
            notes: item.notes || '',
            centerCallStatus: item.centerCallStatus || item.center_call_status || 'not_called',
            hasCommission: Boolean(item.hasCommission ?? item.has_commission ?? false),
            commissionRate: item.commissionRate || item.commission_rate || '',
            hasSingleRoom: Boolean(item.hasSingleRoom ?? item.has_single_room ?? false),
            hasSharedRoom: Boolean(item.hasSharedRoom ?? item.has_shared_room ?? false),
            customPrice: item.customPrice || item.custom_price || '',
            recipientName: item.recipientName || item.recipient_name || withSenior.recipientName || withSenior.recipient_name || '',
            recipientAge: String(item.recipientAge ?? item.recipient_age ?? withSenior.recipientAge ?? withSenior.recipient_age ?? ''),
            relationshipToRecipient: item.relationshipToRecipient || item.relationship_to_recipient || withSenior.relationshipToRecipient || withSenior.relationship_to_recipient || '',
            patientCondition: item.patientCondition || item.patient_condition || item.condition || '',
            roomType: item.roomType || item.room_type || withRoom.roomType || withRoom.room_type || '',
            budget: item.budget || withBudget.budget || '',
            convenientTime: item.convenientTime || item.convenient_time || '',
            message: item.message || withMsg.message || '',
            lineId: item.lineId || item.line_id || withLine.lineId || withLine.line_id || '',
            email: item.email || withEmail.email || '',
        });
        setIsEditModalOpen(true);
    };

    // Save changes from Modal
    const handleSaveDetailModal = async () => {
        if (!selectedConsultation) return;
        setIsSaving(true);
        try {
            const payload = {
                status: editForm.status,
                notes: editForm.notes,
                center_call_status: editForm.centerCallStatus,
                centerCallStatus: editForm.centerCallStatus,
                has_commission: editForm.hasCommission,
                hasCommission: editForm.hasCommission,
                commission_rate: editForm.commissionRate,
                commissionRate: editForm.commissionRate,
                has_single_room: editForm.hasSingleRoom,
                hasSingleRoom: editForm.hasSingleRoom,
                has_shared_room: editForm.hasSharedRoom,
                hasSharedRoom: editForm.hasSharedRoom,
                custom_price: editForm.customPrice,
                customPrice: editForm.customPrice,
                recipient_name: editForm.recipientName,
                recipientName: editForm.recipientName,
                recipient_age: editForm.recipientAge ? Number(editForm.recipientAge) : undefined,
                recipientAge: editForm.recipientAge ? Number(editForm.recipientAge) : undefined,
                relationship_to_recipient: editForm.relationshipToRecipient,
                relationshipToRecipient: editForm.relationshipToRecipient,
                room_type: editForm.roomType,
                roomType: editForm.roomType,
                budget: editForm.budget,
                patient_condition: editForm.patientCondition,
                patientCondition: editForm.patientCondition,
                convenient_time: editForm.convenientTime,
                convenientTime: editForm.convenientTime,
                message: editForm.message,
                line_id: editForm.lineId,
                lineId: editForm.lineId,
                email: editForm.email,
            };

            const res = await fetchWithAuth(`${API_URL}/${selectedConsultation.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // Update local state
                setConsultations(prev =>
                    prev.map(c => (c.id === selectedConsultation.id ? { ...c, ...payload } : c))
                );
                setIsEditModalOpen(false);
                alert('บันทึกข้อมูลเรียบร้อยแล้ว');
            } else {
                alert('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsSaving(false);
        }
    };

    // Quick Update Status directly from Table
    const handleQuickUpdateStatus = async (consultation: Consultation, newStatus: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/${consultation.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setConsultations(prev =>
                    prev.map(c => (c.id === consultation.id ? { ...c, status: newStatus } : c))
                );
            } else {
                alert('เปลี่ยนสถานะไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
        }
    };

    // Delete consultation
    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการติดต่อนี้?')) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setConsultations(prev => prev.filter(c => c.id !== id));
            } else {
                alert('ลบรายการไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    // Filter consultations
    const filteredConsultations = useMemo(() => {
        return consultations.filter(item => {
            // Status Tab
            if (statusFilter !== 'all') {
                if (statusFilter === 'pending' && !(item.status === 'pending' || item.status === 'urgent' || !item.status)) {
                    return false;
                } else if (statusFilter !== 'pending' && item.status !== statusFilter) {
                    return false;
                }
            }

            // Search query
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const cleanQ = q.replace(/[^\d]/g, '');

            const matchName = item.name?.toLowerCase().includes(q);
            const matchSenior = (item.recipientName || item.recipient_name)?.toLowerCase().includes(q);
            const matchBranch = item.branch?.toLowerCase().includes(q);
            const matchMessage = item.message?.toLowerCase().includes(q);
            const matchPhone = cleanQ.length > 2 && normalizePhone(item.phone).includes(cleanQ);
            const matchLine = (item.lineId || item.line_id)?.toLowerCase().includes(q);

            return matchName || matchSenior || matchBranch || matchMessage || matchPhone || matchLine;
        });
    }, [consultations, statusFilter, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
    const paginatedConsultations = filteredConsultations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Related inquiries for the selected consultation
    const selectedRelatedInquiries = useMemo(() => {
        if (!selectedConsultation) return [];
        const cleanPhone = normalizePhone(selectedConsultation.phone);
        return phoneToInquiries.get(cleanPhone) || [selectedConsultation];
    }, [selectedConsultation, phoneToInquiries]);

    // Unique branches customer interested in (Single Customer View)
    const getCustomerBranches = (phone: string, fallbackBranch: string) => {
        const clean = normalizePhone(phone);
        const related = phoneToInquiries.get(clean) || [];
        const branches = related
            .map(c => c.branch)
            .filter((b): b is string => Boolean(b && b.trim()));
        const unique = Array.from(new Set(branches));
        return unique.length > 0 ? unique.join(' / ') : fallbackBranch || 'ไม่ระบุ';
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-500/20">
                            <User className="w-6 h-6" />
                        </div>
                        รายการคำขอปรึกษา & ลูกค้าเป้าหมาย (CRM Leads)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        จัดการเคส ดูแลข้อมูลผู้สูงอายุ ประสานงานศูนย์ และบันทึกข้อมูล Single Customer View
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-lg">
                        รวมทั้งหมด: {consultations.length} รายการ
                    </span>
                    <button
                        onClick={fetchConsultations}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        รีเฟรชข้อมูล
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search Box */}
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, ชื่อผู้สูงอายุ, หรือศูนย์..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            ล้าง
                        </button>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    {[
                        { id: 'all', label: 'ทั้งหมด' },
                        { id: 'pending', label: 'รอติดต่อ' },
                        { id: 'verified', label: 'ยืนยันแล้ว' },
                        { id: 'followed_up', label: 'ประสานงานแล้ว' },
                        { id: 'closed', label: 'ปิดเคส' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setStatusFilter(tab.id);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === tab.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
                                <th className="py-3.5 px-4 w-12 text-center">#</th>
                                <th className="py-3.5 px-4 min-w-[220px]">ข้อมูลผู้ติดต่อ</th>
                                <th className="py-3.5 px-4 min-w-[200px]">ผู้สูงอายุ / ความต้องการ</th>
                                <th className="py-3.5 px-4 min-w-[220px]">ศูนย์ที่สนใจ (Single Customer View)</th>
                                <th className="py-3.5 px-4 min-w-[150px] text-center">สถานะโทรคุยศูนย์</th>
                                <th className="py-3.5 px-4 min-w-[130px] text-center">สถานะเคส</th>
                                <th className="py-3.5 px-4 w-28 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        กำลังโหลดข้อมูลการติดต่อ...
                                    </td>
                                </tr>
                            ) : paginatedConsultations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        ไม่พบรายการคำขอปรึกษาที่ตรงกับเงื่อนไข
                                    </td>
                                </tr>
                            ) : (
                                paginatedConsultations.map((item, index) => {
                                    const cleanPhone = normalizePhone(item.phone);
                                    const relatedCount = phoneToInquiries.get(cleanPhone)?.length || 1;
                                    const seniorName = item.recipientName || item.recipient_name;
                                    const seniorAge = item.recipientAge || item.recipient_age;
                                    const callStatus = item.centerCallStatus || item.center_call_status || 'not_called';
                                    const callOpt = CALL_STATUS_OPTIONS.find(o => o.value === callStatus) || CALL_STATUS_OPTIONS[0];

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/80 transition-colors group"
                                        >
                                            <td className="py-3.5 px-4 text-center text-slate-400 text-xs font-mono">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            {/* ข้อมูลผู้ติดต่อ */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                    {item.name}
                                                    {relatedCount > 1 && (
                                                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full font-semibold">
                                                            {relatedCount} ศูนย์
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <a href={`tel:${item.phone}`} className="hover:text-blue-600 font-mono">
                                                        {item.phone}
                                                    </a>
                                                </div>
                                                {(item.lineId || item.line_id) && (
                                                    <div className="flex items-center gap-1 text-xs text-emerald-700 mt-0.5">
                                                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                                                        <span>LINE: {item.lineId || item.line_id}</span>
                                                    </div>
                                                )}
                                                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(item.submittedAt || item.submitted_at || '')}
                                                </div>
                                            </td>

                                            {/* ผู้สูงอายุ & ความต้องการ */}
                                            <td className="py-3.5 px-4">
                                                {seniorName ? (
                                                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                                                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
                                                        {seniorName} {seniorAge ? `(${seniorAge} ปี)` : ''}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic">ไม่ระบุชื่อผู้สูงอายุ</div>
                                                )}
                                                {(item.relationshipToRecipient || item.relationship_to_recipient) && (
                                                    <div className="text-xs text-slate-500">
                                                        ความสัมพันธ์: {item.relationshipToRecipient || item.relationship_to_recipient}
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-600 mt-1">
                                                    ห้อง: <span className="font-medium text-slate-800">{item.roomType || item.room_type || 'ยังไม่ระบุ'}</span>
                                                </div>
                                                {item.budget && (
                                                    <div className="text-xs text-slate-600">
                                                        งบประมาณ: <span className="font-medium text-slate-800">{item.budget}</span>
                                                    </div>
                                                )}
                                                {(item.patientCondition || item.patient_condition || item.condition) && (
                                                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                                                        อาการ: {item.patientCondition || item.patient_condition || item.condition}
                                                    </div>
                                                )}
                                            </td>

                                            {/* ศูนย์ที่สนใจ (Single Customer View) */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-blue-700 text-xs flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    <span>{getCustomerBranches(item.phone, item.branch)}</span>
                                                </div>
                                                {item.message && (
                                                    <div
                                                        className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-xs"
                                                        title={item.message}
                                                    >
                                                        {item.message}
                                                    </div>
                                                )}
                                                {item.notes && (
                                                    <div className="mt-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block max-w-xs truncate font-medium">
                                                        Note: {item.notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* สถานะโทรคุยศูนย์ */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${callOpt.color}`}>
                                                    {callOpt.label}
                                                </span>
                                                {(item.hasCommission || item.has_commission) && (
                                                    <div className="mt-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-block">
                                                        คอมมิชชั่น {item.commissionRate || item.commission_rate || 'มีค่าแนะนำ'}
                                                    </div>
                                                )}
                                            </td>

                                            {/* สถานะเคส (Lead Status) */}
                                            <td className="py-3.5 px-4 text-center">
                                                <select
                                                    value={item.status || 'pending'}
                                                    onChange={e => handleQuickUpdateStatus(item, e.target.value)}
                                                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                                                >
                                                    {LEAD_STATUS_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* จัดการ (Actions) */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenDetailModal(item)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="ดูรายละเอียด & จัดการเคส"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="ลบเคส"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600 gap-3">
                        <span>
                            แสดง {paginatedConsultations.length} รายการ จากที่กรองได้ {filteredConsultations.length} รายการ (หน้า {currentPage} / {totalPages})
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                                .map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'border border-slate-200 hover:bg-white text-slate-700'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Comprehensive Lead Detail & Edit Modal */}
            {isEditModalOpen && selectedConsultation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        จัดการเคส & ข้อมูล CRM: {selectedConsultation.name}
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        ID: {selectedConsultation.id} | ส่งเมื่อ: {formatDate(selectedConsultation.submittedAt || selectedConsultation.submitted_at || '')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Section 1: Single Customer View Info & Contact */}
                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-blue-600" />
                                    ข้อมูลผู้ติดต่อ & ประวัติคำขอ (Single Customer View)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-slate-500">ชื่อผู้ติดต่อ:</span>
                                        <p className="font-semibold text-slate-900">{selectedConsultation.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">เบอร์โทรศัพท์:</span>
                                        <p className="font-mono font-bold text-blue-700 flex items-center gap-2">
                                            {selectedConsultation.phone}
                                            <a
                                                href={`tel:${selectedConsultation.phone}`}
                                                className="text-xs font-sans px-2 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
                                            >
                                                <PhoneCall className="w-3 h-3" /> โทรออก
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">LINE ID:</span>
                                        <input
                                            type="text"
                                            value={editForm.lineId}
                                            onChange={e => setEditForm(prev => ({ ...prev, lineId: e.target.value }))}
                                            placeholder="ระบุ LINE ID..."
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">อีเมล:</span>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="ระบุ Email..."
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-xs text-slate-500 font-semibold">ศูนย์ที่สนใจทั้งหมด ({selectedRelatedInquiries.length} รายการ):</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {selectedRelatedInquiries.map(item => (
                                                <span
                                                    key={item.id}
                                                    className="text-xs bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs font-medium flex items-center gap-1"
                                                >
                                                    <Building2 className="w-3 h-3 text-blue-500" />
                                                    {item.branch || 'ศูนย์ทั่วไป'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Senior Details & Preferences */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                                    <Heart className="w-4 h-4 text-rose-500" />
                                    ข้อมูลผู้สูงอายุ & ความต้องการห้องพัก
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">ชื่อผู้สูงอายุ:</label>
                                        <input
                                            type="text"
                                            value={editForm.recipientName}
                                            onChange={e => setEditForm(prev => ({ ...prev, recipientName: e.target.value }))}
                                            placeholder="เช่น คุณยายสมศรี"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">อายุ (ปี):</label>
                                        <input
                                            type="number"
                                            value={editForm.recipientAge}
                                            onChange={e => setEditForm(prev => ({ ...prev, recipientAge: e.target.value }))}
                                            placeholder="เช่น 78"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">ความสัมพันธ์:</label>
                                        <input
                                            type="text"
                                            value={editForm.relationshipToRecipient}
                                            onChange={e => setEditForm(prev => ({ ...prev, relationshipToRecipient: e.target.value }))}
                                            placeholder="เช่น มารดา, บิดา, ญาติ"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">ประเภทห้องที่ต้องการ:</label>
                                        <input
                                            type="text"
                                            value={editForm.roomType}
                                            onChange={e => setEditForm(prev => ({ ...prev, roomType: e.target.value }))}
                                            placeholder="เช่น ห้องเดี่ยว, ห้องรวม"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">งบประมาณต่อเดือน:</label>
                                        <input
                                            type="text"
                                            value={editForm.budget}
                                            onChange={e => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                                            placeholder="เช่น 20,000 - 30,000"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">เวลาที่สะดวกให้ติดต่อ:</label>
                                        <input
                                            type="text"
                                            value={editForm.convenientTime}
                                            onChange={e => setEditForm(prev => ({ ...prev, convenientTime: e.target.value }))}
                                            placeholder="เช่น บ่าย 13:00 - 15:00"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">อาการ / ภาวะผู้สูงอายุ:</label>
                                        <input
                                            type="text"
                                            value={editForm.patientCondition}
                                            onChange={e => setEditForm(prev => ({ ...prev, patientCondition: e.target.value }))}
                                            placeholder="เช่น ผู้ป่วยติดเตียง, ช่วยเหลือตัวเองได้"
                                            className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="text-xs font-medium text-slate-600">อาการ / เงื่อนไขเพิ่มเติม:</label>
                                        <textarea
                                            rows={2}
                                            value={editForm.message}
                                            onChange={e => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="อาการผู้ป่วย หรือความต้องการพิเศษ..."
                                            className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: CRM Center Call & Commission Details */}
                            <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/70">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
                                    <PhoneCall className="w-4 h-4 text-amber-600" />
                                    การประสานงานศูนย์ดูแล & ค่าแนะนำ (Care Center CRM)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">สถานะโทรคุยกับศูนย์:</label>
                                        <select
                                            value={editForm.centerCallStatus}
                                            onChange={e => setEditForm(prev => ({ ...prev, centerCallStatus: e.target.value }))}
                                            className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
                                        >
                                            {CALL_STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">ราคาพิเศษที่ศูนย์แจ้ง:</label>
                                        <input
                                            type="text"
                                            value={editForm.customPrice}
                                            onChange={e => setEditForm(prev => ({ ...prev, customPrice: e.target.value }))}
                                            placeholder="เช่น 22,000 บาท/เดือน"
                                            className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                        />
                                    </div>

                                    {/* Room Availability Switches */}
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={editForm.hasSingleRoom}
                                                onChange={e => setEditForm(prev => ({ ...prev, hasSingleRoom: e.target.checked }))}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <BedSingle className="w-4 h-4 text-slate-500" />
                                            มีห้องเดี่ยวว่าง
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={editForm.hasSharedRoom}
                                                onChange={e => setEditForm(prev => ({ ...prev, hasSharedRoom: e.target.checked }))}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <BedDouble className="w-4 h-4 text-slate-500" />
                                            มีห้องรวมว่าง
                                        </label>
                                    </div>

                                    {/* Commission */}
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={editForm.hasCommission}
                                                onChange={e => setEditForm(prev => ({ ...prev, hasCommission: e.target.checked }))}
                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                            มีค่าแนะนำ
                                        </label>
                                        {editForm.hasCommission && (
                                            <input
                                                type="text"
                                                value={editForm.commissionRate}
                                                onChange={e => setEditForm(prev => ({ ...prev, commissionRate: e.target.value }))}
                                                placeholder="อัตราค่าแนะนำ เช่น 10%, 3,000 บาท"
                                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Lead Status & Advisor Notes */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-800">สถานะเคสโดยรวม (Lead Status):</label>
                                    <select
                                        value={editForm.status}
                                        onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full mt-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                    >
                                        {LEAD_STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                        บันทึกช่วยจำเคส (Care Advisor Notes):
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editForm.notes}
                                        onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="บันทึกรายละเอียด เช่น คุยกับศูนย์แล้ว นัดดูวันเสาร์, ลูกค้ามีงบจำกัด ขอดูห้องเดี่ยวก่อน..."
                                        className="w-full mt-1.5 px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isSaving}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveDetailModal}
                                disabled={isSaving}
                                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}