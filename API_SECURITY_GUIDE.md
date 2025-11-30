# 🔐 คู่มือระบบความปลอดภัย API - ThaiCareCenter

## สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [การติดตั้งและเตรียมความพร้อม](#การติดตั้งและเตรียมความพร้อม)
3. [การสร้าง Super Admin คนแรก](#การสร้าง-super-admin-คนแรก)
4. [API Endpoints](#api-endpoints)
5. [การใช้งาน Authentication](#การใช้งาน-authentication)
6. [การจัดการ Admin](#การจัดการ-admin)
7. [การป้องกัน API Routes](#การป้องกัน-api-routes)

---

## ภาพรวมระบบ

ระบบความปลอดภัยนี้ประกอบด้วย:

### ✅ คุณสมบัติหลัก
- **JWT Authentication**: ใช้ JSON Web Tokens สำหรับการยืนยันตัวตน
- **Password Hashing**: ใช้ bcrypt สำหรับเข้ารหัสรหัสผ่าน
- **Role-Based Access Control**: แบ่งสิทธิ์เป็น `super_admin` และ `admin`
- **Google Sheets Integration**: เก็บข้อมูล Admin ใน Google Sheets
- **Secure API Routes**: ป้องกัน API ด้วย middleware

### 🔑 บทบาทผู้ใช้งาน

| บทบาท | สิทธิ์ |
|--------|--------|
| **super_admin** | จัดการ Admin ทั้งหมด (สร้าง, แก้ไข, ลบ), เข้าถึง API ทั้งหมด |
| **admin** | เข้าถึง API ที่ได้รับอนุญาต, ไม่สามารถจัดการ Admin อื่นได้ |

---

## การติดตั้งและเตรียมความพร้อม

### 1. ติดตั้ง Dependencies

```bash
npm install bcryptjs jsonwebtoken jose
npm install --save-dev @types/bcryptjs @types/jsonwebtoken tsx
```

### 2. ตั้งค่า Environment Variables

สร้างหรือแก้ไขไฟล์ `.env.local`:

```env
# JWT Secret Key (ควรเปลี่ยนเป็นค่าที่ปลอดภัยในการใช้งานจริง)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Google Sheets Configuration (ถ้ามีอยู่แล้ว)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

**⚠️ สำคัญ**: 
- `JWT_SECRET` ควรมีความยาวอย่างน้อย 32 ตัวอักษร
- ไม่ควร commit `.env.local` เข้า Git

### 3. เพิ่ม Sheet ใหม่ใน Google Sheets

เข้าไปที่ Google Sheets ของคุณและสร้าง Sheet ใหม่ชื่อ **"Admins"**

---

## การสร้าง Super Admin คนแรก

### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
npm run create-super-admin
```

Script จะสร้าง Super Admin ด้วยข้อมูลเริ่มต้น:
- **Username**: `admin`
- **Password**: `Admin@123456`
- **Email**: `admin@yoodee.com`
- **Full Name**: `Super Administrator`

**⚠️ กรุณาเปลี่ยนรหัสผ่านทันทีหลังจาก login ครั้งแรก!**

### วิธีที่ 2: เพิ่มด้วยตนเองใน Google Sheets

1. เปิด Google Sheets
2. ไปที่ Sheet "Admins"
3. เพิ่มข้อมูลดังนี้:

| id | username | password | email | fullName | role | isActive | createdAt |
|----|----------|----------|-------|----------|------|----------|-----------|
| 1 | admin | [hashed_password] | admin@yoodee.com | Super Administrator | super_admin | TRUE | 2025-11-27T09:00:00.000Z |

**หมายเหตุ**: ต้อง hash password ด้วย bcrypt ก่อน (ใช้ Script แทนจะง่ายกว่า)

---

## API Endpoints

### 🔓 Public Endpoints (ไม่ต้อง Login)

#### POST `/api/auth/login`
เข้าสู่ระบบ

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@yoodee.com",
    "fullName": "Super Administrator",
    "role": "super_admin",
    "isActive": true,
    "createdAt": "2025-11-27T09:00:00.000Z",
    "lastLogin": "2025-11-27T09:08:36.000Z"
  },
  "message": "เข้าสู่ระบบสำเร็จ"
}
```

---

### 🔒 Protected Endpoints (ต้อง Login)

#### GET `/api/auth/admins`
ดึงรายการ Admin ทั้งหมด (ต้อง login)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@yoodee.com",
      "fullName": "Super Administrator",
      "role": "super_admin",
      "isActive": true,
      "createdAt": "2025-11-27T09:00:00.000Z"
    }
  ]
}
```

---

### 🔐 Super Admin Only Endpoints

#### POST `/api/auth/admins`
สร้าง Admin ใหม่ (ต้องเป็น super_admin)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "staff01",
  "password": "SecurePassword123",
  "email": "staff01@yoodee.com",
  "fullName": "Staff Member 01",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "staff01",
    "email": "staff01@yoodee.com",
    "fullName": "Staff Member 01",
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-11-27T10:00:00.000Z"
  },
  "message": "สร้าง Admin สำเร็จ"
}
```

#### PUT `/api/auth/admins/[id]`
อัปเดตข้อมูล Admin (ต้องเป็น super_admin)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@yoodee.com",
  "isActive": false
}
```

#### DELETE `/api/auth/admins/[id]`
ลบ Admin (ต้องเป็น super_admin)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "ลบ Admin สำเร็จ"
}
```

**⚠️ หมายเหตุ**: ไม่สามารถลบ Super Admin คนสุดท้ายได้

---

## การใช้งาน Authentication

### ในหน้า Frontend (React/Next.js)

```typescript
// 1. Login
const login = async (username: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // เก็บ token ใน localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    return data;
  }
  
  throw new Error(data.message);
};

