/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');
const CONSULTATIONS_PATH = path.join(process.cwd(), 'consultations.json');

export const loadDataFromFile = <T>(filePath: string): T[] => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return data.trim() ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.error(`Error reading file ${path.basename(filePath)}:`, error);
        return [];
    }
};

export const saveDataToFile = <T>(filePath: string, data: T[]) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to file ${path.basename(filePath)}:`, error);
    }
};

export const getCareCenters = () => loadDataFromFile<any>(DB_PATH);
export const saveCareCenters = (data: any[]) => saveDataToFile(DB_PATH, data);

export const getConsultations = () => loadDataFromFile<any>(CONSULTATIONS_PATH);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveConsultations = (data: any[]) => saveDataToFile(CONSULTATIONS_PATH, data);

const CONTACTS_PATH = path.join(process.cwd(), 'contacts.json');
export const getContacts = () => loadDataFromFile<any>(CONTACTS_PATH);
export const saveContacts = (data: any[]) => saveDataToFile(CONTACTS_PATH, data);
