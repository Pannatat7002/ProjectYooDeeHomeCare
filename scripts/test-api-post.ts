// Test POST endpoints
async function testAPIs() {
    const baseUrl = 'http://localhost:3000';

    console.log('=== Testing Care Center POST ===');
    try {
        const centerData = {
            name: 'Test Care Center',
            brandName: 'Test Brand',
            type: 'โรงพยาบาล',
            address: '123 Test Street',
            phone: '0812345678',
            hasGovernmentCertificate: true,
            lat: 13.7563,
            lng: 100.5018,
            price: 50000,
            packages: [
                { name: 'Basic Package', price: 30000, description: 'Basic care' }
            ]
        };

        const centerRes = await fetch(`${baseUrl}/api/care-centers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(centerData)
        });

        const centerResult = await centerRes.json();
        console.log('Status:', centerRes.status);
        console.log('Response:', centerResult);
    } catch (error) {
        console.error('Error:', error);
    }

    console.log('\n=== Testing Consultation POST ===');
    try {
        const consultationData = {
            name: 'Test User',
            phone: '0898765432',
            roomType: 'ห้องเดี่ยว',
            branch: 'Test Branch',
            budget: '30000-50000',
            convenientTime: 'เช้า',
            lineId: 'testline',
            email: 'test@example.com',
            message: 'This is a test consultation'
        };

        const consultRes = await fetch(`${baseUrl}/api/care-centers/consultations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consultationData)
        });

        const consultResult = await consultRes.json();
        console.log('Status:', consultRes.status);
        console.log('Response:', consultResult);
    } catch (error) {
        console.error('Error:', error);
    }

    console.log('\n=== Testing Contact POST ===');
    try {
        const contactData = {
            name: 'Test Contact',
            email: 'contact@example.com',
            phone: '0887654321',
            message: 'This is a test contact message'
        };

        const contactRes = await fetch(`${baseUrl}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });

        const contactResult = await contactRes.json();
        console.log('Status:', contactRes.status);
        console.log('Response:', contactResult);
    } catch (error) {
        console.error('Error:', error);
    }

    console.log('\n=== Verifying Data ===');
    try {
        const centersRes = await fetch(`${baseUrl}/api/care-centers`);
        const centers = await centersRes.json();
        console.log('Care Centers count:', centers.length);

        const consultsRes = await fetch(`${baseUrl}/api/care-centers/consultations`);
        const consults = await consultsRes.json();
        console.log('Consultations count:', consults.count);

        const contactsRes = await fetch(`${baseUrl}/api/contact`);
        const contacts = await contactsRes.json();
        console.log('Contacts count:', contacts.data.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

testAPIs();
