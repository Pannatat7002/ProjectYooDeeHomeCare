# 🚀 คู่มือการตั้งค่าและย้ายไปใช้ Supabase (Database & Storage)

ระบบ **YooDeeHomeCare** ได้ถูกอัปเกรดให้เชื่อมต่อกับ **Supabase** อย่างสมบูรณ์แล้ว ทั้งในส่วนของ **Database (PostgreSQL)** สำหรับเก็บข้อมูลทั้งหมด และ **Supabase Storage** สำหรับการอัปโหลดและจัดเก็บรูปภาพ (บล็อก, โฆษณา, รูปศูนย์ดูแล, รูปห้องพัก และโลโก้แบรนด์)

---

## 📋 ขั้นตอนการตั้งค่าโปรเจกต์ Supabase (ทำเพียงครั้งเดียว)

### ขั้นตอนที่ 1: สร้างโปรเจกต์ใหม่บน Supabase
1. เข้าไปที่ [https://supabase.com](https://supabase.com) แล้วเข้าสู่ระบบ (Sign In)
2. คลิกปุ่ม **"New Project"**
3. ตั้งชื่อโปรเจกต์ (เช่น `yoodee-homecare`)
4. กำหนด **Database Password** (บันทึกรหัสผ่านนี้เก็บไว้)
5. เลือก Region: **Singapore (Southeast Asia)** เพื่อความเร็วสูงสุดสำหรับผู้ใช้งานในไทย
6. กดปุ่ม **"Create new project"** และรอประมาณ 1-2 นาทีให้ระบบเตรียมฐานข้อมูล

---

### ขั้นตอนที่ 2: รัน SQL Schema สร้าง Tables และ Storage Bucket
1. ในหน้า Supabase Dashboard เมนูด้านซ้าย ให้คลิกที่ไอคอน **"SQL Editor"**
2. คลิกปุ่ม **"New query"** (หรือไอคอน `+`)
3. เปิดไฟล์ [supabase_schema.sql](file:///c:/Projects/Project_YooDeeHomeCare/supabase_schema.sql) ในโปรเจกต์ของคุณ คัดลอกโค้ด SQL ทั้งหมด แล้วนำมาวางในหน้าต่าง SQL Editor
4. คลิกปุ่ม **"Run"** (หรือกด `Ctrl + Enter`) สีเขียวด้านล่างขวา
5. ระบบจะสร้าง:
   - ✅ **8 ตารางข้อมูล**: `care_centers`, `blogs`, `consultations`, `contacts`, `admins`, `ads`, `traffic`, `provider_signups`
   - ✅ **Storage Bucket**: `yoodee-images` (เปิด Public Read สำหรับรูปภาพ)
   - ✅ **RLS Policies**: กำหนดสิทธิ์ความปลอดภัย
   - ✅ **Super Admin คนแรก**: 
     - **Username**: `admin`
     - **Password**: `Admin@123456`

---

### ขั้นตอนที่ 3: คัดลอก API Keys มาใส่ใน `.env.local`
1. ในหน้า Supabase Dashboard เมนูด้านซ้ายล่าง ให้คลิกที่ไอคอนรูปเฟือง **"Project Settings"**
2. เลือกเมนู **"API"**
3. คัดลอกค่าต่างๆ มาใส่ในไฟล์ `.env.local` ของโปรเจกต์คุณ:

```env
# URL ของโปรเจกต์ (Project URL)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

# Anon Public Key (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Secret (service_role key) *ต้องเก็บเป็นความลับ ใช้ใน Backend API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Secret สำหรับ Sign JWT Token
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

> **ข้อสังเกต:** สามารถดูตัวอย่างโครงสร้างไฟล์ได้ที่ [.env.example](file:///c:/Projects/Project_YooDeeHomeCare/.env.example)

---

### ขั้นตอนที่ 4: ตรวจสอบ Storage Bucket
1. ไปที่เมนู **"Storage"** ด้านซ้ายใน Supabase Dashboard
2. จะเห็น Bucket ชื่อ **`yoodee-images`** ที่มีแท็ก **Public** สีเขียว
3. หากยังไม่ขึ้น สามารถสร้างด้วยตนเองได้โดยคลิก **"New bucket"** -> ตั้งชื่อว่า `yoodee-images` -> ติ๊กเปิด **"Public bucket"** -> กด Save

---

### ขั้นตอนที่ 5: รีสตาร์ท Dev Server และเข้าใช้งาน
1. ปิดและเปิด Terminal dev server ใหม่:
   ```bash
   npm run dev
   ```
2. เข้าสู่ระบบ Admin ได้ทันทีที่:
   - URL: `http://localhost:3000/admin/dashboard` หรือ `http://localhost:3000/admin/manage`
   - **Username**: `admin`
   - **Password**: `Admin@123456`
3. ในหน้า Admin จัดการข้อมูล ตอนนี้มีปุ่ม **"อัปโหลดรูปภาพ"** ให้ใช้งานแล้ว:
   - **จัดการบทความ (Blogs)**: อัปโหลดรูปภาพหน้าปกบทความลง Supabase Storage ได้โดยตรง
   - **จัดการโฆษณา (Ads)**: อัปโหลดรูปแบนเนอร์โฆษณา
   - **จัดการศูนย์ดูแล (Care Centers)**: อัปโหลดรูปภาพศูนย์ดูแล, รูปห้องพักแต่ละประเภท (Room Types), และโลโก้แบรนด์

---

## 🛠 รายละเอียดทางเทคนิคของระบบใหม่
- **ORM / Client**: `@supabase/supabase-js` ผ่าน [supabase.ts](file:///c:/Projects/Project_YooDeeHomeCare/src/lib/supabase.ts)
- **Data Access Layer**: รวมศูนย์อยู่ที่ [db.ts](file:///c:/Projects/Project_YooDeeHomeCare/src/lib/db.ts) รองรับ Full CRUD (Create, Read, Update, Delete) โดยแปลง CamelCase <-> SnakeCase ให้อัตโนมัติ จึงเข้ากันได้กับโค้ด Frontend และ API เดิม 100%
- **Image Upload API**: [src/app/api/upload/route.ts](file:///c:/Projects/Project_YooDeeHomeCare/src/app/api/upload/route.ts) ตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin Auth) และอัปโหลดไฟล์ไปยัง bucket `yoodee-images` พร้อมส่งคืน Public URL
- **UI Upload Component**: [ImageUploadButton.tsx](file:///c:/Projects/Project_YooDeeHomeCare/src/components/ImageUploadButton.tsx) ใช้งานง่าย รองรับสถานะ Loading และแสดงตัวอย่างรูปภาพทันที