// 2. เรียก API ที่ต้อง Authentication
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/auth/admins', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// 3. Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  // Redirect to login page
};
```

---

## การจัดการ Admin

### เปลี่ยนรหัสผ่าน

```typescript
const changePassword = async (adminId: number, newPassword: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/auth/admins/${adminId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  });
  
  return response.json();
};
```

### ระงับการใช้งาน Admin

```typescript
const suspendAdmin = async (adminId: number) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/auth/admins/${adminId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive: false }),
  });
  
  return response.json();
};
```

---

## การป้องกัน API Routes

### ตัวอย่างการใช้ Middleware

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireSuperAdmin } from '@/lib/middleware';

// API ที่ต้อง login
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req) => {
    // req.user จะมีข้อมูล JWT payload
    console.log('User:', req.user);
    
    return NextResponse.json({
      success: true,
      data: 'Protected data',
    });
  });
}

// API ที่ต้องเป็น super_admin
export async function POST(request: NextRequest) {
  return requireSuperAdmin(request, async (req) => {
    // เฉพาะ super_admin เท่านั้นที่เข้าถึงได้
    
    return NextResponse.json({
      success: true,
      message: 'Admin created',
    });
  });
}
```

---

## ⚠️ ข้อควรระวัง

1. **JWT_SECRET**: ต้องเก็บเป็นความลับและไม่ควร commit เข้า Git
2. **Token Expiration**: Token จะหมดอายุใน 7 วัน (สามารถปรับได้ใน `src/lib/auth.ts`)
3. **HTTPS**: ในการใช้งานจริง ควรใช้ HTTPS เสมอ
4. **Password Policy**: ควรกำหนดนโยบายรหัสผ่านที่เข้มงวด
5. **Rate Limiting**: ควรเพิ่ม rate limiting สำหรับ login endpoint

---

## 🔧 การแก้ไขปัญหา

### Token หมดอายุ
- ตรวจสอบว่า token ยังไม่หมดอายุ (7 วัน)
- ให้ผู้ใช้ login ใหม่

### ไม่สามารถสร้าง Admin ได้
- ตรวจสอบว่าเป็น super_admin หรือไม่
- ตรวจสอบว่า username ไม่ซ้ำ

### Google Sheets ไม่อัปเดต
- ตรวจสอบ Service Account permissions
- ตรวจสอบว่ามี Sheet "Admins" หรือไม่

---

## 📝 สรุป

ระบบความปลอดภัยนี้ให้:
- ✅ การยืนยันตัวตนที่ปลอดภัยด้วย JWT
- ✅ การเข้ารหัสรหัสผ่านด้วย bcrypt
- ✅ การจัดการสิทธิ์แบบ Role-Based
- ✅ API ที่ปลอดภัยด้วย middleware
- ✅ การจัดเก็บข้อมูลใน Google Sheets

สำหรับคำถามเพิ่มเติม กรุณาติดต่อทีมพัฒนา
