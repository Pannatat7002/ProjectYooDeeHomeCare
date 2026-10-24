'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Trash2,
    FilePenLine,
    X,
    Save,
    Shield,
    UserX,
    UserCheck,
    Search,
    Award,
    Sparkles,
    UserCheck2,
    BadgePercent
} from 'lucide-react';
import { fetchWithAuth } from '../../../../lib/auth-client';

export type AdminRole = 'super_admin' | 'admin' | 'care_advisor';

interface Admin {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: AdminRole;
    isActive: boolean;
    defaultIncentiveRate?: number;
    createdAt: string;
    lastLogin?: string;
}

export default function ManageAdminPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | AdminRole>('all');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        role: 'admin' as AdminRole,
        defaultIncentiveRate: 15,
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
                alert('ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้');
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
                defaultIncentiveRate: admin.defaultIncentiveRate ?? 15,
                isActive: admin.isActive,
            });
        } else {
            setEditingId(null);
            setFormData({
                username: '',
                password: '',
                email: '',
                fullName: '',
                role: selectedRoleFilter !== 'all' ? selectedRoleFilter : 'care_advisor',
                defaultIncentiveRate: 15,
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
            const payload: any = {
                ...formData,
                defaultIncentiveRate: formData.role === 'care_advisor' ? Number(formData.defaultIncentiveRate) || 15 : undefined,
            };

            if (editingId && !formData.password) {
                delete payload.password;
            }

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
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้ออกจากระบบ?')) return;

        try {
            const response = await fetchWithAuth(`/api/auth/admins/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert('ลบผู้ดูแลระบบสำเร็จ');
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

    // Filter admins based on role and search query
    const filteredAdmins = useMemo(() => {
        return admins.filter((admin) => {
            const matchesRole =
                selectedRoleFilter === 'all' || admin.role === selectedRoleFilter;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                admin.username.toLowerCase().includes(q) ||
                admin.fullName.toLowerCase().includes(q) ||
                admin.email.toLowerCase().includes(q);
            return matchesRole && matchesSearch;
        });
    }, [admins, selectedRoleFilter, searchQuery]);

    const roleCounts = useMemo(() => {
        return {
            all: admins.length,
            care_advisor: admins.filter((a) => a.role === 'care_advisor').length,
            admin: admins.filter((a) => a.role === 'admin').length,
            super_admin: admins.filter((a) => a.role === 'super_admin').length,
        };
    }, [admins]);

    return (
        <div className="space-y-6">
            {/* Header & Stats Banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center tracking-tight">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mr-3 border border-blue-100">
                            <Shield className="w-6 h-6" />
                        </div>
                        จัดการทีมผู้ดูแลและ Care Advisor
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        สร้างและกำหนดสิทธิ์การใช้งานระบบ ทั้ง Super Admin, Admin ทั่วไป และ Care Advisor (ดูแล Lead & รับค่าคอม)
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-xs transition-colors shrink-0 text-sm active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    เพิ่มผู้ใช้งานใหม่
                </button>
            </div>

            {/* Role Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-semibold">
                    <button
                        onClick={() => setSelectedRoleFilter('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedRoleFilter === 'all'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span>ทั้งหมด</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-200/70 text-[10px]">
                            {roleCounts.all}
                        </span>
                    </button>

                    <button
                        onClick={() => setSelectedRoleFilter('care_advisor')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedRoleFilter === 'care_advisor'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                    >
                        <Award className="w-3.5 h-3.5" />
                        <span>Care Advisor</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                selectedRoleFilter === 'care_advisor'
                                    ? 'bg-emerald-700 text-emerald-100'
                                    : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                            {roleCounts.care_advisor}
                        </span>
                    </button>

                    <button
                        onClick={() => setSelectedRoleFilter('admin')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedRoleFilter === 'admin'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-blue-700 hover:bg-blue-50'
                        }`}
                    >
                        <span>Admin ทั่วไป</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                selectedRoleFilter === 'admin'
                                    ? 'bg-blue-700 text-blue-100'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                            {roleCounts.admin}
                        </span>
                    </button>

                    <button
                        onClick={() => setSelectedRoleFilter('super_admin')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedRoleFilter === 'super_admin'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-purple-700 hover:bg-purple-50'
                        }`}
                    >
                        <span>Super Admin</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                selectedRoleFilter === 'super_admin'
                                    ? 'bg-purple-700 text-purple-100'
                                    : 'bg-purple-100 text-purple-800'
                            }`}
                        >
                            {roleCounts.super_admin}
                        </span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อ, Username, อีเมล..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-3.5 px-4 w-14 text-center">#</th>
                                <th className="py-3.5 px-4">ผู้ใช้งาน</th>
                                <th className="py-3.5 px-4">อีเมล</th>
                                <th className="py-3.5 px-4">บทบาทหน้าที่</th>
                                <th className="py-3.5 px-4 text-center">สถานะ</th>
                                <th className="py-3.5 px-4 text-center">Login ล่าสุด</th>
                                <th className="py-3.5 px-4 text-center w-28">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                                        กำลังโหลดข้อมูลทีมงาน...
                                    </td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                                        ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin, index) => (
                                    <tr key={admin.id} className="hover:bg-slate-50/70 text-sm transition-colors">
                                        <td className="py-3 px-4 text-center text-slate-400 text-xs font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        admin.role === 'care_advisor'
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                            : admin.role === 'super_admin'
                                                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}
                                                >
                                                    {admin.fullName
                                                        ? admin.fullName.charAt(0).toUpperCase()
                                                        : admin.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {admin.fullName || admin.username}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-mono">
                                                        @{admin.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 text-xs">
                                            {admin.email}
                                        </td>
                                        <td className="py-3 px-4">
                                            {admin.role === 'care_advisor' ? (
                                                <div className="inline-flex flex-col gap-1 items-start">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        <Award className="w-3 h-3 text-emerald-600" />
                                                        Care Advisor (Lead)
                                                    </span>
                                                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pl-1">
                                                        <BadgePercent className="w-3 h-3" />
                                                        Incentive {admin.defaultIncentiveRate ?? 15}%
                                                    </span>
                                                </div>
                                            ) : admin.role === 'super_admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                                    Super Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <UserCheck2 className="w-3 h-3 text-blue-500" />
                                                    Admin ทั่วไป
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => toggleActive(admin)}
                                                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                    admin.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                }`}
                                            >
                                                {admin.isActive ? (
                                                    <>
                                                        <UserCheck className="w-3 h-3 text-emerald-600" />
                                                        <span>ใช้งาน</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserX className="w-3 h-3 text-rose-600" />
                                                        <span>ระงับ</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-500 text-xs">
                                            {admin.lastLogin ? formatDate(admin.lastLogin) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center space-x-1">
                                            <button
                                                onClick={() => openModal(admin)}
                                                title="แก้ไขข้อมูล"
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block cursor-pointer"
                                            >
                                                <FilePenLine className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                title="ลบผู้ใช้"
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto border border-slate-100">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {editingId ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานระบบใหม่'}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            ชื่อผู้ใช้ (Username) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            disabled={!!editingId}
                                            placeholder="advisor_alice"
                                        />
                                        {editingId && (
                                            <p className="text-[11px] text-slate-400 mt-1">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            รหัสผ่าน {!editingId && '*'}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingId}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={editingId ? 'เว้นว่างหากไม่ต้องการเปลี่ยน' : 'กำหนดรหัสผ่าน'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        ชื่อ-นามสกุล *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="คุณอลิส แคร์แอดไวเซอร์"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        อีเมล *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="alice@thaicarecenter.com"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            บทบาทหน้าที่ (Role) *
                                        </label>
                                        <select
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                            value={formData.role}
                                            onChange={(e) =>
                                                setFormData({ ...formData, role: e.target.value as AdminRole })
                                            }
                                        >
                                            <option value="care_advisor">Care Advisor (ที่ปรึกษา / ปิดเคส Lead)</option>
                                            <option value="admin">Admin (ผู้ดูแลระบบทั่วไป)</option>
                                            <option value="super_admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            สถานะการใช้งาน
                                        </label>
                                        <select
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                            value={formData.isActive ? 'active' : 'inactive'}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isActive: e.target.value === 'active' })
                                            }
                                        >
                                            <option value="active">ใช้งานปกติ (Active)</option>
                                            <option value="inactive">ระงับการเข้าใช้ (Inactive)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Custom Incentive Rate for Care Advisor */}
                                {formData.role === 'care_advisor' && (
                                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                                        <label className="block text-xs font-bold text-emerald-900">
                                            อัตราส่วนแบ่ง Incentive เริ่มต้น (%) *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="100"
                                                required
                                                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-800 pr-8 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                                value={formData.defaultIncentiveRate}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        defaultIncentiveRate: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                                placeholder="15"
                                            />
                                            <span className="absolute right-3 top-2.5 text-emerald-600 font-bold text-xs">
                                                %
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                                            💡 เปอร์เซ็นต์ส่วนแบ่งค่าคอมมิชชันที่ระบบจะใช้คิดคำนวณ Incentive ให้ Care Advisor ท่านนี้โดยอัตโนมัติเมื่อทำการบันทึกปิดเคสผู้สูงอายุ (ค่ามาตรฐาน 15%)
                                        </p>
                                    </div>
                                )}

                                {/* Role Guide Alert */}
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                                    <p className="font-semibold text-slate-700">คำอธิบายสิทธิ์การใช้งาน:</p>
                                    {formData.role === 'care_advisor' && (
                                        <p>
                                            <span className="font-semibold text-emerald-700">Care Advisor:</span> รับมอบหมายเคส Lead จากเว็บ, ติดต่อครอบครัวผู้สูงอายุ, ประสานงานศูนย์, ปิดการขายแพ็กเกจ และดูรายงานสรุป Incentive ค่าคอมมิชชันประจำเดือน
                                        </p>
                                    )}
                                    {formData.role === 'admin' && (
                                        <p>
                                            <span className="font-semibold text-blue-700">Admin ทั่วไป:</span> สามารถจัดการข้อมูลศูนย์ดูแลผู้สูงอายุ, เขียนบทความ, จัดการป้ายโฆษณา และตรวจสอบเคสนัดหมายทั้งหมด
                                        </p>
                                    )}
                                    {formData.role === 'super_admin' && (
                                        <p>
                                            <span className="font-semibold text-purple-700">Super Admin:</span> สิทธิ์สูงสุดในระบบ เข้าถึงได้ทุกฟังก์ชัน รวมถึงการเพิ่ม แก้ไข ลบผู้ดูแลระบบและกำหนดสิทธิ์
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-2.5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center cursor-pointer"
                                >
                                    <Save className="w-4 h-4 mr-1.5" />
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
