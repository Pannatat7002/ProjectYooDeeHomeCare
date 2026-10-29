import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { revalidateTag } from 'next/cache';
import { INITIAL_HOSPITALS, findTopNearbyHospitals } from './hospitalProximity';


// --- 1. Helper: Convert camelCase (frontend/app) to snake_case (PostgreSQL DB) ---
export const toSnakeCase = (obj: any): any => {
    if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }
    const result: any = {};
    const numericFields = ['id', 'price', 'lat', 'lng', 'rating', 'recipient_age', 'center_id', 'recipientAge', 'centerId', 'moph_order', 'mophOrder', 'closed_package_price', 'closedPackagePrice', 'center_commission_amount', 'centerCommissionAmount', 'advisor_incentive_amount', 'advisorIncentiveAmount', 'default_incentive_rate', 'defaultIncentiveRate'];
    const booleanFields = ['has_commission', 'has_single_room', 'has_shared_room', 'hasCommission', 'hasSingleRoom', 'hasSharedRoom', 'is_published', 'isPublished', 'has_government_certificate', 'hasGovernmentCertificate', 'is_active', 'isActive'];
    for (const key of Object.keys(obj)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        let val = obj[key];
        if (numericFields.includes(key) || numericFields.includes(snakeKey)) {
            if (val === '' || val === undefined) {
                val = null;
            } else if (val !== null && !isNaN(Number(val))) {
                val = Number(val);
            }
        } else if (booleanFields.includes(key) || booleanFields.includes(snakeKey)) {
            if (typeof val === 'string') {
                if (val.toLowerCase() === 'true') val = true;
                else if (val.toLowerCase() === 'false') val = false;
            } else if (val !== undefined && val !== null) {
                val = Boolean(val);
            }
        }
        result[snakeKey] = val;
    }
    return result;
};

// --- 2. Helper: Convert snake_case (PostgreSQL DB) to camelCase (frontend/app) ---
export const toCamelCase = (obj: any): any => {
    if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }
    const result: any = {};
    for (const key of Object.keys(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = obj[key];
    }
    return result;
};

// --- 3. Helper: Parse row from Supabase to match application Types ---
const parseRow = (row: any) => {
    if (!row) return row;
    const camel = toCamelCase(row);
    // Combine both snake_case (from DB) and camelCase so both web admin and Flutter / external API clients receive their expected keys
    const item = { ...row, ...camel };

    // Number conversion check
    const numberFields = ['id', 'price', 'lat', 'lng', 'rating', 'recipientAge', 'recipient_age', 'centerId', 'center_id', 'mophOrder', 'moph_order', 'closedPackagePrice', 'closed_package_price', 'centerCommissionAmount', 'center_commission_amount', 'advisorIncentiveAmount', 'advisor_incentive_amount', 'defaultIncentiveRate', 'default_incentive_rate'];
    for (const field of numberFields) {
        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
            const num = Number(item[field]);
            if (!isNaN(num)) item[field] = num;
        }
    }

    return item;
};

// --- Cache System with In-Memory TTL & Revalidation ---
let hospitalsTableExists: boolean | null = false;
let nearbyHospitalsTableExists: boolean | null = false;

interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    ttlMs: number;
}

const globalForCache = globalThis as unknown as {
    _dbTableCache?: Map<string, CacheEntry>;
};

const tableCache = globalForCache._dbTableCache ?? new Map<string, CacheEntry>();
globalForCache._dbTableCache = tableCache;

// TTL configuration per table (milliseconds)
const TABLE_CACHE_TTL: Record<string, number> = {
    care_centers: 10 * 60 * 1000,       // 10 minutes (auto-invalidated immediately on admin change)
    care_centers_light: 10 * 60 * 1000, // 10 minutes (lightweight card projection)
    hospitals: 6 * 60 * 60 * 1000,      // 6 hours
    ads: 15 * 60 * 1000,                // 15 minutes
    blogs: 15 * 60 * 1000,              // 15 minutes
    blogs_summary: 15 * 60 * 1000,      // 15 minutes (without heavy HTML content)
    contacts: 60 * 1000,                // 60 seconds (auto-invalidated on new contact)
    consultations: 60 * 1000,           // 60 seconds (auto-invalidated on new consultation)
    traffic: 60 * 1000,                 // 60 seconds cache for admin dashboard traffic logs
};

