/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSheet, rowsToData } from './googleSheets';

// --- 1. Helper: Format Data FOR Google Sheets (Save) ---
// แปลง Object/Array เป็น String เพื่อเก็บลง Cell
const formatRowForSheet = (item: any) => {
    const row: any = {};
    for (const key in item) {
        const value = item[key];
        if (value === null || value === undefined) {
            row[key] = ''; // เก็บเป็นค่าว่างแทน null
        } else if (typeof value === 'object') {
            row[key] = JSON.stringify(value); // แปลง array/object เป็น string
        } else {
            row[key] = value;
        }
    }
    return row;
};

// --- 2. Helper: Parse Data FROM Google Sheets (Load) ---
// แปลง String จาก Sheet กลับเป็น Data Type ที่ถูกต้อง (Number, Object, Array)
const parseSheetRow = (row: any) => {
    const formatted: any = {};

    // รายชื่อฟิลด์ที่ควรจะเป็นตัวเลข
    const numberFields = ['price', 'lat', 'lng', 'rating', 'id', 'recipientAge'];

    Object.keys(row).forEach((key) => {
        let value = row[key];

        // 1. ลองแปลง JSON String กลับเป็น Object/Array
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
                value = JSON.parse(value);
            } catch {
                // ถ้า parse ไม่ได้ ก็ให้เป็น string เหมือนเดิม
            }
        }

        // 2. แปลง String เป็น Number (ถ้าอยู่ในรายการ numberFields)
        if (numberFields.includes(key) && value !== '' && !isNaN(Number(value))) {
            value = Number(value);
        }

        // 3. จัดการ Boolean
        if (value === 'TRUE' || value === 'true') value = true;
        if (value === 'FALSE' || value === 'false') value = false;

        formatted[key] = value;
    });

    return formatted;
};

// --- Main Functions ---

/**
 * SAVE (Overwrite): ลบข้อมูลเก่าทั้งหมด แล้วบันทึกข้อมูลใหม่ทับ
 * เหมาะสำหรับ: การแก้ไขข้อมูล (Edit) หรือลบข้อมูล (Delete)
 */
const saveDataToSheet = async (sheetName: string, data: any[]) => {
    try {
        const sheet = await getSheet(sheetName);

        // ถ้าเป็นการ Save ครั้งแรก หรือมีการเปลี่ยน Header
        if (data.length > 0) {
            // Collect ALL unique keys from ALL items, not just the first one
            const allKeys = new Set<string>();
            data.forEach(item => {
                Object.keys(item).forEach(key => allKeys.add(key));
            });
            const headers = Array.from(allKeys);
            await sheet.setHeaderRow(headers);
        }

        // Warning: การ Clear และ Add ใหม่ทั้งหมด
        await sheet.clearRows();

        const rows = data.map(formatRowForSheet);
        await sheet.addRows(rows);

        return true;
    } catch (error) {
        console.error(`Error saving to sheet ${sheetName}:`, error);
        throw error;
    }
};

/**
 * ADD (Append): เพิ่มข้อมูลใหม่ต่อท้ายแถวเดิม
 * เหมาะสำหรับ: ฟอร์มกรอกข้อมูลใหม่ (Register, Contact Form)
 * 
 * ✅ แก้ไขแล้ว: ตรวจสอบและอัพเดท header อัตโนมัติเมื่อมีฟิลด์ใหม่
 */
const addDataToSheet = async (sheetName: string, newItem: any) => {
    try {
        const sheet = await getSheet(sheetName);

        // ตรวจสอบว่ามี header หรือยัง
        let hasHeaders = false;
        let existingHeaders: string[] = [];

        try {
            await sheet.loadHeaderRow();
            hasHeaders = sheet.headerValues && sheet.headerValues.length > 0;
            existingHeaders = sheet.headerValues || [];
        } catch (err) {
            // ถ้า loadHeaderRow() error แสดงว่า Sheet ยังไม่มี header เลย
            console.log(`⚠️  Sheet "${sheetName}" has no headers yet`);
            hasHeaders = false;
        }

        const newItemKeys = Object.keys(newItem);

        // ถ้ายังไม่มี header ให้สร้างจาก keys ของ newItem
        if (!hasHeaders) {
            console.log(`📝 Creating headers for sheet "${sheetName}"...`);
            await sheet.setHeaderRow(newItemKeys);
            console.log(`✅ Headers created:`, newItemKeys);
        } else {
            // ✅ ตรวจสอบว่ามีฟิลด์ใหม่ที่ยังไม่มีใน header หรือไม่
            const missingHeaders = newItemKeys.filter(key => !existingHeaders.includes(key));

            if (missingHeaders.length > 0) {
                console.log(`📝 Found new fields: ${missingHeaders.join(', ')}`);
                console.log(`🔄 Updating headers for sheet "${sheetName}"...`);

                // รวม headers เดิมกับ headers ใหม่
                const updatedHeaders = [...existingHeaders, ...missingHeaders];
                await sheet.setHeaderRow(updatedHeaders);

                console.log(`✅ Headers updated:`, updatedHeaders);
            }
        }

        // เพิ่มแถวใหม่ต่อท้าย
        const row = formatRowForSheet(newItem);
        await sheet.addRow(row);
        console.log(`✅ Row added to sheet "${sheetName}"`);

        return true;
    } catch (error) {
        console.error(`❌ Error adding to sheet ${sheetName}:`, error);
        throw error;
    }
};

