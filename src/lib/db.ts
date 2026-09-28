/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { revalidateTag } from 'next/cache';

// --- 1. Helper: Convert camelCase (frontend/app) to snake_case (PostgreSQL DB) ---
export const toSnakeCase = (obj: any): any => {
    if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }
    const result: any = {};
    const numericFields = ['id', 'price', 'lat', 'lng', 'rating', 'recipient_age', 'center_id', 'recipientAge', 'centerId'];
    for (const key of Object.keys(obj)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        let val = obj[key];
        if (numericFields.includes(key) || numericFields.includes(snakeKey)) {
            if (val === '' || val === undefined) {
                val = null;
            } else if (val !== null && !isNaN(Number(val))) {
                val = Number(val);
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
    const item = toCamelCase(row);

    // Number conversion check
    const numberFields = ['id', 'price', 'lat', 'lng', 'rating', 'recipientAge', 'centerId'];
    for (const field of numberFields) {
        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
            const num = Number(item[field]);
            if (!isNaN(num)) item[field] = num;
        }
    }

    return item;
};

// --- Cache Invalidation ---
const invalidateCache = (tableName: string) => {
    try {
        revalidateTag(tableName, 'max');
        console.log(`[Cache] Invalidated Next.js tag cache for: ${tableName}`);
    } catch {
        // Ignored outside of Next.js server request context
    }
};

// --- Generic CRUD Operations for Supabase ---

const loadDataFromTable = async (tableName: string) => {
    try {
        if (!isSupabaseConfigured()) {
            console.warn(`[Supabase] Warning: Supabase is not configured yet. Returning empty array for table: ${tableName}`);
            return [];
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
                console.error(`[Supabase Error] Error fetching from ${tableName}:`, error);
                break;
            }

            if (!data || data.length === 0) break;
            allData = allData.concat(data);
            if (data.length < PAGE_SIZE) break;
            from += PAGE_SIZE;
        }

        return allData.map(parseRow);
    } catch (error) {
        console.error(`[DB Error] Failed to load data from table ${tableName}:`, error);
        return [];
    }
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

        const { data, error } = await supabaseAdmin
            .from(tableName)
            .insert([dbItem])
            .select();

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

        const { error } = await supabaseAdmin
            .from(tableName)
            .update(dbItem)
            .eq('id', id);

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
            const dbItems = items.map(toSnakeCase);
            const { error: upsertError } = await supabaseAdmin
                .from(tableName)
                .upsert(dbItems);

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
export const getCareCenters = async () => loadDataFromTable('care_centers');
export const saveCareCenters = async (data: any[]) => saveDataToTable('care_centers', data);
export const addCareCenter = async (item: any) => insertDataToTable('care_centers', item);
export const updateCareCenter = async (id: number | string, data: any) => updateDataInTable('care_centers', id, data);
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

// 7. TRAFFIC LOGS
export const getTrafficLogs = async () => loadDataFromTable('traffic');
export const addTrafficLog = async (item: any) => insertDataToTable('traffic', item);

// 8. PROVIDER SIGNUPS
export const appendProviderSignup = async (data: any) => {
    await insertDataToTable('provider_signups', data);
    return { success: true };
};
export const getProviderSignups = async () => loadDataFromTable('provider_signups');