export const invalidateTableCache = (tableName?: string) => {
    if (tableName) {
        tableCache.delete(tableName);
        if (tableName === 'care_centers') {
            tableCache.delete('care_centers_light');
        }
        if (tableName === 'blogs') {
            tableCache.delete('blogs_summary');
        }
    } else {
        tableCache.clear();
    }
};

const invalidateCache = (tableName: string) => {
    try {
        if (tableName === 'hospitals') hospitalsTableExists = null;
        if (tableName === 'center_nearby_hospitals') nearbyHospitalsTableExists = null;
        invalidateTableCache(tableName);
        revalidateTag(tableName, 'max');
    } catch {
        // Ignored outside of Next.js server request context
    }
};

// --- Generic CRUD Operations for Supabase ---

const loadDataFromTable = async (tableName: string, forceFresh = false) => {
    try {
        if (!isSupabaseConfigured()) {
            console.warn(`[Supabase] Warning: Supabase is not configured yet. Returning empty array for table: ${tableName}`);
            return [];
        }

        const now = Date.now();
        const ttl = TABLE_CACHE_TTL[tableName] ?? 30 * 1000;
        const cached = tableCache.get(tableName);

        // Return from in-memory cache if still valid
        if (!forceFresh && cached && now - cached.timestamp < cached.ttlMs) {
            return [...cached.data];
        }

        let allData: any[] = [];
        let from = 0;
        const PAGE_SIZE = 1000;

        while (true) {
            const { data, error } = await supabaseAdmin
                .from(tableName)
                .select('*')
                .order('id', { ascending: true })
                .range(from, from + PAGE_SIZE - 1);

            if (error) {
                if (error.code === 'PGRST205') {
                    if (tableName === 'hospitals') {
                        hospitalsTableExists = false;
                    }
                } else {
                    console.error(`[Supabase Error] Error fetching from ${tableName}:`, error.message || error);
                }
                break;
            }

            if (!data || data.length === 0) break;
            allData = allData.concat(data);
            if (data.length < PAGE_SIZE) break;
            from += PAGE_SIZE;
        }

        const parsed = allData.map(parseRow);
        tableCache.set(tableName, { data: parsed, timestamp: now, ttlMs: ttl });
        return [...parsed];
    } catch (error) {
        console.error(`[DB Error] Failed to load data from table ${tableName}:`, error);
        return [];
    }
};

const extractMissingColumn = (error: any): string | null => {
    if (!error?.message || typeof error.message !== 'string') return null;
    const match = error.message.match(/Could not find the '([^']+)' column/i);
    return match ? match[1] : null;
};

const insertDataToTable = async (tableName: string, newItem: any) => {
    try {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase is not configured yet. Please check .env.local');
        }

        const dbItem = toSnakeCase(newItem);
        // If id is empty or null, compute next sequential ID to avoid postgres sequence collision
        if (dbItem.id === undefined || dbItem.id === null || dbItem.id === '') {
            try {
                const { data: maxRow } = await supabaseAdmin
                    .from(tableName)
                    .select('id')
                    .order('id', { ascending: false })
                    .limit(1);
                const nextId = (maxRow && maxRow[0]?.id ? Number(maxRow[0].id) : 0) + 1;
                dbItem.id = nextId;
            } catch {
                delete dbItem.id;
            }
        }

        let { data, error } = await supabaseAdmin
            .from(tableName)
            .insert([dbItem])
            .select();

        // Handle case where columns do not exist yet in database schema (e.g. PGRST204)
        let retryCount = 0;
        while (error && (error.code === 'PGRST204' || error.message?.includes('Could not find the')) && retryCount < 5) {
            const missingCol = extractMissingColumn(error);
            if (missingCol && missingCol in dbItem) {
                console.warn(`[Supabase Notice] Column '${missingCol}' does not exist in table '${tableName}'. Retrying insert without it.`);
                delete dbItem[missingCol];
                const retry = await supabaseAdmin
                    .from(tableName)
                    .insert([dbItem])
                    .select();
                data = retry.data;
                error = retry.error;
                retryCount++;
            } else {
                break;
            }
        }

        if (error) {
            console.error(`[Supabase Error] Error inserting into ${tableName}:`, error);
            throw error;
        }

        invalidateCache(tableName);
        return data && data.length > 0 ? parseRow(data[0]) : true;
    } catch (error) {
        console.error(`[DB Error] Failed to insert into ${tableName}:`, error);
        throw error;
    }
};

