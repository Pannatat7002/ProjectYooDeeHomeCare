/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSheet, rowsToData } from './googleSheets';

// Helper to format data for Google Sheets (stringify objects/arrays)
const formatRowForSheet = (item: any) => {
    const row: any = {};
    for (const key in item) {
        const value = item[key];
        if (typeof value === 'object' && value !== null) {
            row[key] = JSON.stringify(value);
        } else {
            row[key] = value;
        }
    }
    return row;
};

const saveDataToSheet = async (sheetName: string, data: any[]) => {
    try {
        const sheet = await getSheet(sheetName);
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            await sheet.setHeaderRow(headers);
        }
        await sheet.clearRows();
        const rows = data.map(formatRowForSheet);
        await sheet.addRows(rows);
    } catch (error) {
        console.error(`Error saving to sheet ${sheetName}:`, error);
        throw error;
    }
};

const loadDataFromSheet = async (sheetName: string) => {
    try {
        const sheet = await getSheet(sheetName);
        const rows = await sheet.getRows();
        return rowsToData(rows);
    } catch (error) {
        console.error(`Error loading from sheet ${sheetName}:`, error);
        return [];
    }
};

export const getCareCenters = async () => loadDataFromSheet('CareCenters');
export const saveCareCenters = async (data: any[]) => saveDataToSheet('CareCenters', data);

export const getConsultations = async () => loadDataFromSheet('Consultations');
export const saveConsultations = async (data: any[]) => saveDataToSheet('Consultations', data);

export const getContacts = async () => loadDataFromSheet('Contacts');
export const saveContacts = async (data: any[]) => saveDataToSheet('Contacts', data);

