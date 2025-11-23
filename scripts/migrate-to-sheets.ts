import fs from 'fs';
import path from 'path';
import { saveCareCenters, saveConsultations, saveContacts } from '../src/lib/db';

const DB_PATH = path.join(process.cwd(), 'db.json');
const CONSULTATIONS_PATH = path.join(process.cwd(), 'consultations.json');
const CONTACTS_PATH = path.join(process.cwd(), 'contacts.json');

const loadDataFromFile = (filePath: string) => {
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

async function migrate() {
    console.log('Starting migration...');

    // Check if env vars are present
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.error('Missing Google Sheets credentials in environment variables.');
        console.error('Please ensure .env.local is created and you run this script with:');
        console.error('npx tsx --env-file=.env.local scripts/migrate-to-sheets.ts');
        process.exit(1);
    }

    const careCenters = loadDataFromFile(DB_PATH);
    console.log(`Found ${careCenters.length} care centers.`);
    if (careCenters.length > 0) {
        await saveCareCenters(careCenters);
        console.log('Saved care centers to Google Sheet.');
    }

    const consultations = loadDataFromFile(CONSULTATIONS_PATH);
    console.log(`Found ${consultations.length} consultations.`);
    if (consultations.length > 0) {
        await saveConsultations(consultations);
        console.log('Saved consultations to Google Sheet.');
    }

    const contacts = loadDataFromFile(CONTACTS_PATH);
    console.log(`Found ${contacts.length} contacts.`);
    if (contacts.length > 0) {
        await saveContacts(contacts);
        console.log('Saved contacts to Google Sheet.');
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);
