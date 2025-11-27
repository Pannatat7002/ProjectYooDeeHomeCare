# 🔐 คู่มือการใช้งาน Token Authentication ในหน้า Admin

## การเปลี่ยนแปลงที่สำคัญ

ระบบ Admin Panel ได้รับการอัปเกรดให้ใช้ **JWT Token Authentication** สำหรับความปลอดภัยที่ดีขึ้น

---

## 📁 ไฟล์ที่สร้างใหม่

### 1. **Authentication Utilities**
```
src/lib/auth-client.ts
```
- ฟังก์ชันสำหรับจัดการ authentication ฝั่ง client
- `getToken()` - ดึง token
- `getAdmin()` - ดึงข้อมูล admin
- `fetchWithAuth()` - fetch ที่มี token
- `login()` - helper สำหรับ login
- `logout()` - helper สำหรับ logout

### 2. **Admin Management Component**
```
src/app/admin/manage/components/ManageAdminPage.tsx
```
- หน้าจัดการ Admin (เฉพาะ Super Admin)
- ใช้ token ในการเรียก API ทั้งหมด
- CRUD operations สำหรับ Admin

### 3. **Main Admin Page (New)**
```
src/app/admin/manage/page-new.tsx
```
- หน้าหลักของ Admin Panel พร้อม authentication
- ตรวจสอบ token ก่อนเข้าใช้งาน
- แสดง tabs ต่างๆ ตามสิทธิ์

---

## 🔄 วิธีการอัปเดตไฟล์เดิม

### ขั้นตอนที่ 1: Backup ไฟล์เดิม

```bash
# Backup page.tsx เดิม
cp src/app/admin/manage/page.tsx src/app/admin/manage/page-backup.tsx
```

### ขั้นตอนที่ 2: แทนที่ด้วยไฟล์ใหม่

```bash
# ใช้ไฟล์ใหม่แทน
cp src/app/admin/manage/page-new.tsx src/app/admin/manage/page.tsx
```

### ขั้นตอนที่ 3: แยก Components

คุณต้องแยก components ต่อไปนี้จากไฟล์ `page-backup.tsx` ไปยัง:

1. **ManageCenterPage** → `src/app/admin/manage/components/ManageCenterPage.tsx`
2. **ConsultationManagement** → `src/app/admin/manage/components/ConsultationManagement.tsx`
3. **ContactMessageManagement** → `src/app/admin/manage/components/ContactMessageManagement.tsx`
4. **ManageBlogPage** → `src/app/admin/manage/components/ManageBlogPage.tsx`

---

## 🔧 การแก้ไข Components ให้ใช้ Token

สำหรับแต่ละ component ที่แยกออกมา ให้เพิ่มการใช้ `fetchWithAuth`:

### ตัวอย่าง: ManageCenterPage.tsx

```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth-client';
// ... imports อื่นๆ

export default function ManageCenterPage() {
    const [centers, setCenters] = useState<CareCenter[]>([]);
    
    const fetchCenters = async () => {
        setIsLoading(true);
        try {
            // ใช้ fetchWithAuth แทน fetch ธรรมดา
            const res = await fetchWithAuth('/api/care-centers');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCenters(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) return;
        try {
            // ใช้ fetchWithAuth
            const res = await fetchWithAuth(`/api/care-centers/${id}`, { 
                method: 'DELETE' 
            });
            if (res.ok) {
                fetchCenters();
            } else {
                alert('ลบข้อมูลไม่สำเร็จ');
            }
        } catch (error) { 
            console.error(error); 
            alert('เกิดข้อผิดพลาดในการลบ'); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
            price: Number(formData.price),
            rating: Number(formData.rating)
        };
        const url = editingId ? `/api/care-centers/${editingId}` : '/api/care-centers';
        const method = editingId ? 'PUT' : 'POST';
        
        try {
            // ใช้ fetchWithAuth พร้อม headers
            const res = await fetchWithAuth(url, { 
                method, 
                body: JSON.stringify(payload) 
            });
            if (!res.ok) throw new Error('Failed to save');
            alert('บันทึกข้อมูลสำเร็จ');
            closeModal();
            fetchCenters();
        } catch (error) { 
            console.error(error); 
            alert('เกิดข้อผิดพลาดในการบันทึก'); 
        }
    };

    // ... rest of component
}
```

