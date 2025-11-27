'use client';

import { useState, useEffect } from 'react';
import {
    Mail, Phone, Clock, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ContactMessage } from '@/src/types';
import { fetchWithAuth } from '../../../../lib/auth-client';

export default function ContactMessageManagement() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = '/api/contact';

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(API_URL);
            if (!res.ok) throw new Error('Failed to fetch messages');

            const result: { data: ContactMessage[] } = await res.json();
            setMessages(result.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('Fetch error:', error);
            // alert('ไม่สามารถโหลดข้อมูลข้อความได้');
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
                alert('ลบข้อความสำเร็จ');
                fetchMessages();
            } else {
                alert('ลบข้อความไม่สำเร็จ');
            }
        } catch (error) { console.error('Delete error:', error); alert('เกิดข้อผิดพลาดในการลบ'); }
    };

    const handleUpdateStatus = async (message: ContactMessage, newStatus: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/${message.id}`, {
                method: 'PUT',
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
