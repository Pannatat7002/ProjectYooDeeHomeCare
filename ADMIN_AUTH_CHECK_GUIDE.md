# 🔐 วิธีเพิ่ม Authentication Check ในหน้า Admin Manage

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. หน้า Login (`src/app/login/page.tsx`)
- ✅ ตรวจสอบ token เมื่อเข้าหน้า login
- ✅ ถ้ามี token อยู่แล้ว จะ redirect ไปหน้า `/admin/manage` อัตโนมัติ
- ✅ แสดง loading ขณะตรวจสอบ token

---

## 📝 สิ่งที่ต้องทำต่อ: เพิ่ม Authentication Check ในหน้า Admin Manage

เนื่องจากไฟล์ `src/app/admin/manage/page.tsx` มีขนาดใหญ่มาก (972 บรรทัด) ให้เพิ่มโค้ดดังนี้:

### ขั้นตอนที่ 1: เพิ่ม Import

ที่บรรทัดที่ 3-4 เพิ่ม `useRouter`:

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // เพิ่มบรรทัดนี้
```

### ขั้นตอนที่ 2: เพิ่ม LogOut และ Shield icons

ที่บรรทัดที่ 4-8 เพิ่ม icons:

```typescript
import {
    Plus, Trash2, FilePenLine, X, XCircle, Save,
    Image as ImageIcon, ChevronLeft, ChevronRight,
    Home, User, Phone, Mail, Clock, MessageSquare,
    LogOut, Shield  // เพิ่มบรรทัดนี้
} from 'lucide-react';
```

### ขั้นตอนที่ 3: สร้าง Main Component ที่มี Authentication

เพิ่มที่ **ท้ายสุดของไฟล์** (หลังจาก components ทั้งหมด):

```typescript
// ----------------------------------------------------------------------
// --- Main Admin Page with Authentication ---
// ----------------------------------------------------------------------

export default function AdminPage() {
    const router = useRouter();
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'centers' | 'consultations' | 'contacts' | 'blogs'>('centers');

    // ตรวจสอบ authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('admin');

        if (!token || !adminData) {
            // ถ้าไม่มี token redirect ไปหน้า login
            router.push('/login');
            return;
        }

        try {
            const admin = JSON.parse(adminData);
            setCurrentAdmin(admin);
            setIsAuthChecking(false);
        } catch (error) {
            console.error('Invalid admin data:', error);
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            router.push('/login');
        }
    };

    // แสดง loading ขณะตรวจสอบ
    if (isAuthChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Admin Info and Logout */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Admin Panel
                                </h1>
                                <p className="text-xs text-gray-500">
                                    YooDee HomeCare Management
                                </p>
                            </div>
                        </div>

                        {currentAdmin && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {currentAdmin.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">ออกจากระบบ</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'centers', label: 'ศูนย์ดูแล' },
                            { id: 'consultations', label: 'คำปรึกษา' },
                            { id: 'contacts', label: 'ข้อความติดต่อ' },
                            { id: 'blogs', label: 'บทความ' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'centers' && <ManageCenterPage />}
                {activeTab === 'consultations' && <ConsultationManagement />}
                {activeTab === 'contacts' && <ContactMessageManagement />}
                {activeTab === 'blogs' && <ManageBlogPage />}
            </div>
        </div>
    );
}
```

### ขั้นตอนที่ 4: ลบ export default เดิม

ค้นหาและลบบรรทัดนี้ออก (มักจะอยู่ท้ายไฟล์):

```typescript
export default function AdminPage() {
    // ... โค้ดเดิม
}
```

แล้วแทนที่ด้วยโค้ดใหม่ที่มี authentication check ด้านบน

---

## 🎯 ผลลัพธ์ที่ได้

หลังจากทำตามขั้นตอนข้างต้น:

### ✅ หน้า Login
- เข้าหน้า login ขณะที่ login อยู่แล้ว → redirect ไป `/admin/manage`
- เข้าหน้า login ขณะที่ไม่ได้ login → แสดงฟอร์ม login

### ✅ หน้า Admin Manage
- เข้าหน้า manage ขณะที่ไม่ได้ login → redirect ไป `/login`
- เข้าหน้า manage ขณะที่ login อยู่ → แสดงหน้า admin panel
- มีปุ่ม Logout ที่ทำงานได้
- แสดงชื่อและบทบาทของ admin ที่ login

---

## 🔍 การทดสอบ

### Test Case 1: ไม่ได้ Login
1. เปิด browser ใหม่ (หรือ clear localStorage)
2. ไปที่ `http://localhost:3000/admin/manage`
3. **ผลลัพธ์**: ควร redirect ไปหน้า `/login`

### Test Case 2: Login แล้ว
1. Login ที่หน้า `/login`
2. **ผลลัพธ์**: redirect ไปหน้า `/admin/manage`
3. **ผลลัพธ์**: เห็นชื่อ admin และปุ่ม logout

### Test Case 3: Login อยู่แล้วแต่เข้าหน้า Login
1. Login อยู่แล้ว
2. ไปที่ `http://localhost:3000/login`
3. **ผลลัพธ์**: redirect ไปหน้า `/admin/manage` ทันที

### Test Case 4: Logout
1. คลิกปุ่ม "ออกจากระบบ"
2. **ผลลัพธ์**: redirect ไปหน้า `/login`
3. ลอง refresh หน้า → ยังคงอยู่ที่หน้า login

---

## 📌 หมายเหตุ

- ไฟล์ `page.tsx` มีขนาด 972 บรรทัด ซึ่งใหญ่มาก
- แนะนำให้แยก components ออกเป็นไฟล์ย่อยๆ ตามที่ระบุใน `ADMIN_TOKEN_MIGRATION_GUIDE.md`
- หลังจากแยก components แล้ว จะง่ายต่อการจัดการและ maintain

---

**อัปเดตเมื่อ**: 2025-11-27 09:52  
**สถานะ**: ✅ หน้า Login เสร็จแล้ว | ⏳ หน้า Admin Manage รอการอัปเดต