### สิ่งที่ต้องเปลี่ยนในแต่ละ Component:

1. **Import fetchWithAuth**:
   ```typescript
   import { fetchWithAuth } from '@/lib/auth-client';
   ```

2. **แทนที่ fetch ทั้งหมดด้วย fetchWithAuth**:
   ```typescript
   // เดิม
   const res = await fetch('/api/care-centers');
   
   // ใหม่
   const res = await fetchWithAuth('/api/care-centers');
   ```

3. **สำหรับ POST/PUT/DELETE ที่มี body**:
   ```typescript
   // fetchWithAuth จะเพิ่ม Content-Type: application/json อัตโนมัติ
   const res = await fetchWithAuth('/api/care-centers', {
       method: 'POST',
       body: JSON.stringify(data)
   });
   ```

---

## 📝 Checklist การอัปเดต

- [ ] Backup ไฟล์ `page.tsx` เดิม
- [ ] สร้างโฟลเดอร์ `src/app/admin/manage/components/`
- [ ] แยก `ManageCenterPage` ออกมาเป็นไฟล์แยก
- [ ] แยก `ConsultationManagement` ออกมาเป็นไฟล์แยก
- [ ] แยก `ContactMessageManagement` ออกมาเป็นไฟล์แยก
- [ ] แยก `ManageBlogPage` ออกมาเป็นไฟล์แยก
- [ ] เพิ่ม `import { fetchWithAuth }` ในทุก component
- [ ] แทนที่ `fetch` ด้วย `fetchWithAuth` ในทุก component
- [ ] ใช้ `page-new.tsx` แทน `page.tsx` เดิม
- [ ] ทดสอบการ login
- [ ] ทดสอบการเรียก API ทุก endpoint
- [ ] ทดสอบการ logout

---

## 🧪 การทดสอบ

### 1. ทดสอบ Login
```
1. ไปที่ http://localhost:3000/login
2. Login ด้วย admin/Admin@123456
3. ควร redirect ไปที่ /admin/manage
```

### 2. ทดสอบ Token
```
1. เปิด DevTools → Application → Local Storage
2. ควรเห็น 'token' และ 'admin'
3. ลอง refresh หน้า ควรยังคง login อยู่
```

### 3. ทดสอบ API Calls
```
1. เปิด DevTools → Network
2. ลองเพิ่ม/แก้ไข/ลบข้อมูล
3. ตรวจสอบว่า request มี Authorization header
```

### 4. ทดสอบ Token Expiry
```
1. ลบ token จาก localStorage
2. ลอง refresh หน้า
3. ควร redirect ไปหน้า login
```

---

## ⚠️ ข้อควรระวัง

1. **ต้องมี token ก่อนเข้าหน้า admin**
   - ถ้าไม่มี token จะ redirect ไปหน้า login อัตโนมัติ

2. **Token หมดอายุใน 7 วัน**
   - หลังจากนั้นต้อง login ใหม่

3. **Super Admin เท่านั้นที่เห็น tab "จัดการ Admin"**
   - Admin ธรรมดาจะไม่เห็น tab นี้

4. **การ logout จะลบ token ทันที**
   - ต้อง login ใหม่ทุกครั้ง

---

## 🔍 Troubleshooting

### ปัญหา: ไม่สามารถเรียก API ได้
**วิธีแก้**:
1. ตรวจสอบว่ามี token ใน localStorage
2. ตรวจสอบว่า token ยังไม่หมดอายุ
3. ดู Network tab ว่ามี Authorization header หรือไม่

### ปัญหา: Redirect ไปหน้า login ตลอด
**วิธีแก้**:
1. ตรวจสอบว่า login สำเร็จหรือไม่
2. ดู Console มี error อะไรหรือไม่
3. ลอง clear localStorage แล้ว login ใหม่

### ปัญหา: Components ไม่ทำงาน
**วิธีแก้**:
1. ตรวจสอบว่า import ถูกต้อง
2. ตรวจสอบว่าใช้ fetchWithAuth แล้ว
3. ดู Console มี error หรือไม่

---

## 📞 ติดต่อ

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา

---

**สร้างเมื่อ**: 2025-11-27  
**เวอร์ชัน**: 1.0.0
