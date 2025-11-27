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
    const numberFields = ['price', 'lat', 'lng', 'rating', 'id'];

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
 */
const addDataToSheet = async (sheetName: string, newItem: any) => {
    try {
        const sheet = await getSheet(sheetName);

        // ถ้า Sheet ยังว่างอยู่ ให้ตั้ง Header ก่อน
        const rows = await sheet.getRows();
        if (rows.length === 0) {
            const headers = Object.keys(newItem);
            await sheet.setHeaderRow(headers);
        }

        // เพิ่มแถวใหม่ต่อท้าย
        const row = formatRowForSheet(newItem);
        await sheet.addRow(row);

        return true;
    } catch (error) {
        console.error(`Error adding to sheet ${sheetName}:`, error);
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