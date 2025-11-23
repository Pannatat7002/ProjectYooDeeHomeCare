import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error('Google Sheets credentials are missing in environment variables.');
}

const serviceAccountAuth = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(SPREADSHEET_ID as string, serviceAccountAuth);

export const getSheet = async (title: string) => {
    try {
        await doc.loadInfo();
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

export const rowsToData = (rows: any[]) => {
    return rows.map((row) => {
        const obj: any = {};
        row._header.forEach((header: string) => {
            let value = row.get(header);
            // Attempt to parse JSON for complex fields
            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                try {
                    value = JSON.parse(value);
                } catch {
                    // keep as string if parse fails
                }
            }
            // Convert "TRUE"/"FALSE" strings to booleans if needed, or rely on JSON parse
            if (value === 'TRUE') value = true;
            if (value === 'FALSE') value = false;

            obj[header] = value;
        });
        return obj;
    });
};
