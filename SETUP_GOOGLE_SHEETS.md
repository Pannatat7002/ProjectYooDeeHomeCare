# Google Sheets Database Setup Guide

To switch the database to Google Sheets, please follow these steps:

## 1. Create a Google Cloud Project & Service Account
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Google Sheets API** for your project.
4. Go to **IAM & Admin** > **Service Accounts**.
5. Create a new Service Account.
6. Create a JSON key for this service account and download it.
7. Open the JSON key file and copy the `client_email` and `private_key`.

## 2. Create a Google Sheet
1. Create a new Google Sheet.
2. Rename the tabs (sheets) to exactly:
   - `CareCenters`
   - `Consultations`
   - `Contacts`
3. Share this Google Sheet with the `client_email` from your Service Account (give "Editor" access).
4. Copy the **Spreadsheet ID** from the URL (it's the long string between `/d/` and `/edit`).

## 3. Configure Environment Variables
Create a file named `.env.local` in the root of your project (if it doesn't exist) and add the following:

```env
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_CLIENT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Note:** For the `GOOGLE_PRIVATE_KEY`, make sure to include the entire key string, including the `\n` characters. If you are pasting it, ensure it is enclosed in double quotes.

## 4. Migrate Data
Once the configuration is done, you can migrate your existing data from the JSON files to the Google Sheet by running:

```bash
npx tsx --env-file=.env.local scripts/migrate-to-sheets.ts
```

This will read data from `db.json`, `consultations.json`, and `contacts.json` and upload it to your Google Sheet.

## 5. Restart the Server
Restart your development server to apply the changes:

```bash
npm run dev
```
