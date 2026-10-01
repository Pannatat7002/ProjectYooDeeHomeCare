'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Mail, Phone, Clock, Trash2, ChevronLeft, ChevronRight,
    Search, SlidersHorizontal, RefreshCw, X, ChevronDown, CheckCircle2,
    Eye, MessageSquare
} from 'lucide-react';
import { ContactMessage } from '@/src/types';
import { fetchWithAuth } from '../../../../lib/auth-client';

type ColumnKey = 'index' | 'sender' | 'subject' | 'message' | 'status' | 'actions';

interface ColumnConfig {
    key: ColumnKey;
    label: string;
    canHide: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
    { key: 'index', label: '#', canHide: false },
    { key: 'sender', label: 'ผู้ส่ง / ช่องทางติดต่อ', canHide: false },
    { key: 'subject', label: 'หัวข้อข้อความ', canHide: true },
    { key: 'message', label: 'เนื้อหาข้อความ', canHide: true },
    { key: 'status', label: 'สถานะ', canHide: false },
    { key: 'actions', label: 'จัดการ', canHide: false },
];

export default function ContactMessageManagement() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = '/api/contact';

    // --- Table Customization States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
    const [isWrapText, setIsWrapText] = useState(true);
    const [isCompact, setIsCompact] = useState(false);
    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
        index: true,
        sender: true,
        subject: true,
        message: true,
        status: true,
        actions: true,
    });

    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    // โหลดการตั้งค่าจาก localStorage
    useEffect(() => {
        const savedCols = localStorage.getItem('contact_table_cols');
        if (savedCols) {
            try {
                setVisibleColumns(prev => ({ ...prev, ...JSON.parse(savedCols) }));
            } catch (e) {
                console.error(e);
            }
        }
        const savedWrap = localStorage.getItem('contact_table_wrap');
        if (savedWrap !== null) {
            setIsWrapText(savedWrap === 'true');
        }
        const savedCompact = localStorage.getItem('contact_table_compact');
        if (savedCompact !== null) {
            setIsCompact(savedCompact === 'true');
        }
    }, []);

    const toggleColumn = (key: ColumnKey) => {
        setVisibleColumns(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('contact_table_cols', JSON.stringify(next));
            return next;
        });
    };

    const toggleWrap = () => {
        setIsWrapText(prev => {
            const next = !prev;
            localStorage.setItem('contact_table_wrap', String(next));
            return next;
        });
    };

    const toggleCompact = () => {
        setIsCompact(prev => {
            const next = !prev;
            localStorage.setItem('contact_table_compact', String(next));
            return next;
        });
    };

    const resetColumns = () => {
        const defaultCols: Record<ColumnKey, boolean> = {
            index: true,
            sender: true,
            subject: true,
            message: true,
            status: true,
            actions: true,
        };
        setVisibleColumns(defaultCols);
        localStorage.setItem('contact_table_cols', JSON.stringify(defaultCols));
    };

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(API_URL);
            if (!res.ok) throw new Error('Failed to fetch messages');

            const result: { data: ContactMessage[] } = await res.json();
            setMessages(result.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('Fetch error:', error);
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
            const res = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMessages();
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }
            } else {
                alert('ลบข้อความไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    const handleUpdateStatus = async (message: ContactMessage, newStatus: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/${message.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchMessages();
                if (selectedMessage?.id === message.id) {
                    setSelectedMessage({ ...selectedMessage, status: newStatus });
                }
            } else {
                alert('อัปเดตสถานะไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    const filteredMessages = useMemo(() => {
        const q = (searchQuery || '').toLowerCase().trim();
        return (messages || []).filter(item => {
            if (!item) return false;
            const matchSearch =
                q === '' ||
                ((item.name || '').toLowerCase().includes(q)) ||
                ((item.email || '').toLowerCase().includes(q)) ||
                ((item.phone || '').includes(q)) ||
                ((item.subject || '').toLowerCase().includes(q)) ||
                ((item.message || '').toLowerCase().includes(q));

            const matchStatus =
                statusFilter === 'all' || (item.status || '').toLowerCase() === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [messages, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1;
    const paginatedMessages = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMessages.slice(start, start + itemsPerPage);
    }, [filteredMessages, currentPage, itemsPerPage]);

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
        if (s === 'read') {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                    อ่านแล้ว
                </span>
            );
        }
        if (s === 'replied') {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ตอบกลับแล้ว
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
                <Mail className="w-3 h-3 text-blue-600" />
                ข้อความใหม่
            </span>
        );
    };

    const activeColCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* 1. Custom Table Controls Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search & Filter */}
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล, หัวข้อ..."
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                        {(['all', 'new', 'read', 'replied'] as const).map(st => (
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
                                {st === 'new' && 'ใหม่'}
                                {st === 'read' && 'อ่านแล้ว'}
                                {st === 'replied' && 'ตอบกลับแล้ว'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Customization Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                        onClick={toggleWrap}
                        title={isWrapText ? 'กำลังตัดคำขึ้นบรรทัดใหม่ (คลิกเพื่อย่อบรรทัดเดียว)' : 'กำลังย่อบรรทัดเดียว (คลิกเพื่อตัดคำขึ้นบรรทัดใหม่)'}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                            isWrapText
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>{isWrapText ? 'ตัดคำขึ้นบรรทัดใหม่' : 'ย่อบรรทัดเดียว'}</span>
                    </button>

                    <button
                        onClick={toggleCompact}
                        title="ปรับความกระชับของแถวในตาราง"
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                            isCompact
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {isCompact ? 'ตารางกะทัดรัด' : 'ตารางสบายตา'}
                    </button>

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
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2 text-xs">
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

                    <button
                        onClick={fetchMessages}
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
                                {visibleColumns.sender && (
                                    <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">ผู้ส่ง / ติดต่อ</th>
                                )}
                                {visibleColumns.subject && (
                                    <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">หัวข้อ</th>
                                )}
                                {visibleColumns.message && (
                                    <th className="py-3 px-4 min-w-[200px] max-w-xs">
                                        เนื้อหาข้อความ
                                    </th>
                                )}
                                {visibleColumns.status && (
                                    <th className="py-3 px-4 w-28 text-center whitespace-nowrap">สถานะ</th>
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
                                        กำลังโหลดข้อความ...
                                    </td>
                                </tr>
                            ) : paginatedMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={activeColCount} className="py-12 text-center text-slate-400">
                                        ไม่พบข้อความที่ตรงกับเงื่อนไข
                                    </td>
                                </tr>
                            ) : (
                                paginatedMessages.map((msg, index) => {
                                    const rowPad = isCompact ? 'py-2 px-3' : 'py-3.5 px-4';
                                    return (
                                        <tr
                                            key={msg.id}
                                            className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedMessage(msg)}
                                        >
                                            {visibleColumns.index && (
                                                <td className={`${rowPad} text-center font-mono text-xs text-slate-400 whitespace-nowrap`}>
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                            )}

                                            {visibleColumns.sender && (
                                                <td className={`${rowPad}`}>
                                                    <p className="font-bold text-slate-800">{msg.name}</p>
                                                    {msg.email && (
                                                        <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                                                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span>{msg.email}</span>
                                                        </p>
                                                    )}
                                                    {msg.phone && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 whitespace-nowrap mt-0.5">
                                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span className="font-mono">{msg.phone}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 whitespace-nowrap">
                                                        <Clock className="w-3 h-3 shrink-0" />
                                                        <span>{formatDate(msg.submittedAt)}</span>
                                                    </p>
                                                </td>
                                            )}

                                            {visibleColumns.subject && (
                                                <td className={`${rowPad}`}>
                                                    <p className={`font-semibold text-slate-800 ${isWrapText ? 'break-words' : 'truncate max-w-[160px]'}`}>
                                                        {msg.subject || 'ไม่มีหัวข้อ'}
                                                    </p>
                                                </td>
                                            )}

                                            {visibleColumns.message && (
                                                <td className={`${rowPad}`}>
                                                    <p
                                                        title={msg.message}
                                                        className={`text-slate-600 text-xs ${
                                                            isWrapText
                                                                ? 'break-words whitespace-normal max-w-xs leading-relaxed'
                                                                : 'truncate max-w-[240px]'
                                                        }`}
                                                    >
                                                        {msg.message}
                                                    </p>
                                                </td>
                                            )}

                                            {visibleColumns.status && (
                                                <td className={`${rowPad} text-center whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                                                    <StatusBadge status={msg.status} />
                                                    <div className="mt-1.5">
                                                        {msg.status?.toLowerCase() === 'new' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(msg, 'read')}
                                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline block mx-auto"
                                                            >
                                                                ทำเป็นอ่านแล้ว
                                                            </button>
                                                        )}
                                                        {msg.status?.toLowerCase() === 'read' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(msg, 'replied')}
                                                                className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium hover:underline block mx-auto"
                                                            >
                                                                ทำเป็นตอบแล้ว
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.actions && (
                                                <td className={`${rowPad} text-center whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => setSelectedMessage(msg)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="ดูข้อความฉบับเต็ม"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(msg.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="ลบข้อความ"
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

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 gap-2">
                    <div>
                        แสดง <span className="font-semibold text-slate-800">{paginatedMessages.length}</span> จากทั้งหมด{' '}
                        <span className="font-semibold text-slate-800">{filteredMessages.length}</span> ข้อความ
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

            {/* 3. Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {selectedMessage.subject || 'ข้อความติดต่อ'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    ส่งเมื่อ {formatDate(selectedMessage.submittedAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm">
                            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ข้อมูลผู้ส่ง</p>
                                <p className="font-bold text-slate-800 text-sm">{selectedMessage.name}</p>
                                {selectedMessage.email && <p className="text-slate-600">อีเมล: {selectedMessage.email}</p>}
                                {selectedMessage.phone && <p className="text-slate-600 font-mono">โทร: {selectedMessage.phone}</p>}
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">เนื้อหาข้อความ</p>
                                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">สถานะ:</span>
                                    <StatusBadge status={selectedMessage.status} />
                                </div>
                                <div className="flex gap-2">
                                    {selectedMessage.status?.toLowerCase() === 'new' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedMessage, 'read')}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
                                        >
                                            ทำเป็นอ่านแล้ว
                                        </button>
                                    )}
                                    {selectedMessage.status?.toLowerCase() === 'read' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedMessage, 'replied')}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs"
                                        >
                                            ทำเป็นตอบแล้ว
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
