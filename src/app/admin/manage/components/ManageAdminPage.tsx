'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, FilePenLine, X, Save, Shield, UserX, UserCheck } from 'lucide-react';

// Helper function สำหรับ fetch ที่มี authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        window.location.href = '/login';
        throw new Error('Authentication failed');
    }

    return response;
};

interface Admin {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'super_admin' | 'admin';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

export default function ManageAdminPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        role: 'admin' as 'admin' | 'super_admin',
        isActive: true,
    });

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWithAuth('/api/auth/admins');
            const data = await response.json();

            if (data.success) {
                setAdmins(data.data);
            } else {
                alert('ไม่สามารถโหลดข้อมูล Admin ได้');
            }
        } catch (error) {
            console.error('Fetch admins error:', error);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const openModal = (admin?: Admin) => {
        if (admin) {
            setEditingId(admin.id);
            setFormData({
                username: admin.username,
                password: '', // ไม่แสดงรหัสผ่านเดิม
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                isActive: admin.isActive,
            });
        } else {
            setEditingId(null);
            setFormData({
                username: '',
                password: '',
                email: '',
                fullName: '',
                role: 'admin',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId ? `/api/auth/admins/${editingId}` : '/api/auth/admins';
            const method = editingId ? 'PUT' : 'POST';

            // ถ้าเป็นการแก้ไขและไม่ได้เปลี่ยนรหัสผ่าน ไม่ต้องส่ง password
            const payload = editingId && !formData.password
                ? { ...formData, password: undefined }
                : formData;

            const response = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message || 'บันทึกข้อมูลสำเร็จ');
                closeModal();
                fetchAdmins();
            } else {
                alert(data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Admin นี้?')) return;

        try {
            const response = await fetchWithAuth(`/api/auth/admins/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert('ลบ Admin สำเร็จ');
                fetchAdmins();
            } else {
                alert(data.message || 'ลบไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    const toggleActive = async (admin: Admin) => {
        try {
            const response = await fetchWithAuth(`/api/auth/admins/${admin.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !admin.isActive }),
            });

            const data = await response.json();

            if (data.success) {
                fetchAdmins();
            } else {
                alert(data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Toggle active error:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

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

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Shield className="w-6 h-6 mr-2 text-blue-600" />
                        จัดการผู้ดูแลระบบ (Admin)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        สร้าง แก้ไข และจัดการบัญชี Admin (เฉพาะ Super Admin)
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    เพิ่ม Admin ใหม่
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-600 text-white text-sm font-semibold">
                                <th className="py-4 px-4 w-16 text-center">#</th>
                                <th className="py-4 px-4">ชื่อผู้ใช้</th>
                                <th className="py-4 px-4">ชื่อ-นามสกุล</th>
                                <th className="py-4 px-4">อีเมล</th>
                                <th className="py-4 px-4">บทบาท</th>
                                <th className="py-4 px-4">สถานะ</th>
                                <th className="py-4 px-4">Login ล่าสุด</th>
                                <th className="py-4 px-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-gray-500">
                                        กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-gray-500">
                                        ไม่พบข้อมูล Admin
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin, index) => (
                                    <tr key={admin.id} className="hover:bg-blue-50 text-sm transition-colors">
                                        <td className="py-3 px-4 text-center">{index + 1}</td>
                                        <td className="py-3 px-4 font-semibold">{admin.username}</td>
                                        <td className="py-3 px-4">{admin.fullName}</td>
                                        <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${admin.role === 'super_admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => toggleActive(admin)}
                                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${admin.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {admin.isActive ? (
                                                    <>
                                                        <UserCheck className="w-3 h-3" />
                                                        <span>ใช้งาน</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserX className="w-3 h-3" />
                                                        <span>ระงับ</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-xs">
                                            {admin.lastLogin ? formatDate(admin.lastLogin) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center space-x-2">
                                            <button
                                                onClick={() => openModal(admin)}
                                                className="text-blue-600 hover:text-blue-800 inline-block"
                                            >
                                                <FilePenLine className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="text-red-600 hover:text-red-800 inline-block"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingId ? 'แก้ไขข้อมูล Admin' : 'เพิ่ม Admin ใหม่'}
                                </h2>
                                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ชื่อผู้ใช้ *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            disabled={!!editingId}
                                        />
                                        {editingId && (
                                            <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รหัสผ่าน {!editingId && '*'}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingId}
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={editingId ? 'เว้นว่างหากไม่ต้องการเปลี่ยน' : ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อ-นามสกุล *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        อีเมล *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            บทบาท *
                                        </label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.role}
                                            onChange={(e) =>
                                                setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })
                                            }
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            สถานะ
                                        </label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2"
                                            value={formData.isActive ? 'active' : 'inactive'}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isActive: e.target.value === 'active' })
                                            }
                                        >
                                            <option value="active">ใช้งาน</option>
                                            <option value="inactive">ระงับ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