const updateDataInTable = async (tableName: string, id: number | string, updatedData: any) => {
    try {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase is not configured yet. Please check .env.local');
        }

        const dbItem = toSnakeCase(updatedData);
        delete dbItem.id; // Do not overwrite primary key

        let { error } = await supabaseAdmin
            .from(tableName)
            .update(dbItem)
            .eq('id', id);

        // Handle case where columns do not exist yet in database schema (e.g. PGRST204)
        let retryCount = 0;
        while (error && (error.code === 'PGRST204' || error.message?.includes('Could not find the')) && retryCount < 10) {
            const missingCol = extractMissingColumn(error);
            if (missingCol && missingCol in dbItem) {
                console.warn(`[Supabase Notice] Column '${missingCol}' does not exist in table '${tableName}'. Retrying update without it.`);
                delete dbItem[missingCol];
                const retry = await supabaseAdmin
                    .from(tableName)
                    .update(dbItem)
                    .eq('id', id);
                error = retry.error;
                retryCount++;
            } else {
                break;
            }
        }

        if (error) {
            console.error(`[Supabase Error] Error updating row in ${tableName}:`, error);
            throw error;
        }

        invalidateCache(tableName);
        return true;
    } catch (error) {
        console.error(`[DB Error] Failed to update row in ${tableName}:`, error);
        throw error;
    }
};

