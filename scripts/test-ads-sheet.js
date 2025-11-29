// Test script to verify Google Sheets connection and Ads sheet
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Import from secrets (you'll need to update these values)
const SHEET_ID = "1TQ_pBwT7r1KCY2h5pZ3LDDofhIUSucbduGxI891fEIc";

async function testAdsSheet() {
    try {
        console.log('🔍 Testing Google Sheets connection...');
        console.log('📋 Sheet ID:', SHEET_ID);

        // Note: You need to set environment variables or update this
        const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
        const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!CLIENT_EMAIL || !PRIVATE_KEY) {
            console.error('❌ Missing credentials. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables');
            return;
        }

        const serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

        console.log('📡 Loading spreadsheet info...');
        await doc.loadInfo();
        console.log('✅ Connected to:', doc.title);

        // Check if Ads sheet exists
        let adsSheet = doc.sheetsByTitle['Ads'];

        if (!adsSheet) {
            console.log('⚠️  "Ads" sheet not found. Creating it...');
            adsSheet = await doc.addSheet({ title: 'Ads' });
            console.log('✅ Created "Ads" sheet');
        } else {
            console.log('✅ "Ads" sheet exists');
        }

        // Get rows
        const rows = await adsSheet.getRows();
        console.log(`📊 Current rows in Ads sheet: ${rows.length}`);

        if (rows.length > 0) {
            console.log('📝 Sample data:');
            rows.slice(0, 3).forEach((row, i) => {
                console.log(`  Row ${i + 1}:`, row.toObject());
            });
        }

        console.log('\n✅ Test completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAdsSheet();
