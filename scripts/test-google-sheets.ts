// Test Google Sheets connection and data retrieval
import { getConsultations, addConsultation } from '../src/lib/db';

async function testGoogleSheets() {
    try {
        console.log('🧪 Testing Google Sheets Connection...\n');

        // 1. Test reading consultations
        console.log('📖 Reading existing consultations...');
        const consultations = await getConsultations();
        console.log(`✅ Found ${consultations.length} consultations`);

        if (consultations.length > 0) {
            console.log('\n📋 Latest 3 consultations:');
            const latest = consultations.slice(-3);
            latest.forEach((c, idx) => {
                console.log(`\n${idx + 1}. ID: ${c.id}`);
                console.log(`   Name: ${c.name || c.contactName}`);
                console.log(`   Phone: ${c.phone}`);
                console.log(`   Branch: ${c.branch}`);
                console.log(`   Submitted: ${c.submittedAt}`);
            });
        }

        // 2. Test adding a new consultation
        console.log('\n📝 Adding test consultation...');
        const testConsultation = {
            id: Date.now(),
            name: "TEST USER - " + new Date().toLocaleTimeString('th-TH'),
            contactName: "TEST USER",
            phone: "0999999999",
            lineId: "testline",
            email: "test@example.com",
            recipientName: "Test Recipient",
            recipientAge: 75,
            relationshipToRecipient: "ลูก",
            roomType: "ห้องเดี่ยว",
            branch: "Test Branch",
            budget: "20,000 - 30,000",
            convenientTime: "ช่วงเช้า (9:00 - 12:00)",
            message: "This is a test message",
            status: "pending",
            submittedAt: new Date().toISOString(),
        };

        console.log('Test data:', JSON.stringify(testConsultation, null, 2));

        await addConsultation(testConsultation);
        console.log('✅ Test consultation added successfully!');

        // 3. Wait a bit for Google Sheets to process
        console.log('\n⏳ Waiting 2 seconds for Google Sheets to update...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 4. Verify the data was added
        console.log('\n🔍 Verifying data was saved...');
        const updatedConsultations = await getConsultations();
        console.log(`✅ Now have ${updatedConsultations.length} consultations (was ${consultations.length})`);

        const lastConsultation = updatedConsultations[updatedConsultations.length - 1];
        console.log('\n📋 Last consultation in sheet:');
        console.log(JSON.stringify(lastConsultation, null, 2));

        if (lastConsultation.id === testConsultation.id) {
            console.log('\n✅ TEST PASSED: Data successfully saved to Google Sheets!');
        } else {
            console.log('\n⚠️  WARNING: Latest consultation ID does not match test data');
            console.log(`Expected ID: ${testConsultation.id}`);
            console.log(`Got ID: ${lastConsultation.id}`);
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
    }
}

testGoogleSheets();
