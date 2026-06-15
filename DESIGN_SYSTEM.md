# YooDeeHomeCare Design System

เอกสารนี้ระบุระเบียบข้อบังคับ โทนสี ส่วนประกอบ (Components) และแนวทางปฏิบัติด้านการออกแบบอินเตอร์เฟส (UI/UX) ของแพลตฟอร์ม YooDeeHomeCare เพื่อรักษามาตรฐานการออกแบบที่สะอาด น่าเชื่อถือ คลีน และเป็นอันหนึ่งอันเดียวกัน

---

## 🎨 1. Core Color Palette (ระบบ 4 โทนสีหลัก)

เราควบคุมจำนวนสีให้เหลือเพียง **3-4 สีหลัก** เพื่อรักษาความน่าเชื่อถือและความสบายตา โดยหลีกเลี่ยงการใช้สีสุ่ม (Arbitrary colors) นอกระบบ

| สี | โค้ดสี / คลาส Tailwind | การใช้งานหลัก | ตัวอย่าง |
| :--- | :--- | :--- | :--- |
| **1. Primary (น้ำเงินหลัก)** | `#2b64a0` (`blue-500` / `blue-600`) | ปุ่ม CTA หลัก, ไฮไลท์ข้อมูลราคา, ข้อความเน้น, ลิงก์ที่ต้องการความสนใจสูง | ปุ่ม "ติดต่อศูนย์ดูแล", ลิงก์เบอร์โทรศัพท์ |
| **2. Neutral Dark (สีตัวอักษร)** | `#0f172a` (`slate-900`) / `#1e293b` (`slate-800`) | หัวข้อหน้าเว็บ (Headers), หัวข้อการ์ด, ย่อหน้า (Body Text) เพื่อให้อ่านง่าย | `text-slate-900` |
| **3. Neutral Light (พื้นหลัง/เส้นขอบ)**| `#f8fafc` (`slate-50`) / `#f1f5f9` (`slate-100`) | สีพื้นหลังหน้าเว็บ, พื้นหลังการ์ดย่อย, เส้นแบ่งส่วน (Borders) | `bg-slate-50 border-slate-200` |
| **4. Accent / Success (สีเขียวสถานะ)**| `#16a34a` (`green-600`) / `emerald-600` | สัญลักษณ์รับรองมาตรฐาน, สถานะเตียงว่าง, ข้อความแจ้งเตือนความสำเร็จ | `text-green-700 bg-green-50` |

### 🚨 ข้อยกเว้นสำหรับสีของแบรนด์ภายนอก (Third-Party Brand Colors)
* **LINE Green**: ใช้สีทางการของไลน์ `#06C755` (โฮเวอร์ `#05a044`) สำหรับปุ่มติดต่อผ่าน LINE เท่านั้น เพื่อให้ตรงตาม Brand Guidelines และความคุ้นเคยของผู้ใช้ในการกดแชท

---

## ⚙️ 2. Tailwind v4 Theme Configuration

