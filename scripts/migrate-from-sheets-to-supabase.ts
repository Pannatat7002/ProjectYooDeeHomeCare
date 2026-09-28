import fs from 'fs';
import path from 'path';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { PRIVATE_KEY, SHEET_ID, CLIENT_EMAIL } from '../src/secrets';

// 1. Load environment variables from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        });
    }
} catch (e) {
    console.warn('Warning: Could not read .env.local:', e);
}

// 2. Helpers for Data Cleaning & Normalization
const toBool = (val: any, defaultVal = false): boolean => {
    if (val === undefined || val === null || val === '') return defaultVal;
    if (typeof val === 'boolean') return val;
    const str = String(val).trim().toUpperCase();
    return str === 'TRUE' || str === '1' || str === 'YES';
};

const toJson = (val: any, defaultVal: any = []): any => {
    if (val === undefined || val === null || val === '') return defaultVal;
    if (typeof val === 'object') return val;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
            try {
                return JSON.parse(trimmed);
            } catch {
                return defaultVal;
            }
        }
    }
    return defaultVal;
};

const toNum = (val: any, defaultVal: number | null = null): number | null => {
    if (val === undefined || val === null || val === '') return defaultVal;
    const num = Number(val);
    return isNaN(num) ? defaultVal : num;
};

const toDateIso = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    const d = typeof val === 'string' || typeof val === 'number' || val instanceof Date
        ? new Date(val)
        : new Date(String(val));
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

// 3. Batch upsert helper
async function batchUpsert(
    supabaseAdmin: any,
    tableName: string,
    items: any[],
    batchSize = 100,
    conflictTarget = 'id'
) {
    console.log(`\n📦 Migrating "${tableName}": Total ${items.length} records...`);
    let successCount = 0;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const { error } = await supabaseAdmin
            .from(tableName)
            .upsert(batch, { onConflict: conflictTarget });

        if (error) {
            console.error(`❌ Error upserting batch ${i} - ${i + batch.length} in "${tableName}":`, error.message);
            // Try single item insertion to isolate bad record if batch fails
            for (const item of batch) {
                const { error: singleError } = await supabaseAdmin
                    .from(tableName)
                    .upsert([item], { onConflict: conflictTarget });
                if (singleError) {
                    console.error(`   Failed item (ID: ${item.id}):`, singleError.message);
                } else {
                    successCount++;
                }
            }
        } else {
            successCount += batch.length;
            process.stdout.write(`   ✓ Progress: ${successCount} / ${items.length}\r`);
        }
    }

    console.log(`\n✅ Completed "${tableName}": ${successCount} / ${items.length} successfully migrated.`);
    return successCount;
}

