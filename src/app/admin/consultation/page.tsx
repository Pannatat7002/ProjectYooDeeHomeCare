'use client';

import { useState, useEffect } from 'react';
import { Trash2, Phone, Mail, User, Clock, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

// กำหนด Type สำหรับข้อมูล Consultation ตาม Response จริง
interface Consultation {
    id: number;
    name: string;
    phone: string;
    lineId: string;
    email: string;
    roomType: 'ห้องพักรวม' | 'single' | 'private' | string; // ปรับตามข้อมูลจริง
    branch: string; // ชื่อศูนย์ที่ลูกค้าสนใจ
    budget: 'ต่ำกว่า 15,000' | 'low' | 'medium' | 'high' | string; // ปรับตามข้อมูลจริง
    convenientTime: 'ช่วงเช้า (9:00 - 12:00)' | 'morning' | 'afternoon' | 'evening' | string; // ปรับตามข้อมูลจริง
    message: string;
    status: 'pending' | 'followed_up' | 'closed' | string; // ใช้ status จาก API แทน isFollowedUp
    submittedAt: string;
}

const API_URL = 'http://localhost:3001/api/care-centers/consultations';

export default function ConsultationManagement() {
    // --- State ---
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Fetch Data ---
    const fetchConsultations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to fetch consultations');

            const result: { data: Consultation[] } = await res.json();

            // เรียงข้อมูลล่าสุดขึ้นก่อน (ใช้ ID ที่เป็น timestamp)
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

    // --- Handlers ---

    // Handler สำหรับการลบ (ต้องมี API endpoint DELETE)
    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการติดต่อนี้?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            // สมมติว่าลบสำเร็จ (API ควรตอบกลับด้วย status 200/204)
            if (res.ok) {
                alert('ลบรายการสำเร็จ');
                fetchConsultations(); // โหลดข้อมูลใหม่
            } else {
                // API อาจไม่รองรับ method DELETE จึงแจ้งเตือนตามความเป็นจริง
                alert('ลบรายการไม่สำเร็จ (อาจต้องมีการตั้งค่า API DELETE เพิ่มเติม)');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    // Handler สำหรับการเปลี่ยนสถานะการติดตาม (สมมติว่าต้องการเปลี่ยน status ใน API)
    const handleUpdateStatus = async (consultation: Consultation, newStatus: string) => {
        const payload = { status: newStatus };

        try {
            const res = await fetch(`${API_URL}/${consultation.id}`, { // สมมติว่ามี PUT/PATCH endpoint
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`เปลี่ยนสถานะเป็น "${newStatus}" สำเร็จ`);
                fetchConsultations(); // โหลดข้อมูลใหม่
            } else {
                // API อาจไม่รองรับ method PUT/PATCH จึงแจ้งเตือนตามความเป็นจริง
                alert(`เปลี่ยนสถานะไม่สำเร็จ (ID: ${consultation.id} | สถานะ: ${newStatus})`);
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };


    // --- Render Helpers ---
    const totalPages = Math.ceil(consultations.length / itemsPerPage);
    const paginatedConsultations = consultations.slice(
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

    // ฟังก์ชันช่วยแสดงผลสำหรับ Status
    const StatusBadge = ({ status }: { status: string }) => {
        let text = status;
        let color = 'bg-gray-100 text-gray-700';

        switch (status.toLowerCase()) {
            case 'pending':
                text = 'รอติดตาม';
                color = 'bg-yellow-100 text-yellow-700';
                break;
            case 'followed_up':
                text = 'ติดตามแล้ว';
                color = 'bg-green-100 text-green-700';
                break;
            case 'closed':
                text = 'ปิดเคส';
                color = 'bg-red-100 text-red-700';
                break;
            case 'new':
                text = 'ใหม่';
                color = 'bg-blue-100 text-blue-700';
                break;
        }

        return (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${color}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 flex items-center">
                <User className="w-8 h-8 mr-3" />
                รายการผู้สนใจ/ผู้ปรึกษา (Consultations)
            </h1>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-indigo-600 text-white text-sm font-semibold border-b">
                                <th className="py-4 px-4 w-12 text-center">#</th>
                                <th className="py-4 px-4">ข้อมูลผู้ติดต่อ</th>
                                <th className="py-4 px-4">รายละเอียด</th>
                                <th className="py-4 px-4 max-w-sm">ข้อความ</th>
                                <th className="py-4 px-4 w-28 text-center">สถานะ</th>
                                <th className="py-4 px-4 w-20 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : paginatedConsultations.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">ไม่พบรายการติดต่อ</td></tr>
                            ) : (
                                paginatedConsultations.map((consultation, index) => (
                                    <tr key={consultation.id} className="hover:bg-indigo-50 text-sm text-gray-800 transition-colors">
                                        <td className="py-3 px-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="py-3 px-4 font-medium min-w-[200px]">
                                            <p className='font-bold'>{consultation.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Phone className='w-3 h-3 mr-1' /> {consultation.phone}
                                            </p>
                                            {consultation.email && (
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <Mail className='w-3 h-3 mr-1' /> {consultation.email}
                                                </p>
                                            )}
                                            {consultation.lineId && (
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <MessageSquare className='w-3 h-3 mr-1' /> LINE: {consultation.lineId}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 flex items-center mt-1">
                                                <Clock className='w-3 h-3 mr-1' /> ส่งเมื่อ: {formatDate(consultation.submittedAt)}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 min-w-[200px]">
                                            <p className="font-semibold text-indigo-600">ศูนย์: {consultation.branch}</p>
                                            <p className="text-xs text-gray-700">งบประมาณ: {consultation.budget}</p>
                                            <p className="text-xs text-gray-700">ประเภทห้อง: {consultation.roomType}</p>
                                            <p className="text-xs text-gray-700">เวลาสะดวก: {consultation.convenientTime}</p>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate text-gray-600" title={consultation.message}>{consultation.message}</td>

                                        <td className="py-3 px-4 text-center min-w-[120px]">
                                            <StatusBadge status={consultation.status} />
                                            {/* ปุ่มสำหรับเปลี่ยนสถานะ (Pending -> Followed Up) */}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600 bg-gray-50">
                        <span>แสดง {paginatedConsultations.length} รายการ จาก {consultations.length} รายการ | หน้า {currentPage} จาก {totalPages}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded-full hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-indigo-600" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded-full hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-indigo-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}