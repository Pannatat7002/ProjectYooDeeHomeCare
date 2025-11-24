const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDM/Wti9XaN1l0c\n+QkOmnhDbKKKu5tyagUCWlVvCuQk+Z0TH5FzYndp2iOhvhr6W89zw5XdBB4Bo5Bq\nHcLhnE2xOTCs69v6OpjfiqBafefBFPRuyDDgyRqDZOToOzIjM/7yS1KUgwHuiXgd\ndE2101M1pmZhrSjM91cw9etLqrYGY/5VkpeorTmK6hMduC+LexHzKUkfwICLDPMX\ng7m/9X6JXJJUylnbwkfy/qOcUEyXOAGhiO31+ldvSU2DrdN80bacWsq1/m86KTFY\nwYylT4XB7J9vw1zqTe1F4bDmWuD3n+uKdwd40kFSKVKX0dlhpO50oNRyrmdYRx32\nF2eLh3bHAgMBAAECggEAF+5h8gycCZUEC9TbBNRtw9lT5IRgcmwEJ7EqFiucVOC7\nQLdHwMO3Eyl/TWunNKExR9+GiGXppuFUg77zuGkJ/O2jTBzA8qaSoE5LyCS4wKbU\nnnZKloODz+EghCgdA1UXp2u5uVLOD+4GktG4HMkOBs5lV3PitoMNr86V6KCGXZpr\nYupRsCJDoIhN2/BiQN44RHQIpYgR3HlCtln35D7RsOn3GQcsyEaW+xunJePIYBfW\nJlo0N59yE5BdN5IFeSUJWzLBshZPSxDje49DNY5a6gpv3BchQ+yT/sg1XsRC7EAI\nX7nBf0aA/TRlSnz8aRZM0kjRUGbO1AE2m7Bwec87sQKBgQDlY6Dd0tPwfpxucaH+\nD6JeE3VYGcnhs348TeWGN4Mn9BsJN1xDiH+qflHs+rlU4jwxZdPePn3owR/ADWCZ\n6y+YsWjH8dt86Sem7ssqvrIzBPqztMahWkgmHKf15C7wlIg+KqNAZQrYIyH0L1qW\nia4L0kAz7IH/TG/YyrQnSR+ufwKBgQDkxS9fNh0mSk5u5PXDsbNj+6pEr+GPqqaH\n9P4OHjA5WSP09KrBhfj+xEEIFl3GsVRW74H7nP9NnzDryYIF1axWuXRoHumVfJkP\nqzei89h/ZLvJUPQwRKSlsHZ0aM4HMIDA0o5f9Be0i255lMppa5CRk0yZH0fnEMIR\n2HkYO7kjuQKBgQDKvTJZu9OL9CtIRfB5vtGvuhz1X92ZOO4yWFqrNHccIdifXamT\nGppTUtAP1k1lI4s10ZzfCXZ49++a63fcsgvgNbS5Ox7VmLBuDxHL1r1i8Fyv5e/E\nfinUXXFpl2KRSYXdBAxDhsp92xdQXWYANPF6Czqpabg/rwwPnKB7NFrm+wKBgD46\nkRdCHg3DWrB5oYyY8uY4l+lVOnMdBW2oK89lUNLYt5ozT5uSuNd8RQBRLTMWG44G\nWoI6A4x2yBTrXG3/4IA6tDp6ZimemfgUJ+8wi2yj1xz841+Z3Huhk6c4twpnnC5X\nWBkryaL35pY17hVdCBdBTS29v45QFapLCy2XWVYpAoGBAIrDdtYXRvr6s5NeGYqG\n5bMxE+lKLwJn89b0HlcEbdwxR5LvjTPizkXoREOWZ523u/3m88tV6tApKEti9JOZ\nkuiWRcAKoTrESaGTxDDA/zv5M5gWNzTf4OItoAyAGhYCt1mjnVxGwDlReo0zOPSm\nFqCrgYpHyugd6l6dzOhxWANk\n-----END PRIVATE KEY-----\n`;

const SHEET_ID = "1TQ_pBwT7r1KCY2h5pZ3LDDofhIUSucbduGxI891fEIc";
const CLIENT_EMAIL = "yoodeehomecare@excare-service-project.iam.gserviceaccount.com";

async function simpleTest() {
    try {
        console.log('Testing Google Sheets...');

        const serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

        console.log('Loading document...');
        await doc.loadInfo();
        console.log('✅ Success! Title:', doc.title);
        console.log('Sheets:', doc.sheetsByIndex.map(s => s.title).join(', '));

        // Try to get CareCenters sheet
        let sheet = doc.sheetsByTitle['CareCenters'];
        if (!sheet) {
            console.log('CareCenters sheet not found, creating...');
            sheet = await doc.addSheet({ title: 'CareCenters' });
        }

        console.log('CareCenters sheet rows:', sheet.rowCount);
        const rows = await sheet.getRows();
        console.log('Data rows:', rows.length);

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
    }
}

simpleTest();