ระบบสีน้ำเงิน (`blue`) และอินดิโก้ (`indigo`) ทั้งหมดได้รับการ Override ในไฟล์ [globals.css](file:///c:/Projects/Project_YooDeeHomeCare/src/app/globals.css) ให้อ้างอิงเข้าสู่โทนสีของแบรนด์ เพื่อความง่ายในการเรียกใช้งานและแก้ไขในอนาคต:

```css
@theme inline {
  /* Unify brand color palette to 3-4 main colors */
  --color-blue-50: #f2f7fc;
  --color-blue-100: #e2eef9;
  --color-blue-200: #cce2f4;
  --color-blue-300: #99c4e9;
  --color-blue-400: #66a7de;
  --color-blue-500: #2b64a0;
  --color-blue-600: #2b64a0;
  --color-blue-700: #1e4a77;
  --color-blue-800: #16375a;
  --color-blue-900: #0f253d;
  --color-blue-950: #0a1829;

  --color-indigo-50: #f2f7fc;
  --color-indigo-100: #e2eef9;
  --color-indigo-200: #cce2f4;
  --color-indigo-300: #99c4e9;
  --color-indigo-400: #66a7de;
  --color-indigo-500: #2b64a0;
  --color-indigo-600: #2b64a0;
  --color-indigo-700: #1e4a77;
  --color-indigo-800: #16375a;
  --color-indigo-900: #0f253d;
  --color-indigo-950: #0a1829;
}
```
> [!NOTE]
> หลีกเลี่ยงการใช้คลาส `indigo` หรือ `blue` เป็นรายจุดโดยระบุรหัสสีแบบ Hardcode (เช่น `bg-[#3a639b]`) แนะนำให้ใช้คลาส Tailwind มาตรฐาน เช่น `bg-blue-600` ซึ่งระบบจะแปลงเป็นรหัสสีแบรนด์ให้ทันที

---

## 🔤 3. Typography & Spacing (ระบบอักษรและระยะห่าง)

### ลำดับความสำคัญของตัวอักษร (Typography Hierarchy)
* **Main H1 (หัวข้อหลักหน้าเว็บ)**: `text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900`
* **Sub-header H2 (หัวข้อรอง)**: `text-2xl md:text-3xl font-extrabold text-slate-900`
* **Card Titles H3 (หัวข้อในการ์ด)**: `text-xl md:text-2xl font-bold text-slate-900`
* **Body Text (ข้อความหลัก)**: `text-base md:text-lg text-slate-700 leading-relaxed`
* **Secondary Text (ข้อความย่อย)**: `text-sm text-gray-500`

### รัศมีความโค้ง (Border Radius)
* **การ์ดหลักและคอนเทนเนอร์ขนาดใหญ่**: `rounded-2xl` หรือ `rounded-3xl` (เช่น การ์ดรายละเอียด, กล่องจองโปรโมชัน)
* **การ์ดย่อยและรูปภาพประเภทห้อง**: `rounded-xl` หรือ `rounded-lg`
* **ปุ่มกดและฟิลด์กรอกฟอร์ม**: `rounded-full` (สำหรับปุ่มแชท/โทรหลัก) และ `rounded-xl` (สำหรับปุ่มทั่วไป)

---

## 📞 4. Phone Number Helper (ลิงก์สำหรับการโทรออก)

เพื่อป้องกันการโทรออกผิดพลาดเนื่องจากความแตกต่างของข้อมูลเบอร์โทรศัพท์ในระบบ (เช่น บางเบอร์มีศูนย์นำหน้า บางเบอร์ไม่มี หรือบางเบอร์มีขีดแดช) ให้ใช้ฟังก์ชัน Helper `getTelHref` ในการสร้างลิงก์สำหรับ `href="tel:..."` เสมอ:

```typescript
const getTelHref = (phone: any, fallback: string = '') => {
    const rawPhone = phone || fallback;
    if (!rawPhone) return '#';
    // ลบอักขระที่ไม่ใช่ตัวเลขออกทั้งหมด
    const cleanPhone = rawPhone.toString().replace(/\D/g, ''); 
    // เติมเลข 0 ด้านหน้าหากไม่มี
    const finalPhone = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;
    return `tel:${finalPhone}`;
};
```

**ตัวอย่างการใช้งานในการ์ดหรือปุ่มกด:**
```tsx
// เมื่อมีเบอร์เริ่มต้นสำรอง (Fallback)
href={getTelHref(center.phone, '080-102-7615')}

// เมื่อไม่มีเบอร์สำรอง (ดึงเบอร์ของศูนย์เท่านั้น)
href={getTelHref(center.phone)}
```

---

## 📝 5. กฎระเบียบปฏิบัติ (Best Practices)
1. **การควบคุมสี**: ห้ามนำรหัสสีแปลกปลอมอื่นมาใช้โดยเด็ดขาด หากต้องการความสว่าง/มืด แนะนำให้ใช้ระดับความโปร่งใสของสีแบรนด์ เช่น `bg-[#2b64a0]/10` (Background 10% Opacity)
2. **ขีดจำกัดคลาส**: หลีกเลี่ยงการใช้ `border-blue-500` เคียงคู่กับ `border-indigo-500` ในที่เดียวกัน ให้ยึดสี `blue` เป็นหลักเนื่องจากถูกกำหนดเป็นเฉดสีของแบรนด์แล้ว
3. **การแสดงผล responsive บนมือถือ**: สำหรับส่วนหัวเรื่องย่อย (Sub-titles) หรือ Badge ด้านหลังหัวข้อ ให้ใช้การจัดวางแนวนอนและขนาดที่เหมาะสมเพื่อประหยัดพื้นที่แนวตั้ง (เช่น คลาส `flex-row items-baseline flex-wrap`)