const deleteDataFromTable = async (tableName: string, id: number | string) => {
    try {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase is not configured yet. Please check .env.local');
        }

        const { error } = await supabaseAdmin
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Error] Error deleting row from ${tableName}:`, error);
            throw error;
        }

        invalidateCache(tableName);
        return true;
    } catch (error) {
        console.error(`[DB Error] Failed to delete row from ${tableName}:`, error);
        throw error;
    }
};

const saveDataToTable = async (tableName: string, items: any[]) => {
    try {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase is not configured yet. Please check .env.local');
        }

        // 1. Get existing records to delete removed ones
        const { data: existing, error: selectError } = await supabaseAdmin
            .from(tableName)
            .select('id');

        if (selectError) {
            console.error(`[Supabase Error] Error selecting IDs from ${tableName}:`, selectError);
            throw selectError;
        }

        const existingIds = (existing || []).map((row: any) => row.id);
        const newIds = items.map((item: any) => item.id).filter(id => id !== undefined && id !== null);

        const idsToDelete = existingIds.filter((id: any) => !newIds.includes(id));
        if (idsToDelete.length > 0) {
            await supabaseAdmin.from(tableName).delete().in('id', idsToDelete);
        }

        // 2. Upsert items
        if (items.length > 0) {
            let dbItems = items.map(toSnakeCase);
            let { error: upsertError } = await supabaseAdmin
                .from(tableName)
                .upsert(dbItems);

            if (upsertError && (upsertError.code === 'PGRST204' || upsertError.message?.includes('Could not find the'))) {
                const missingCol = extractMissingColumn(upsertError);
                if (missingCol) {
                    console.warn(`[Supabase Notice] Column '${missingCol}' does not exist in table '${tableName}'. Retrying upsert without it.`);
                    dbItems = dbItems.map((item: any) => {
                        const copy = { ...item };
                        delete copy[missingCol];
                        return copy;
                    });
                    const retry = await supabaseAdmin
                        .from(tableName)
                        .upsert(dbItems);
                    upsertError = retry.error;
                }
            }

            if (upsertError) {
                console.error(`[Supabase Error] Error upserting into ${tableName}:`, upsertError);
                throw upsertError;
            }
        }

        invalidateCache(tableName);
        return true;
    } catch (error) {
        console.error(`[DB Error] Failed to save data to ${tableName}:`, error);
        throw error;
    }
};

// ==============================================================================
// --- Application Model Exports ---
// ==============================================================================

// 1. CARE CENTERS
export const getCareCenters = async (forceFresh = false) => loadDataFromTable('care_centers', forceFresh);

const LIGHT_CENTER_COLUMNS = 'id, name, price, province, district, address, lat, lng, rating, type, is_partner, status, image_urls, brand_name, brand_logo_url, has_government_certificate';

export const getCareCentersLight = async (): Promise<any[]> => {
    try {
        if (!isSupabaseConfigured()) return [];
        const now = Date.now();

        // 1. Reuse full cache if already warm in memory
        const fullCached = tableCache.get('care_centers');
        if (fullCached && now - fullCached.timestamp < fullCached.ttlMs) {
            return [...fullCached.data];
        }

        // 2. Check lightweight cache
        const lightCached = tableCache.get('care_centers_light');
        const ttl = TABLE_CACHE_TTL.care_centers_light ?? 10 * 60 * 1000;
        if (lightCached && now - lightCached.timestamp < lightCached.ttlMs) {
            return [...lightCached.data];
        }

        let allData: any[] = [];
        let from = 0;
        const PAGE_SIZE = 1000;

        while (true) {
            const { data, error } = await supabaseAdmin
                .from('care_centers')
                .select(LIGHT_CENTER_COLUMNS)
                .eq('status', 'visible')
                .order('id', { ascending: true })
                .range(from, from + PAGE_SIZE - 1);

            if (error) {
                // Fallback to full load if any column name differs in DB schema
                return getCareCenters();
            }

            if (!data || data.length === 0) break;
            allData = allData.concat(data);
            if (data.length < PAGE_SIZE) break;
            from += PAGE_SIZE;
        }

        const parsed = allData.map(parseRow);
        tableCache.set('care_centers_light', { data: parsed, timestamp: now, ttlMs: ttl });
        return [...parsed];
    } catch {
        return getCareCenters();
    }
};

export const getCareCenterByName = async (rawSlugOrName: string): Promise<any | null> => {
    try {
        if (!isSupabaseConfigured()) return null;
        const rawDecoded = decodeURIComponent(rawSlugOrName).trim();
        const decodedName = rawDecoded.replace(/-/g, ' ').trim();
        const targetName = decodedName.replace(/\s+/g, '');

        // 1. Check warm in-memory cache first (0 DB queries)
        const now = Date.now();
        const fullCached = tableCache.get('care_centers');
        if (fullCached && now - fullCached.timestamp < fullCached.ttlMs) {
            return fullCached.data.find((c: any) =>
                (c.name || '').replace(/\s+/g, '') === targetName || c.name === decodedName || c.name === rawDecoded
            ) || null;
        }

        // 2. Direct single-row query from Supabase (saves ~99% egress on cold starts)
        const candidateNames = Array.from(new Set([decodedName, rawDecoded])).filter(Boolean);
        if (candidateNames.length > 0) {
            const { data: exactRows, error } = await supabaseAdmin
                .from('care_centers')
                .select('*')
                .in('name', candidateNames)
                .limit(1);

            if (!error && exactRows && exactRows.length > 0) {
                return parseRow(exactRows[0]);
            }
        }

        // 3. Fallback for names with multiple spaces or special hyphens: match against lightweight list then fetch 1 row by ID
        const lightList = await getCareCentersLight();
        const matched = lightList.find((c: any) =>
            (c.name || '').replace(/\s+/g, '') === targetName || c.name === decodedName || c.name === rawDecoded
        );
        if (matched?.id !== undefined) {
            const { data: byIdRows, error: idError } = await supabaseAdmin
                .from('care_centers')
                .select('*')
                .eq('id', matched.id)
                .limit(1);
            if (!idError && byIdRows && byIdRows.length > 0) {
                return parseRow(byIdRows[0]);
            }
        }

        return null;
    } catch (error) {
        console.error('[DB Error] Failed in getCareCenterByName:', error);
        return null;
    }
};

export const saveCareCenters = async (data: any[]) => saveDataToTable('care_centers', data);
export const addCareCenter = async (item: any) => {
    const created = await insertDataToTable('care_centers', item);
    const centerId = created?.id || item.id;
    if (centerId && item.lat && item.lng) {
        recalculateCenterNearbyHospitals(Number(centerId), Number(item.lat), Number(item.lng)).catch(e =>
            console.error('[Nearby Hospitals Auto-Recalculate Error]', e)
        );
    }
    return created;
};
export const updateCareCenter = async (id: number | string, data: any) => {
    const updated = await updateDataInTable('care_centers', id, data);
    if (data.lat && data.lng) {
        recalculateCenterNearbyHospitals(Number(id), Number(data.lat), Number(data.lng)).catch(e =>
            console.error('[Nearby Hospitals Auto-Recalculate Error]', e)
        );
    }
    return updated;
};
export const deleteCareCenter = async (id: number | string) => deleteDataFromTable('care_centers', id);


// 2. CONSULTATIONS
export const getConsultations = async () => loadDataFromTable('consultations');
export const saveConsultations = async (data: any[]) => saveDataToTable('consultations', data);
export const addConsultation = async (item: any) => insertDataToTable('consultations', item);
export const updateConsultation = async (id: number | string, data: any) => updateDataInTable('consultations', id, data);
export const deleteConsultation = async (id: number | string) => deleteDataFromTable('consultations', id);

// 3. CONTACTS
export const getContacts = async () => loadDataFromTable('contacts');
export const saveContacts = async (data: any[]) => saveDataToTable('contacts', data);
export const addContact = async (item: any) => insertDataToTable('contacts', item);
export const updateContact = async (id: number | string, data: any) => updateDataInTable('contacts', id, data);
export const deleteContact = async (id: number | string) => deleteDataFromTable('contacts', id);

// 4. BLOGS
export const getBlogs = async () => loadDataFromTable('blogs');

export const getBlogsSummary = async (): Promise<any[]> => {
    try {
        if (!isSupabaseConfigured()) return [];
        const now = Date.now();

        // 1. Reuse full blogs cache if warm
        const fullCached = tableCache.get('blogs');
        if (fullCached && now - fullCached.timestamp < fullCached.ttlMs) {
            return [...fullCached.data];
        }

        // 2. Check lightweight summary cache (excludes heavy HTML content column)
        const summaryCached = tableCache.get('blogs_summary');
        const ttl = TABLE_CACHE_TTL.blogs_summary ?? 15 * 60 * 1000;
        if (summaryCached && now - summaryCached.timestamp < summaryCached.ttlMs) {
            return [...summaryCached.data];
        }

        const { data, error } = await supabaseAdmin
            .from('blogs')
            .select('id, title, slug, excerpt, cover_image, created_at, author, is_published, is_featured, is_recent, category')
            .order('id', { ascending: true });

        if (error || !data) {
            return getBlogs();
        }

        const parsed = data.map(parseRow);
        tableCache.set('blogs_summary', { data: parsed, timestamp: now, ttlMs: ttl });
        return [...parsed];
    } catch {
        return getBlogs();
    }
};

export const getBlogBySlugFromDb = async (slug: string): Promise<any | null> => {
    try {
        if (!isSupabaseConfigured()) return null;
        const decodedSlug = decodeURIComponent(slug).trim();

        // 1. Reuse full blogs cache if warm
        const now = Date.now();
        const fullCached = tableCache.get('blogs');
        if (fullCached && now - fullCached.timestamp < fullCached.ttlMs) {
            return fullCached.data.find((b: any) => (b.slug || '').trim() === decodedSlug) || null;
        }

        // 2. Direct single-row query from Supabase
        const { data, error } = await supabaseAdmin
            .from('blogs')
            .select('*')
            .eq('slug', decodedSlug)
            .limit(1);

        if (!error && data && data.length > 0) {
            return parseRow(data[0]);
        }

        // 3. Fallback if slug has trailing whitespace in DB
        const allBlogs = await getBlogs();
        return allBlogs.find((b: any) => (b.slug || '').trim() === decodedSlug) || null;
    } catch {
        return null;
    }
};

export const saveBlogs = async (data: any[]) => saveDataToTable('blogs', data);
export const addBlog = async (item: any) => insertDataToTable('blogs', item);
export const updateBlog = async (id: number | string, data: any) => updateDataInTable('blogs', id, data);
export const deleteBlog = async (id: number | string) => deleteDataFromTable('blogs', id);

// 5. ADMINS (Always fetch directly for realtime auth without cache delay)
export const getAdmins = async () => {
    try {
        if (!isSupabaseConfigured()) return [];
        const { data, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('[Supabase Error] Error fetching admins:', error);
            return [];
        }
        return (data || []).map(parseRow);
    } catch (e) {
        console.error('[DB Error] Failed to load admins:', e);
        return [];
    }
};
export const saveAdmins = async (data: any[]) => saveDataToTable('admins', data);
export const addAdmin = async (item: any) => insertDataToTable('admins', item);
export const updateAdmin = async (id: number | string, data: any) => updateDataInTable('admins', id, data);
export const deleteAdmin = async (id: number | string) => deleteDataFromTable('admins', id);

// 6. ADS
export const getAds = async () => loadDataFromTable('ads');
export const saveAds = async (data: any[]) => saveDataToTable('ads', data);
export const addAd = async (item: any) => insertDataToTable('ads', item);
export const updateAd = async (id: number | string, data: any) => updateDataInTable('ads', id, data);
export const deleteAd = async (id: number | string) => deleteDataFromTable('ads', id);

// 7. TRAFFIC LOGS (Optimized with in-memory cache, order and limit to avoid heavy full-table scans)
export const getTrafficLogs = async (limit = 2000) => {
    try {
        if (!isSupabaseConfigured()) return [];
        const cacheKey = `traffic_${limit}`;
        const now = Date.now();
        const cached = tableCache.get(cacheKey);
        const ttl = TABLE_CACHE_TTL.traffic ?? 60 * 1000;
        if (cached && now - cached.timestamp < cached.ttlMs) {
            return [...cached.data];
        }

        const { data, error } = await supabaseAdmin
            .from('traffic')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[Supabase Error] Error fetching traffic logs:', error);
            return [];
        }
        const parsed = (data || []).map(parseRow);
        tableCache.set(cacheKey, { data: parsed, timestamp: now, ttlMs: ttl });
        return [...parsed];
    } catch (e) {
        console.error('[DB Error] Failed to load traffic logs:', e);
        return [];
    }
};
export const addTrafficLog = async (item: any) => {
    try {
        if (!isSupabaseConfigured()) return false;
        const dbItem = toSnakeCase(item);
        const { error } = await supabaseAdmin.from('traffic').insert([dbItem]);
        if (error) {
            return insertDataToTable('traffic', item);
        }
        return true;
    } catch {
        return false;
    }
};

// 8. PROVIDER SIGNUPS
export const appendProviderSignup = async (data: any) => {
    await insertDataToTable('provider_signups', data);
    return { success: true };
};
export const getProviderSignups = async () => loadDataFromTable('provider_signups');

// 9. HOSPITALS & HEALTHCARE NETWORK

export const getHospitals = async (): Promise<any[]> => {
    try {
        if (hospitalsTableExists === false) {
            return INITIAL_HOSPITALS;
        }
        const rows = await loadDataFromTable('hospitals');
        if (rows && rows.length > 0) {
            hospitalsTableExists = true;
            return rows;
        }
        return INITIAL_HOSPITALS;
    } catch {
        return INITIAL_HOSPITALS;
    }
};

export const saveHospitals = async (data: any[]) => saveDataToTable('hospitals', data);

export const getHospitalById = async (id: string): Promise<any | null> => {
    try {
        const hospitals = await getHospitals();
        const found = hospitals.find((h: any) => String(h.id) === String(id));
        return found || null;
    } catch {
        const fallback = INITIAL_HOSPITALS.find((h) => String(h.id) === String(id));
        return fallback || null;
    }
};

export const getNearbyHospitalsByCenterId = async (
    centerId: number,
    centerLat?: number,
    centerLng?: number
): Promise<any[]> => {
    try {
        if (isSupabaseConfigured() && nearbyHospitalsTableExists !== false) {
            const { data, error } = await supabaseAdmin
                .from('center_nearby_hospitals')
                .select(`
                    id,
                    center_id,
                    hospital_id,
                    distance_km,
                    is_primary_transfer,
                    priority_order,
                    hospitals:hospital_id (*)
                `)
                .eq('center_id', centerId)
                .order('priority_order', { ascending: true });

            if (error && error.code === 'PGRST205') {
                nearbyHospitalsTableExists = false;
            } else if (!error && data && data.length > 0) {
                nearbyHospitalsTableExists = true;
                return data.map((item: any) => {
                    const parsed = parseRow(item);
                    return {
                        id: parsed.id,
                        centerId: parsed.centerId,
                        hospitalId: parsed.hospitalId,
                        distanceKm: Number(parsed.distanceKm),
                        isPrimaryTransfer: parsed.isPrimaryTransfer,
                        priorityOrder: parsed.priorityOrder,
                        hospital: item.hospitals ? parseRow(item.hospitals) : undefined,
                    };
                });
            }
        }

        // Fallback: Compute dynamically if table is empty or center has lat/lng
        if (centerLat && centerLng) {
            const allHospitals = await getHospitals();
            const topNearby = findTopNearbyHospitals(centerLat, centerLng, allHospitals, 3);
            return topNearby.map(item => ({
                ...item,
                centerId,
            }));
        }

        return [];
    } catch {
        if (centerLat && centerLng) {
            return findTopNearbyHospitals(centerLat, centerLng, INITIAL_HOSPITALS, 3).map(item => ({
                ...item,
                centerId,
            }));
        }
        return [];
    }
};

export const recalculateCenterNearbyHospitals = async (
    centerId: number,
    lat: number,
    lng: number
): Promise<void> => {
    try {
        if (!isSupabaseConfigured() || !lat || !lng || nearbyHospitalsTableExists === false) return;

        const allHospitals = await getHospitals();
        const topHospitals = findTopNearbyHospitals(lat, lng, allHospitals, 5);

        if (topHospitals.length === 0) return;

        // Delete existing nearby hospitals for this center
        await supabaseAdmin
            .from('center_nearby_hospitals')
            .delete()
            .eq('center_id', centerId);

        // Insert new top hospitals
        const rowsToInsert = topHospitals.map(item => ({
            center_id: centerId,
            hospital_id: item.hospitalId,
            distance_km: item.distanceKm,
            is_primary_transfer: item.isPrimaryTransfer || false,
            priority_order: item.priorityOrder,
        }));

        await supabaseAdmin
            .from('center_nearby_hospitals')
            .insert(rowsToInsert);

        invalidateCache('center_nearby_hospitals');
    } catch (err) {
        console.error(`[DB Error] Failed to recalculate nearby hospitals for center ${centerId}:`, err);
    }
};

