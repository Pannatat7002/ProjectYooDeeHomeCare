// Test Google Sheets connection and data retrieval
const { getConsultations, addConsultation } = '../src/lib/db';

async function testGoogleSheets() {
    try {
        console.log('🧪 Testing Google Sheets Connection...\n');

        // 1. Test reading consultations
        console.log('📖 Reading existing consultations...');
        const consultations = await getConsultations();
        console.log(`✅ Found ${consultations.length} consultations`);

        if (consultations.length > 0) {
            console.log('\n📋 Latest consultation:');
            console.log(JSON.stringify(consultations[consultations.length - 1], null, 2));
        }

        // 2. Test adding a new consultation
        console.log('\n📝 Adding test consultation...');
        const testConsultation = {
            id: Date.now(),
            name: "TEST USER",
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

        await addConsultation(testConsultation);
        console.log('✅ Test consultation added successfully!');

        // 3. Verify the data was added
        console.log('\n🔍 Verifying data was saved...');
        const updatedConsultations = await getConsultations();
        console.log(`✅ Now have ${updatedConsultations.length} consultations`);

        const lastConsultation = updatedConsultations[updatedConsultations.length - 1];
        console.log('\n📋 Last consultation in sheet:');
        console.log(JSON.stringify(lastConsultation, null, 2));

        if (lastConsultation.id === testConsultation.id) {
            console.log('\n✅ TEST PASSED: Data successfully saved to Google Sheets!');
        } else {
            console.log('\n⚠️  WARNING: Latest consultation ID does not match test data');
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        console.error('Error details:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

testGoogleSheets();
