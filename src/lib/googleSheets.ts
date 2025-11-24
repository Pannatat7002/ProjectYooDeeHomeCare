/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { PRIVATE_KEY, SHEET_ID, CLIENT_EMAIL } from '../secrets';

// 1. ตั้งค่าการยืนยันตัวตน (Authentication)
const serviceAccountAuth = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, '\n'), // แก้ปัญหา \n ใน Vercel/Next.js
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

// 2. Helper: ดึง Sheet ตามชื่อ (ถ้าไม่มีจะสร้างใหม่)
export const getSheet = async (title: string) => {
    try {
        await doc.loadInfo(); // โหลดข้อมูล Spreadsheet
        let sheet = doc.sheetsByTitle[title];
        if (!sheet) {
            sheet = await doc.addSheet({ title });
        }
        return sheet;
    } catch (error) {
        console.error('Error loading Google Sheet:', error);
        throw error;
    }
};

// 3. Helper: แปลง Rows จาก Google Sheets เป็น JSON Data ปกติ
// (ปรับปรุงใหม่: แปลงตัวเลขและ JSON อัตโนมัติ)
export const rowsToData = (rows: any[]) => {
    return rows.map((row) => {
        // ใช้ toObject() แทน _header เพื่อความเข้ากันได้กับทุกเวอร์ชัน
        const rawObj = row.toObject ? row.toObject() : row;
        const obj: any = {};

        // วนลูปผ่านทุก key ใน object
        Object.keys(rawObj).forEach((header: string) => {
            let value = rawObj[header];

            // A. แปลง JSON String (สำหรับ Array/Object ที่เก็บใน Cell)
            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                try {
                    value = JSON.parse(value);
                } catch {
                    // ถ้า parse ไม่ผ่าน ให้เก็บเป็น string เหมือนเดิม
                }
            }

            // B. แปลง Boolean
            if (value === 'TRUE') value = true;
            if (value === 'FALSE') value = false;

            // C. แปลง Number (เพิ่มใหม่ ✅)
            // เช็คว่าเป็นตัวเลขหรือไม่ และต้องไม่ใช่ค่าว่าง
            if (!isNaN(Number(value)) && value !== '') {
                // ข้อยกเว้น: ถ้าเป็นเบอร์โทรศัพท์ (ขึ้นต้นด้วย 0 และยาว) อย่าแปลงเป็น number เพราะเลข 0 นำหน้าจะหาย
                const isPhoneNumber = typeof value === 'string' && value.startsWith('0') && value.length > 8;

                if (!isPhoneNumber) {
                    value = Number(value);
                }
            }

            obj[header] = value;
        });

        return obj;
    });
};

// 4. Helper: บันทึกข้อมูลการสมัครเป็นผู้ให้บริการ
export const appendProviderSignup = async (data: any) => {
    try {
        const sheet = await getSheet('ProviderSignups');

        // ตั้งค่า Header ถ้ายังไม่มี
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
            await sheet.setHeaderRow([
                'timestamp',
                'centerName',
                'ownerName',
                'phone',
                'email',
                'lineId',
                'address',
                'subdistrict',
                'district',
                'province',
                'postalCode',
                'centerType',
                'capacity',
                'services',
                'description',
                'status'
            ]);
        }

        // เพิ่มแถวใหม่
        await sheet.addRow(data);
        return { success: true };
    } catch (error) {
        console.error('Error appending provider signup:', error);
        throw error;
    }
};