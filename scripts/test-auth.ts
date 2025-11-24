// import { JWT } from 'google-auth-library';
// import { PRIVATE_KEY, SHEET_ID, CLIENT_EMAIL } from '../src/secrets';

// async function testAuth() {
//     console.log('=== Testing Google Sheets Authentication ===\n');

//     console.log('1. Checking credentials...');
//     console.log('   SHEET_ID:', SHEET_ID);
//     console.log('   CLIENT_EMAIL:', CLIENT_EMAIL);
//     console.log('   PRIVATE_KEY length:', PRIVATE_KEY.length);
//     console.log('   PRIVATE_KEY starts with:', PRIVATE_KEY.substring(0, 30));

//     try {
//         console.log('\n2. Creating JWT...');
//         const serviceAccountAuth = new JWT({
//             email: CLIENT_EMAIL,
//             key: PRIVATE_KEY.replace(/\\n/g, '\n'),
//             scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//         });
//         console.log('✅ JWT created successfully');

//         console.log('\n3. Testing authorization...');
//         await serviceAccountAuth.authorize();
//         console.log('✅ Authorization successful!');

//         console.log('\n4. Getting access token...');
//         const token = await serviceAccountAuth.getAccessToken();
//         console.log('✅ Access token obtained:', token.token?.substring(0, 20) + '...');

//     } catch (error: any) {
//         console.error('\n❌ Error:', error.message);
//         if (error.response) {
//             console.error('Response status:', error.response.status);
//             console.error('Response data:', JSON.stringify(error.response.data, null, 2));
//         }
//     }
// }

// testAuth();
