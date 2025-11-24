import { doc, getSheet, rowsToData } from '../src/lib/googleSheets';

async function debugSheets() {
    console.log('=== Debugging Google Sheets Connection ===\n');

    try {
        console.log('1. Loading document info...');
        await doc.loadInfo();
        console.log('✅ Document loaded successfully!');
        console.log('   Title:', doc.title);
        console.log('   Sheet count:', doc.sheetCount);
        console.log('   Sheets:', doc.sheetsByIndex.map((s: any) => s.title).join(', '));

        console.log('\n2. Checking CareCenters sheet...');
        const careCentersSheet = await getSheet('CareCenters');
        console.log('✅ CareCenters sheet accessed');
        console.log('   Row count:', careCentersSheet.rowCount);
        console.log('   Column count:', careCentersSheet.columnCount);
        console.log('   Headers:', careCentersSheet.headerValues);

        const rows = await careCentersSheet.getRows();
        console.log('   Data rows:', rows.length);

        if (rows.length > 0) {
            console.log('\n   First row data:');
            const data = rowsToData([rows[0]]);
            console.log(JSON.stringify(data[0], null, 2));
        }

        console.log('\n3. Checking Consultations sheet...');
        const consultationsSheet = await getSheet('Consultations');
        console.log('✅ Consultations sheet accessed');
        console.log('   Row count:', consultationsSheet.rowCount);
        console.log('   Headers:', consultationsSheet.headerValues);
        const consultRows = await consultationsSheet.getRows();
        console.log('   Data rows:', consultRows.length);

        console.log('\n4. Checking Contacts sheet...');
        const contactsSheet = await getSheet('Contacts');
        console.log('✅ Contacts sheet accessed');
        console.log('   Row count:', contactsSheet.rowCount);
        console.log('   Headers:', contactsSheet.headerValues);
        const contactRows = await contactsSheet.getRows();
        console.log('   Data rows:', contactRows.length);

        console.log('\n✅ All sheets are accessible!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
        console.error('\nFull error:', error);
    }
}

debugSheets();
