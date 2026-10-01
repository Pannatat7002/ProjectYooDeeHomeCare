'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Phone, Clock, Trash2, ChevronLeft, ChevronRight,
    Search, SlidersHorizontal, RefreshCw, X, ChevronDown, CheckCircle2,
    Clock3, XCircle, Eye
} from 'lucide-react';
import { Consultation } from '@/src/types';
import { fetchWithAuth } from '../../../../lib/auth-client';

type ColumnKey = 'index' | 'contact' | 'recipient' | 'service' | 'message' | 'status' | 'actions';

interface ColumnConfig {
    key: ColumnKey;
    label: string;
    canHide: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
    { key: 'index', label: '#', canHide: false },
    { key: 'contact', label: 'ข้อมูลผู้ติดต่อ', canHide: false },
    { key: 'recipient', label: 'ข้อมูลผู้รับบริการ', canHide: true },
    { key: 'service', label: 'รายละเอียดบริการ', canHide: true },
    { key: 'message', label: 'ข้อความ/หมายเหตุ', canHide: true },
    { key: 'status', label: 'สถานะ', canHide: false },
    { key: 'actions', label: 'จัดการ', canHide: false },
];

export default function ConsultationManagement() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = '/api/care-centers/consultations';

    // --- Table Customization States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'followed_up' | 'closed'>('all');
    const [isWrapText, setIsWrapText] = useState(true); // Toggle ขึ้นบรรทัดใหม่
    const [isCompact, setIsCompact] = useState(false); // Toggle ความหนาแน่นตาราง
    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
        index: true,
        contact: true,
        recipient: true,
        service: true,
        message: true,
        status: true,
        actions: true,
    });

    // Modal ดูรายละเอียดเต็ม
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

    // โหลดการตั้งค่าคอลัมน์จาก localStorage
    useEffect(() => {
        const savedCols = localStorage.getItem('consultation_table_cols');
        if (savedCols) {
            try {
                setVisibleColumns(prev => ({ ...prev, ...JSON.parse(savedCols) }));
            } catch (e) {
                console.error(e);
            }
        }
        const savedWrap = localStorage.getItem('consultation_table_wrap');
        if (savedWrap !== null) {
            setIsWrapText(savedWrap === 'true');
        }
        const savedCompact = localStorage.getItem('consultation_table_compact');
        if (savedCompact !== null) {
            setIsCompact(savedCompact === 'true');
        }
    }, []);

    const toggleColumn = (key: ColumnKey) => {
        setVisibleColumns(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('consultation_table_cols', JSON.stringify(next));
            return next;
        });
    };

    const toggleWrap = () => {
        setIsWrapText(prev => {
            const next = !prev;
            localStorage.setItem('consultation_table_wrap', String(next));
            return next;
        });
    };

    const toggleCompact = () => {
        setIsCompact(prev => {
            const next = !prev;
            localStorage.setItem('consultation_table_compact', String(next));
            return next;
        });
    };

    const resetColumns = () => {
        const defaultCols: Record<ColumnKey, boolean> = {
            index: true,
            contact: true,
            recipient: true,
            service: true,
            message: true,
            status: true,
            actions: true,
        };
        setVisibleColumns(defaultCols);
        localStorage.setItem('consultation_table_cols', JSON.stringify(defaultCols));
    };

    // --- Fetch Data ---
    const fetchConsultations = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(API_URL);
            if (!res.ok) throw new Error('Failed to fetch consultations');

            const result: { data: Consultation[] } = await res.json();
            setConsultations(result.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนัดหมายนี้?')) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchConsultations();
                if (selectedConsultation?.id === id) {
                    setSelectedConsultation(null);
                }
            } else {
                alert('ลบรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    const handleUpdateStatus = async (consultation: Consultation, newStatus: string) => {
        const payload = { status: newStatus };
        try {
            const res = await fetchWithAuth(`${API_URL}/${consultation.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchConsultations();
                if (selectedConsultation?.id === consultation.id) {
                    setSelectedConsultation({ ...selectedConsultation, status: newStatus });
                }
            } else {
                alert('เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    // --- Filtering & Pagination ---
    const filteredConsultations = useMemo(() => {
        const q = (searchQuery || '').toLowerCase().trim();
        return (consultations || []).filter(item => {
            if (!item) return false;
            const matchSearch =
                q === '' ||
                ((item.name || '').toLowerCase().includes(q)) ||
                ((item.phone || '').includes(q)) ||
                ((item.branch || '').toLowerCase().includes(q)) ||
                ((item.recipientName || '').toLowerCase().includes(q)) ||
                ((item.message || '').toLowerCase().includes(q));

            const matchStatus =
                statusFilter === 'all' || (item.status || '').toLowerCase() === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [consultations, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage) || 1;
    const paginatedConsultations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredConsultations.slice(start, start + itemsPerPage);
    }, [filteredConsultations, currentPage, itemsPerPage]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const s = (status || '').toLowerCase();
        if (s === 'followed_up') {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ติดตามแล้ว
                </span>
            );
        }
        if (s === 'closed') {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                    <XCircle className="w-3 h-3 text-slate-500" />
                    ปิดเคส
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
                <Clock3 className="w-3 h-3 text-amber-600" />
                รอติดตาม
            </span>
        );
    };

    const activeColCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* 1. Custom Table Controls Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search & Status Filter */}
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, เบอร์โทร, ศูนย์, ข้อความ..."
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                        {(['all', 'pending', 'followed_up', 'closed'] as const).map(st => (
                            <button
                                key={st}
                                onClick={() => {
                                    setStatusFilter(st);
                                    setCurrentPage(1);
                                }}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    statusFilter === st
                                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {st === 'all' && 'ทั้งหมด'}
                                {st === 'pending' && 'รอติดตาม'}
                                {st === 'followed_up' && 'ติดตามแล้ว'}
                                {st === 'closed' && 'ปิดเคส'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Customization Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {/* Wrap text toggle button */}
                    <button
                        onClick={toggleWrap}
                        title={isWrapText ? 'กำลังตัดคำขึ้นบรรทัดใหม่ (คลิกเพื่อสลับเป็นย่อบรรทัดเดียว)' : 'กำลังย่อบรรทัดเดียว (คลิกเพื่อสลับเป็นตัดคำขึ้นบรรทัดใหม่)'}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                            isWrapText
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>{isWrapText ? 'ตัดคำขึ้นบรรทัดใหม่' : 'ย่อบรรทัดเดียว'}</span>
                    </button>

                    {/* Compact toggle */}
                    <button
                        onClick={toggleCompact}
                        title="ปรับระยะห่างของแถวในตาราง"
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                            isCompact
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {isCompact ? 'ตารางกะทัดรัด' : 'ตารางสบายตา'}
                    </button>

                    {/* Columns Dropdown Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setIsColumnMenuOpen(prev => !prev)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-all"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <span>คอลัมน์ ({activeColCount})</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {isColumnMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2 text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <span className="font-bold text-slate-800">เลือกคอลัมน์ที่แสดง</span>
                                    <button
                                        onClick={resetColumns}
                                        className="text-[11px] text-blue-600 hover:underline"
                                    >
                                        รีเซ็ต
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {ALL_COLUMNS.map(col => (
                                        <label
                                            key={col.key}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg select-none ${
                                                col.canHide
                                                    ? 'cursor-pointer hover:bg-slate-50'
                                                    : 'opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            <span className="text-slate-700 font-medium">{col.label}</span>
                                            <input
                                                type="checkbox"
                                                disabled={!col.canHide}
                                                checked={visibleColumns[col.key]}
                                                onChange={() => toggleColumn(col.key)}
                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetchConsultations}
                        title="รีเฟรชข้อมูล"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* 2. Main Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                {visibleColumns.index && (
                                    <th className="py-3 px-3 w-12 text-center whitespace-nowrap">#</th>
                                )}
                                {visibleColumns.contact && (
                                    <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">ข้อมูลผู้ติดต่อ</th>
                                )}
                                {visibleColumns.recipient && (
                                    <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">ผู้รับบริการ</th>
                                )}
                                {visibleColumns.service && (
                                    <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">บริการ & ศูนย์ที่สนใจ</th>
                                )}
                                {visibleColumns.message && (
                                    <th className="py-3 px-4 min-w-[200px] max-w-xs">
                                        ข้อความ / ความต้องการ
                                    </th>
                                )}
                                {visibleColumns.status && (
                                    <th className="py-3 px-4 w-32 text-center whitespace-nowrap">สถานะ</th>
                                )}
                                {visibleColumns.actions && (
                                    <th className="py-3 px-4 w-28 text-center whitespace-nowrap">จัดการ</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={activeColCount} className="py-12 text-center text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        กำลังโหลดข้อมูลนัดหมาย...
                                    </td>
                                </tr>
                            ) : paginatedConsultations.length === 0 ? (
                                <tr>
                                    <td colSpan={activeColCount} className="py-12 text-center text-slate-400">
                                        ไม่พบข้อมูลนัดหมายที่ตรงกับเงื่อนไข
                                    </td>
                                </tr>
                            ) : (
                                paginatedConsultations.map((item, index) => {
                                    const rowPad = isCompact ? 'py-2 px-3' : 'py-3.5 px-4';
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedConsultation(item)}
                                        >
                                            {/* 1. ลำดับ */}
                                            {visibleColumns.index && (
                                                <td className={`${rowPad} text-center font-mono text-xs text-slate-400 whitespace-nowrap`}>
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                            )}

                                            {/* 2. ข้อมูลผู้ติดต่อ (เบอร์โทรและวันที่เป็น whitespace-nowrap ป้องกันเลขแตกบรรทัด) */}
                                            {visibleColumns.contact && (
                                                <td className={`${rowPad}`}>
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-mono">{item.phone}</span>
                                                    </p>
                                                    {item.lineId && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 whitespace-nowrap mt-0.5">
                                                            <span className="text-[10px] font-bold px-1 rounded bg-emerald-100 text-emerald-800">LINE</span>
                                                            <span>{item.lineId}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 whitespace-nowrap">
                                                        <Clock className="w-3 h-3 shrink-0" />
                                                        <span>{formatDate(item.submittedAt)}</span>
                                                    </p>
                                                </td>
                                            )}

                                            {/* 3. ผู้รับบริการ */}
                                            {visibleColumns.recipient && (
                                                <td className={`${rowPad}`}>
                                                    {item.recipientName ? (
                                                        <div className={isWrapText ? 'break-words' : 'truncate max-w-[160px]'}>
                                                            <p className="font-semibold text-slate-700">{item.recipientName}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                อายุ {item.recipientAge || '-'} ปี
                                                                {item.relationshipToRecipient && ` • ${item.relationshipToRecipient}`}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* 4. บริการ & ศูนย์ที่สนใจ */}
                                            {visibleColumns.service && (
                                                <td className={`${rowPad}`}>
                                                    <p className={`font-semibold text-blue-600 ${isWrapText ? 'break-words' : 'truncate max-w-[180px]'}`}>
                                                        {item.branch || 'ไม่ได้ระบุศูนย์'}
                                                    </p>
                                                    <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
                                                        {item.budget && <p>งบประมาณ: {item.budget}</p>}
                                                        {item.roomType && <p>ห้อง: {item.roomType}</p>}
                                                        {item.convenientTime && <p>เวลา: {item.convenientTime}</p>}
                                                    </div>
                                                </td>
                                            )}

                                            {/* 5. ข้อความ / หมายเหตุ (คอลัมน์ที่รองรับการขึ้นบรรทัดใหม่ หรือ ย่อบรรทัดเดียว) */}
                                            {visibleColumns.message && (
                                                <td className={`${rowPad}`}>
                                                    {item.message ? (
                                                        <p
                                                            title={item.message}
                                                            className={`text-slate-600 text-xs ${
                                                                isWrapText
                                                                    ? 'break-words whitespace-normal max-w-xs leading-relaxed'
                                                                    : 'truncate max-w-[220px]'
                                                            }`}
                                                        >
                                                            {item.message}
                                                        </p>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">ไม่มีข้อความเพิ่มเติม</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* 6. สถานะ */}
                                            {visibleColumns.status && (
                                                <td className={`${rowPad} text-center whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                                                    <StatusBadge status={item.status} />
                                                    <div className="mt-1.5">
                                                        {item.status?.toLowerCase() === 'pending' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(item, 'followed_up')}
                                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline block mx-auto"
                                                            >
                                                                ทำเป็นติดตามแล้ว
                                                            </button>
                                                        )}
                                                        {item.status?.toLowerCase() === 'followed_up' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(item, 'closed')}
                                                                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium hover:underline block mx-auto"
                                                            >
                                                                ปิดเคส
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            {/* 7. จัดการ / ลบ / ดูรายละเอียด */}
                                            {visibleColumns.actions && (
                                                <td className={`${rowPad} text-center whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => setSelectedConsultation(item)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="ดูรายละเอียดฉบับเต็ม"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="ลบรายการ"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Summary Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 gap-2">
                    <div>
                        แสดง <span className="font-semibold text-slate-800">{paginatedConsultations.length}</span> จากทั้งหมด{' '}
                        <span className="font-semibold text-slate-800">{filteredConsultations.length}</span> รายการ
                        {filteredConsultations.length !== consultations.length && (
                            <span className="text-slate-400 ml-1">(กรองจาก {consultations.length} รายการ)</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                            หน้า {currentPage} / {totalPages}
                        </span>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-700" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detail Modal (คลิกแถวหรือคลิกปุ่มไอคอนรูปตาเพื่อดูรายละเอียดฉบับเต็มอย่างสบายตา) */}
            {selectedConsultation && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    รายละเอียดการนัดหมาย #{selectedConsultation.id}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    ส่งเมื่อ {formatDate(selectedConsultation.submittedAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedConsultation(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-3 text-xs sm:text-sm">
                            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ข้อมูลผู้ติดต่อ</p>
                                <p className="font-bold text-slate-800 text-sm">{selectedConsultation.name}</p>
                                <p className="text-slate-600 font-mono">โทร: {selectedConsultation.phone}</p>
                                {selectedConsultation.email && <p className="text-slate-600">อีเมล: {selectedConsultation.email}</p>}
                                {selectedConsultation.lineId && <p className="text-slate-600">LINE ID: {selectedConsultation.lineId}</p>}
                            </div>

                            {(selectedConsultation.recipientName || selectedConsultation.recipientAge) && (
                                <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ข้อมูลผู้รับบริการ</p>
                                    <p className="font-semibold text-slate-800">ชื่อ: {selectedConsultation.recipientName || '-'}</p>
                                    <p className="text-slate-600">อายุ: {selectedConsultation.recipientAge || '-'} ปี</p>
                                    <p className="text-slate-600">ความสัมพันธ์: {selectedConsultation.relationshipToRecipient || '-'}</p>
                                </div>
                            )}

                            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">บริการที่สนใจ</p>
                                <p className="font-semibold text-blue-600">ศูนย์: {selectedConsultation.branch || '-'}</p>
                                <p className="text-slate-600">งบประมาณ: {selectedConsultation.budget || '-'}</p>
                                <p className="text-slate-600">ประเภทห้อง: {selectedConsultation.roomType || '-'}</p>
                                <p className="text-slate-600">ช่วงเวลาสะดวก: {selectedConsultation.convenientTime || '-'}</p>
                            </div>

                            {selectedConsultation.message && (
                                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">ข้อความ / ความต้องการ</p>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedConsultation.message}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">สถานะ:</span>
                                    <StatusBadge status={selectedConsultation.status} />
                                </div>
                                <div className="flex gap-2">
                                    {selectedConsultation.status?.toLowerCase() === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedConsultation, 'followed_up')}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
                                        >
                                            ทำเป็นติดตามแล้ว
                                        </button>
                                    )}
                                    {selectedConsultation.status?.toLowerCase() === 'followed_up' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedConsultation, 'closed')}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all shadow-xs"
                                        >
                                            ปิดเคส
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
