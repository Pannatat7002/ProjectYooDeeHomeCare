
import { getCareCenters, getConsultations, getContacts } from '../src/lib/db';

async function check() {
    console.log('Checking Google Sheets connection...');

    try {
        console.log('Fetching Care Centers...');
        const centers = await getCareCenters();
        console.log(`Success! Found ${centers.length} care centers.`);
        if (centers.length > 0) {
            console.log('First center:', centers[0]);
        }

        console.log('Fetching Consultations...');
        const consultations = await getConsultations();
        console.log(`Success! Found ${consultations.length} consultations.`);

        console.log('Fetching Contacts...');
        const contacts = await getContacts();
        console.log(`Success! Found ${contacts.length} contacts.`);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

check();