const loadDataFromSheet = async (sheetName: string) => {
    try {
        const sheet = await getSheet(sheetName);
        const rows = await sheet.getRows();

        // ใช้ rowsToData และ map ผ่าน parser ของเราอีกที
        const rawData = rowsToData(rows);

        // แปลงข้อมูลให้ Type ถูกต้อง
        return rawData.map((item: any) => parseSheetRow(item));

    } catch (error) {
        console.error(`Error loading from sheet ${sheetName}:`, error);
        return [];
    }
};

// --- Exports ---

// 1. GET (ดึงข้อมูล)
export const getCareCenters = async () => loadDataFromSheet('CareCenters');
export const getConsultations = async () => loadDataFromSheet('Consultations');
export const getContacts = async () => loadDataFromSheet('Contacts');

// 2. SAVE (บันทึกทับ - ใช้เมื่อแก้ไขข้อมูล)
export const saveCareCenters = async (data: any[]) => saveDataToSheet('CareCenters', data);
export const saveConsultations = async (data: any[]) => saveDataToSheet('Consultations', data);
export const saveContacts = async (data: any[]) => saveDataToSheet('Contacts', data);

// 3. ADD (เพิ่มใหม่ - ✅ ใช้ตัวนี้กับฟอร์ม Submit)
export const addCareCenter = async (item: any) => addDataToSheet('CareCenters', item);
export const addConsultation = async (item: any) => addDataToSheet('Consultations', item);
export const addContact = async (item: any) => addDataToSheet('Contacts', item);

// 4. BLOGS
export const getBlogs = async () => loadDataFromSheet('Blogs');
export const saveBlogs = async (data: any[]) => saveDataToSheet('Blogs', data);
export const addBlog = async (item: any) => addDataToSheet('Blogs', item);

// 5. ADMINS
export const getAdmins = async () => loadDataFromSheet('Admins');
export const saveAdmins = async (data: any[]) => saveDataToSheet('Admins', data);
export const addAdmin = async (item: any) => addDataToSheet('Admins', item);

// 6. ADS (โฆษณา)
export const getAds = async () => loadDataFromSheet('Ads');
export const saveAds = async (data: any[]) => saveDataToSheet('Ads', data);
export const addAd = async (item: any) => addDataToSheet('Ads', item);

// --- 7. GENERIC UPDATE/DELETE (เพื่อแก้ปัญหา Row Wipe) ---
const updateRowInSheet = async (sheetName: string, id: number | string, newData: any) => {
    try {
        const sheet = await getSheet(sheetName);
        const rows = await sheet.getRows();
        // Loose equality check for ID (string vs number)
        // Note: row.get('id') works for google-spreadsheet v3/v4 depending on version, 
        // but row['id'] or row.toObject().id is safer if 'id' is a header.
        // google-spreadsheet v4 rows are indexable by header if loaded correctly.
        const row = rows.find(r => r.get('id') == id);
        if (!row) return false;

        // Check for new headers
        await sheet.loadHeaderRow();
        const existingHeaders = sheet.headerValues || [];
        const newItemKeys = Object.keys(newData);
        const missingHeaders = newItemKeys.filter(key => !existingHeaders.includes(key));

        if (missingHeaders.length > 0) {
            console.log(`🔄 Updating headers for sheet "${sheetName}" to include: ${missingHeaders.join(', ')}`);
            await sheet.setHeaderRow([...existingHeaders, ...missingHeaders]);
        }

        const formatted = formatRowForSheet(newData);

        // Use assign if available, otherwise manual set
        if (row.assign) {
            row.assign(formatted);
        } else {
            // สมมติว่า 'row' คือ GoogleSpreadsheetRow ที่คุณค้นพบ
            // และ 'formatted' คืออ็อบเจกต์ที่มี key เป็นชื่อคอลัมน์ (Header) และ value เป็นค่าใหม่
            try {
                // 1. กำหนดค่าใหม่ให้กับแถวโดยใช้ .assign()
                // เมธอด .assign() ใช้เพื่ออัปเดตค่าหลายคอลัมน์
                row.assign(formatted);

                // 2. บันทึกการเปลี่ยนแปลงกลับไปยัง Google Sheet
                await row.save();

                // (หมายเหตุ: .save() เป็น asynchronous, ดังนั้นต้องใช้ await)

            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการอัปเดตแถว:", error);
            }
        }

        await row.save();
        return true;
    } catch (error) {
        console.error(`Error updating row in ${sheetName}:`, error);
        throw error;
    }
};

const deleteRowInSheet = async (sheetName: string, id: number | string) => {
    try {
        const sheet = await getSheet(sheetName);
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') == id);

        if (row) {
            await row.delete();
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error deleting row in ${sheetName}:`, error);
        throw error;
    }
};

export const updateBlog = async (id: number | string, data: any) => updateRowInSheet('Blogs', id, data);
export const deleteBlog = async (id: number | string) => deleteRowInSheet('Blogs', id);
