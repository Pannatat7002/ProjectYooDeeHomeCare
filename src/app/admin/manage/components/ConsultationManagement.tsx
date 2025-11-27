'use client';

import { useState, useEffect } from 'react';
import {
    User, Phone, Mail, MessageSquare, Clock, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Consultation } from '@/src/types';
import { fetchWithAuth } from '../../../../lib/auth-client';

export default function ConsultationManagement() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const API_URL = '/api/care-centers/consultations';

    const fetchConsultations = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(API_URL);
            if (!res.ok) throw new Error('Failed to fetch consultations');

            const result: { data: Consultation[] } = await res.json();
            setConsultations(result.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error('Fetch error:', error);
            // alert('ไม่สามารถโหลดข้อมูล Consultations ได้');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการติดต่อนี้?')) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
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
            const res = await fetchWithAuth(`${API_URL}/${consultation.id}`, {
                method: 'PUT',
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
