// /* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { LogOut, Shield, User as UserIcon } from 'lucide-react';
// import ManageAdminPage from './components/ManageAdminPage';
// import ManageCenterPage from './components/ManageCenterPage';
// import ConsultationManagement from './components/ConsultationManagement';
// import ContactMessageManagement from './components/ContactMessageManagement';
// import ManageBlogPage from './components/ManageBlogPage';

// // Helper function สำหรับ fetch ที่มี authentication
// const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//         throw new Error('No authentication token found');
//     }

//     const headers = {
//         ...options.headers,
//         'Authorization': `Bearer ${token}`,
//     };

//     const response = await fetch(url, { ...options, headers });

//     // ถ้า token หมดอายุหรือไม่ถูกต้อง
//     if (response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('admin');
//         window.location.href = '/login';
//         throw new Error('Authentication failed');
//     }

//     return response;
// };

// export default function AdminManagePage() {
//     const router = useRouter();
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [currentAdmin, setCurrentAdmin] = useState<any>(null);
//     const [activeTab, setActiveTab] = useState<'centers' | 'consultations' | 'contacts' | 'blogs' | 'admins'>('centers');

//     // ตรวจสอบ authentication
//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const adminData = localStorage.getItem('admin');

//         if (!token || !adminData) {
//             router.push('/login');
//             return;
//         }

//         try {
//             const admin = JSON.parse(adminData);
//             setCurrentAdmin(admin);
//             setIsAuthenticated(true);
//         } catch (error) {
//             console.error('Invalid admin data:', error);
//             router.push('/login');
//         }
//     }, [router]);

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('admin');
//         router.push('/login');
//     };

//     if (!isAuthenticated) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header with Admin Info */}
//             <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center h-16">
//                         <div className="flex items-center space-x-4">
//                             <Shield className="w-8 h-8 text-blue-600" />
//                             <div>
//                                 <h1 className="text-xl font-bold text-gray-900">
//                                     Admin Panel
//                                 </h1>
//                                 <p className="text-xs text-gray-500">
//                                     YooDee HomeCare Management
//                                 </p>
//                             </div>
//                         </div>

//                         {/* {currentAdmin && (
//                             <div className="flex items-center space-x-4">
//                                 <div className="text-right">
//                                     <p className="text-sm font-semibold text-gray-900">
//                                         {currentAdmin.fullName}
//                                     </p>
//                                     <p className="text-xs text-gray-500 flex items-center justify-end">
//                                         <UserIcon className="w-3 h-3 mr-1" />
//                                         {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={handleLogout}
//                                     className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
//                                 >
//                                     <LogOut className="w-4 h-4" />
//                                     <span className="text-sm font-medium">ออกจากระบบ</span>
//                                 </button>
//                             </div>
//                         )} */}
//                     </div>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="bg-white border-b border-gray-200">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <nav className="flex space-x-8" aria-label="Tabs">
//                         {[
//                             { id: 'centers', label: 'ศูนย์ดูแล' },
//                             { id: 'consultations', label: 'คำปรึกษา' },
//                             { id: 'contacts', label: 'ข้อความติดต่อ' },
//                             { id: 'blogs', label: 'บทความ' },
//                             ...(currentAdmin?.role === 'super_admin' ? [{ id: 'admins', label: 'จัดการ Admin' }] : []),
//                         ].map((tab) => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => setActiveTab(tab.id as any)}
//                                 className={`
//                                     py-4 px-1 border-b-2 font-medium text-sm transition-colors
//                                     ${activeTab === tab.id
//                                         ? 'border-blue-600 text-blue-600'
//                                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                                     }
//                                 `}
//                             >
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </nav>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {activeTab === 'centers' && <ManageCenterPage />}
//                 {activeTab === 'consultations' && <ConsultationManagement />}
//                 {activeTab === 'contacts' && <ContactMessageManagement />}
//                 {activeTab === 'blogs' && <ManageBlogPage />}
//                 {activeTab === 'admins' && currentAdmin?.role === 'super_admin' && <ManageAdminPage />}
//             </div>
//         </div>
//     );
// }

// // ส่งออก fetchWithAuth เพื่อให้ components อื่นใช้งาน
// export { fetchWithAuth };
