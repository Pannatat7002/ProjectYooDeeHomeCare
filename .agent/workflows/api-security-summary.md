---
description: สรุปการเพิ่มระบบตรวจสอบสิทธิ์ใน Admin APIs
---

# สรุปการเพิ่มระบบตรวจสอบสิทธิ์ใน Admin APIs

## การเปลี่ยนแปลงที่ทำ

เพิ่มการตรวจสอบสิทธิ์ (Authentication & Authorization) ให้กับ API endpoints ทั้งหมดที่ใช้สำหรับการจัดการข้อมูล (Admin APIs)

### API Endpoints ที่ได้รับการปรับปรุง:

#### 1. **Admin Management APIs** ✅
- `PUT /api/auth/admins/[id]` - อัปเดตข้อมูล Admin (ต้องเป็น super_admin)
- `DELETE /api/auth/admins/[id]` - ลบ Admin (ต้องเป็น super_admin)
- ใช้ `requireSuperAdmin` middleware

#### 2. **Care Centers APIs** ✅
- `POST /api/care-centers` - สร้างศูนย์ดูแลใหม่ (ต้อง login)
- `PUT /api/care-centers/[id]` - แก้ไขศูนย์ดูแล (ต้อง login)
- `DELETE /api/care-centers/[id]` - ลบศูนย์ดูแล (ต้อง login)
- ใช้ `requireAuth` middleware

#### 3. **Blogs APIs** ✅
- `POST /api/blogs` - สร้างบทความใหม่ (ต้อง login)
- `PUT /api/blogs/[id]` - แก้ไขบทความ (ต้อง login)
- `DELETE /api/blogs/[id]` - ลบบทความ (ต้อง login)
- ใช้ `requireAuth` middleware

#### 4. **Contact Messages APIs** ✅
- `PUT /api/contact/[id]` - อัปเดตข้อความติดต่อ (ต้อง login)
- `DELETE /api/contact/[id]` - ลบข้อความติดต่อ (ต้อง login)
- ใช้ `requireAuth` middleware

#### 5. **Consultations APIs** ✅
- `PUT /api/care-centers/consultations/[id]` - อัปเดตรายการปรึกษา (ต้อง login)
- `DELETE /api/care-centers/consultations/[id]` - ลบรายการปรึกษา (ต้อง login)
- ใช้ `requireAuth` middleware

## วิธีการทำงาน

### 1. Authentication Flow

```
Client Request → API Endpoint → requireAuth Middleware → Verify Token → Execute Handler
                                        ↓
                                  Token Invalid?
                                        ↓
                                  Return 401 Error
```

### 2. Middleware ที่ใช้

#### `requireAuth` (ใน `src/lib/middleware.ts`)
- ตรวจสอบว่ามี Authorization header หรือไม่
- ตรวจสอบความถูกต้องของ JWT token
- ส่งต่อข้อมูล user ไปยัง handler

#### `requireSuperAdmin` (ใน `src/lib/middleware.ts`)
- เรียกใช้ `requireAuth` ก่อน
- ตรวจสอบว่า user มี role เป็น `super_admin` หรือไม่
- ใช้สำหรับ endpoints ที่ต้องการสิทธิ์สูงสุด

## วิธีการเรียกใช้ API (Frontend)

### ตัวอย่างการส่ง Request พร้อม Token

```typescript
// ดึง token จาก localStorage หรือ session
const token = localStorage.getItem('authToken');

// ส่ง request พร้อม Authorization header
const response = await fetch('/api/care-centers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ส่ง token ในรูปแบบ Bearer
  },
  body: JSON.stringify({
    name: 'ศูนย์ดูแลผู้สูงอายุ ABC',
    // ... ข้อมูลอื่นๆ
  })
});

const data = await response.json();

if (response.ok) {
  console.log('สำเร็จ:', data);
} else {
  console.error('ข้อผิดพลาด:', data.message);
}
```

## Response Codes

### Success Responses
- `200 OK` - อัปเดตสำเร็จ
- `201 Created` - สร้างสำเร็จ

### Error Responses
- `401 Unauthorized` - ไม่พบ token หรือ token ไม่ถูกต้อง
  ```json
  {
    "success": false,
    "message": "ไม่พบ token การยืนยันตัวตน"
  }
  ```

- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง (สำหรับ super_admin endpoints)
  ```json
  {
    "success": false,
    "message": "ต้องการสิทธิ์ Super Admin"
  }
  ```

- `404 Not Found` - ไม่พบข้อมูลที่ต้องการแก้ไข/ลบ
  ```json
  {
    "success": false,
    "message": "ไม่พบศูนย์ดูแลนี้"
  }
  ```

- `500 Internal Server Error` - เกิดข้อผิดพลาดในระบบ
  ```json
  {
    "success": false,
    "message": "เกิดข้อผิดพลาดในการอัปเดตศูนย์ดูแล"
  }
  ```

## การทดสอบ

### 1. ทดสอบโดยไม่ส่ง Token
```bash
curl -X PUT http://localhost:3000/api/care-centers/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```
**ผลลัพธ์ที่คาดหวัง:** 401 Unauthorized

### 2. ทดสอบด้วย Token ที่ถูกต้อง
```bash
curl -X PUT http://localhost:3000/api/care-centers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "Test Updated"}'
```
**ผลลัพธ์ที่คาดหวัง:** 200 OK พร้อมข้อมูลที่อัปเดต

### 3. ทดสอบด้วย Token ที่หมดอายุ
**ผลลัพธ์ที่คาดหวัง:** 401 Unauthorized พร้อมข้อความ "Token ไม่ถูกต้องหรือหมดอายุ"

## ข้อควรระวัง

1. **Token Storage**: เก็บ token ใน localStorage หรือ httpOnly cookie
2. **Token Expiration**: ตรวจสอบและ refresh token เมื่อหมดอายุ
3. **HTTPS**: ใช้ HTTPS ในการส่ง token เพื่อความปลอดภัย
4. **Error Handling**: จัดการ error responses อย่างเหมาะสม

## ไฟล์ที่เกี่ยวข้อง

- `src/lib/middleware.ts` - Middleware สำหรับตรวจสอบสิทธิ์
- `src/lib/auth.ts` - ฟังก์ชันสำหรับ JWT verification
- `src/app/api/*/route.ts` - API endpoints ทั้งหมด
