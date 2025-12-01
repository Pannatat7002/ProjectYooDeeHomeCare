// Simple test to add consultation with new fields
import { addConsultation, getConsultations } from '../src/lib/db';

async function quickTest() {
    console.log('🧪 Quick Test: Adding consultation with all fields...\n');

    const testData = {
        id: Date.now(),
        name: "QUICK TEST",
        contactName: "QUICK TEST",
        phone: "0888888888",
        lineId: "quicktest",
        email: "quick@test.com",
        recipientName: "Test Patient",
        recipientAge: 80,
        relationshipToRecipient: "บุตร",
        roomType: "ห้องเดี่ยว",
        branch: "Quick Test Branch",
        budget: "มากกว่า 30,000",
        convenientTime: "ช่วงเย็น (17:00 - 20:00)",
        message: "Quick test message",
        status: "pending",
        submittedAt: new Date().toISOString(),
    };

    console.log('📝 Adding consultation...');
    await addConsultation(testData);

    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n📖 Reading back...');
    const all = await getConsultations();
    const last = all[all.length - 1];

    console.log('\n📋 Last consultation:');
    console.log('ID:', last.id);
    console.log('Name:', last.name);
    console.log('Contact Name:', last.contactName);
    console.log('Recipient Name:', last.recipientName);
    console.log('Recipient Age:', last.recipientAge);
    console.log('Relationship:', last.relationshipToRecipient);
    console.log('Phone:', last.phone);

    const hasAllFields = last.recipientName && last.recipientAge && last.relationshipToRecipient;

    if (hasAllFields) {
        console.log('\n✅ SUCCESS: All new fields are saved!');
    } else {
        console.log('\n❌ FAILED: Some fields are missing');
        console.log('Full data:', JSON.stringify(last, null, 2));
    }
}

quickTest().catch(console.error);
