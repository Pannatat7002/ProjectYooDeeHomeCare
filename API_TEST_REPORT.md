# รายงานการตรวจสอบ API - YooDee HomeCare

**วันที่:** 24 พฤศจิกายน 2025  
**เวลา:** 11:31 น.

## สรุปผลการตรวจสอบ

### ✅ สถานะ: API ทำงานได้ปกติทั้งหมด

หลังจากแก้ไขปัญหาใน `src/lib/googleSheets.ts` โดยเปลี่ยนจากการใช้ `row._header` เป็น `row.toObject()` เพื่อความเข้ากันได้กับ google-spreadsheet เวอร์ชันใหม่

---

## รายละเอียด API Endpoints

### 1. Care Centers API

#### GET `/api/care-centers`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Array ของ Care Centers
- **ข้อมูลที่ทดสอบ:** 1 รายการ
- **ตัวอย่างข้อมูล:**
```json
[
  {
    "id": 1,
    "name": "Test Care Center",
    "brandName": "Test Brand",
    "type": "โรงพยาบาล",
    "address": "123 Test Street",
    "phone": "0812345678",
    "hasGovernmentCertificate": true,
    "lat": 13.7563,
    "lng": 100.5018,
    "price": 50000,
    "packages": [
      {
        "name": "Basic Package",
        "price": 30000,
        "description": "Basic care"
      }
    ]
  }
]
```

#### POST `/api/care-centers`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Status 201 พร้อมข้อมูล Care Center ที่สร้าง
- **การทำงาน:** บันทึกข้อมูลลง Google Sheets สำเร็จ

#### GET `/api/care-centers/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** ข้อมูล Care Center ตาม ID

#### PUT `/api/care-centers/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** ข้อมูล Care Center ที่อัปเดต

#### DELETE `/api/care-centers/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Status 204 (No Content)

---

### 2. Consultations API

#### GET `/api/care-centers/consultations`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Object พร้อม success, count, และ data array
- **ข้อมูลที่ทดสอบ:** 1 รายการ
- **ตัวอย่างข้อมูล:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1763958854378,
      "name": "Test User",
      "phone": "0898765432",
      "lineId": "testline",
      "email": "test@example.com",
      "roomType": "ห้องเดี่ยว",
      "branch": "Test Branch",
      "budget": "30000-50000",
      "convenientTime": "เช้า",
      "message": "This is a test consultation",
      "status": "pending",
      "submittedAt": "2025-11-24T04:34:14.378Z"
    }
  ]
}
```

#### POST `/api/care-centers/consultations`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Status 201 พร้อมข้อความสำเร็จ
- **Validation:** ตรวจสอบฟิลด์ที่จำเป็น (name, phone, roomType, branch, budget, convenientTime)
- **การทำงาน:** บันทึกข้อมูลลง Google Sheets สำเร็จ

#### PUT `/api/care-centers/consultations/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** ข้อมูลการนัดหมายที่อัปเดต

#### DELETE `/api/care-centers/consultations/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Status 204 (No Content)

---

### 3. Contact API

#### GET `/api/contact`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Object พร้อม data array
- **ข้อมูลที่ทดสอบ:** 1 รายการ
- **ตัวอย่างข้อมูล:**
```json
{
  "data": [
    {
      "id": 1763958857438,
      "name": "Test Contact",
      "email": "contact@example.com",
      "phone": "0887654321",
      "message": "This is a test contact message",
      "submittedAt": "2025-11-24T04:34:17.438Z",
      "status": "new"
    }
  ]
}
```

#### POST `/api/contact`
- **สถานะ:** ✅ ทำงานได้
- **Response:** Status 201 พร้อมข้อความสำเร็จ
- **การทำงาน:** บันทึกข้อมูลลง Google Sheets สำเร็จ

#### PUT `/api/contact/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** ข้อมูลข้อความที่อัปเดต

#### DELETE `/api/contact/[id]`
- **สถานะ:** ✅ ทำงานได้
- **Response:** ข้อความยืนยันการลบ

---

## ปัญหาที่พบและแก้ไข

### ปัญหา: Cannot read properties of undefined (reading 'forEach')
**สาเหตุ:** ฟังก์ชัน `rowsToData()` ใน `src/lib/googleSheets.ts` ใช้ `row._header` ซึ่งไม่รองรับในเวอร์ชันใหม่ของ google-spreadsheet

**วิธีแก้ไข:** 
- เปลี่ยนจากการใช้ `row._header.forEach()` และ `row.get(header)` 
- เป็นการใช้ `row.toObject()` เพื่อดึงข้อมูลทั้งหมดเป็น object
- จากนั้นวนลูปผ่าน `Object.keys()` แทน

**โค้ดที่แก้ไข:**
```typescript
export const rowsToData = (rows: any[]) => {
    return rows.map((row) => {
        // ใช้ toObject() แทน _header เพื่อความเข้ากันได้กับทุกเวอร์ชัน
        const rawObj = row.toObject ? row.toObject() : row;
        const obj: any = {};

        // วนลูปผ่านทุก key ใน object
        Object.keys(rawObj).forEach((header: string) => {
            let value = rawObj[header];
            // ... ประมวลผลข้อมูล
        });

        return obj;
    });
};
```

---

## การเชื่อมต่อ Google Sheets

### ✅ สถานะการเชื่อมต่อ: สำเร็จ

**ข้อมูลการเชื่อมต่อ:**
- Sheet ID: `1TQ_pBwT7r1KCY2h5pZ3LDDofhIUSucbduGxI891fEIc`
- Service Account: `ThaiCareCenter@excare-service-project.iam.gserviceaccount.com`
- Sheets ที่ใช้งาน:
  - CareCenters
  - Consultations
  - Contacts

**การทำงาน:**
- ✅ อ่านข้อมูลจาก Google Sheets ได้
- ✅ เขียนข้อมูลลง Google Sheets ได้
- ✅ อัปเดตข้อมูลได้
- ✅ ลบข้อมูลได้

---

## สรุป

**API ทั้งหมดทำงานได้ถูกต้องแล้ว** หลังจากแก้ไขปัญหาการอ่านข้อมูลจาก Google Sheets ระบบสามารถ:
1. ✅ รับข้อมูลจาก Google Sheets ได้ถูกต้อง
2. ✅ บันทึกข้อมูลใหม่ลง Google Sheets ได้
3. ✅ อัปเดตข้อมูลได้
4. ✅ ลบข้อมูลได้
5. ✅ แปลงข้อมูล (JSON, Boolean, Number) ได้ถูกต้อง
6. ✅ จัดการเบอร์โทรศัพท์ (เก็บ 0 นำหน้า) ได้ถูกต้อง

**ไม่พบปัญหาใด ๆ ในการทำงานของ API**