// 4. Main Migration Function
async function migrateAll() {
    console.log('====================================================');
    console.log('🚀 Starting Data Migration: Google Sheets -> Supabase');
    console.log('====================================================');

    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured. Check .env.local');
    }

    // Connect to Google Sheets
    console.log('\nConnecting to Google Sheets...');
    const serviceAccountAuth = new JWT({
        email: CLIENT_EMAIL,
        key: PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    console.log(`Connected to Google Spreadsheet: "${doc.title}"`);

    // --- A. CARE CENTERS ---
    const careCentersSheet = doc.sheetsByTitle['CareCenters'];
    if (careCentersSheet) {
        await careCentersSheet.loadHeaderRow();
        const rows = await careCentersSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                name: (row.name || '').trim(),
                address: row.address || '',
                province: row.province || '',
                lat: toNum(row.lat, 0),
                lng: toNum(row.lng, 0),
                price: toNum(row.price, 0),
                type: row.type || 'both',
                rating: toNum(row.rating, 5),
                phone: row.phone ? String(row.phone).trim() : '',
                website: row.website || '',
                map_url: row.mapUrl || '',
                image_urls: toJson(row.imageUrls, []),
                description: row.description || '',
                services: toJson(row.services, []),
                packages: toJson(row.packages, []),
                room_types: toJson(row.roomTypes, []),
                has_government_certificate: toBool(row.hasGovernmentCertificate, false),
                brand_name: row.brandName || '',
                brand_logo_url: row.brandLogoUrl || '',
                is_partner: toBool(row.isPartner, false),
                status: (row.utmSource || '').trim() ? (row.status || 'visible') : 'hidden',
                utm_source: row.utmSource || '',
                utm_medium: row.utmMedium || '',
                utm_campaign: row.utmCampaign || '',
                created_at: toDateIso(row.createdAt)
            };
        }).filter(item => item.id !== null && item.name !== '');

        await batchUpsert(supabaseAdmin, 'care_centers', records, 100);
    }

    // --- B. CONSULTATIONS ---
    const consultationsSheet = doc.sheetsByTitle['Consultations'];
    if (consultationsSheet) {
        await consultationsSheet.loadHeaderRow();
        const rows = await consultationsSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                name: row.name || '',
                phone: row.phone ? String(row.phone).trim() : '',
                email: row.email || '',
                line_id: row.lineId || '',
                contact_name: row.contactName || '',
                recipient_name: row.recipientName || '',
                recipient_age: toNum(row.recipientAge, 0),
                relationship_to_recipient: row.relationshipToRecipient || '',
                branch: row.branch || '',
                budget: row.budget || '',
                room_type: row.roomType || '',
                convenient_time: row.convenientTime || '',
                message: row.message || '',
                status: row.status || 'pending',
                submitted_at: toDateIso(row.submittedAt)
            };
        }).filter(item => item.id !== null);

        await batchUpsert(supabaseAdmin, 'consultations', records, 50);
    }

    // --- C. CONTACTS ---
    const contactsSheet = doc.sheetsByTitle['Contacts'];
    if (contactsSheet) {
        await contactsSheet.loadHeaderRow();
        const rows = await contactsSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                name: row.name || '',
                email: row.email || '',
                phone: row.phone ? String(row.phone).trim() : '',
                subject: row.subject || '',
                message: row.message || '',
                status: row.status || 'unread',
                submitted_at: toDateIso(row.submittedAt)
            };
        }).filter(item => item.id !== null);

        await batchUpsert(supabaseAdmin, 'contacts', records, 50);
    }

    // --- D. BLOGS ---
    const blogsSheet = doc.sheetsByTitle['Blogs'];
    if (blogsSheet) {
        await blogsSheet.loadHeaderRow();
        const rows = await blogsSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                title: row.title || '',
                slug: row.slug || `blog-${id}`,
                excerpt: row.excerpt || '',
                content: row.content || '',
                cover_image: row.coverImage || '',
                author: row.author || '',
                tags: toJson(row.tags, []),
                is_published: toBool(row.isPublished, true),
                is_recent: toBool(row.isRecent, false),
                is_featured: toBool(row.isFeatured, false),
                created_at: toDateIso(row.createdAt),
                updated_at: toDateIso(row.updatedAt)
            };
        }).filter(item => item.id !== null && item.title !== '');

        await batchUpsert(supabaseAdmin, 'blogs', records, 50);
    }

    // --- E. ADS ---
    const adsSheet = doc.sheetsByTitle['Ads'];
    if (adsSheet) {
        await adsSheet.loadHeaderRow();
        const rows = await adsSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                image_url: row.imageUrl || '',
                link_url: row.linkUrl || '',
                title: row.title || '',
                description: row.description || '',
                created_at: toDateIso(row.createdAt)
            };
        }).filter(item => item.id !== null && item.image_url !== '');

        await batchUpsert(supabaseAdmin, 'ads', records, 50);
    }

    // --- F. ADMINS ---
    const adminsSheet = doc.sheetsByTitle['Admins'];
    if (adminsSheet) {
        await adminsSheet.loadHeaderRow();
        const rows = await adminsSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                username: (row.username || '').trim(),
                password: row.password || '',
                email: row.email || '',
                full_name: row.fullName || '',
                role: row.role || 'admin',
                is_active: toBool(row.isActive, true),
                created_at: toDateIso(row.createdAt),
                last_login: row.lastLogin ? toDateIso(row.lastLogin) : null
            };
        }).filter(item => item.id !== null && item.username !== '');

        await batchUpsert(supabaseAdmin, 'admins', records, 50, 'username');
    }

    // --- G. TRAFFIC LOGS ---
    const trafficSheet = doc.sheetsByTitle['Traffic'];
    if (trafficSheet) {
        await trafficSheet.loadHeaderRow();
        const rows = await trafficSheet.getRows();
        const records = rows.map((r) => {
            const row: any = r.toObject ? r.toObject() : r;
            const id = toNum(row.id);
            return {
                id: id,
                timestamp: toDateIso(row.timestamp),
                event_type: row.eventType || 'page_view',
                page_path: row.pagePath || '/',
                center_id: toNum(row.centerId, null),
                center_name: row.centerName || '',
                utm_source: row.utmSource || '',
                utm_medium: row.utmMedium || '',
                utm_campaign: row.utmCampaign || '',
                referrer: row.referrer || '',
                user_agent: row.userAgent || '',
                ip: row.ip || ''
            };
        }).filter(item => item.id !== null);

        await batchUpsert(supabaseAdmin, 'traffic', records, 100);
    }

    console.log('\n====================================================');
    console.log('🎉 Google Sheets data migration to Supabase finished!');
    console.log('====================================================\n');
}

migrateAll().catch((err) => {
    console.error('\n❌ Fatal Migration Error:', err);
    process.exit(1);
});
