'use client';

export interface SavedCenterItem {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
    address?: string;
    province?: string;
    price?: number;
    phone?: string;
    selectedAt: string; // ISO Date String
    actionType?: string; // 'consultation' | 'call' | 'line' | 'navigation' | 'manual'
}

const BASKET_COOKIE_NAME = 'tcc_center_basket';
const BASKET_STORAGE_KEY = 'tcc_center_basket_data';
const COOKIE_DAYS = 30;

// Helper to set cookie with expiration
function setCookie(name: string, value: string, days = COOKIE_DAYS) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Helper to get cookie value
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Helper to delete cookie
function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Helper สร้าง URL slug ให้ตรงกับ Next.js dynamic route /[name]
export function createCenterSlug(name: string): string {
    const raw = (name || '').trim();
    if (!raw) return '';
    try {
        // ถอดรหัสก่อนเผื่อมี string ที่เคย encode มาแล้ว ป้องกัน double encode
        const decoded = decodeURIComponent(raw);
        return encodeURIComponent(decoded.replace(/\s+/g, '-'));
    } catch {
        return encodeURIComponent(raw.replace(/\s+/g, '-'));
    }
}

// Helper สำหรับบันทึกข้อมูลทั้งใน LocalStorage (Full object) และ Cookie (Safe-size payload)
function saveBasket(items: SavedCenterItem[]) {
    if (typeof window === 'undefined') return;

    // 1. บันทึกข้อมูลแบบเต็ม (Full Objects) ลงใน LocalStorage
    // LocalStorage มีพื้นที่ 5-10MB จุศูนย์ได้หลายร้อยศูนย์โดยไม่มีปัญหาข้อจำกัด 4KB
    try {
        localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
    }

    // 2. ซิงค์ลง Cookie โดยควบคุมขนาดไม่ให้เกิน 3,200 bytes (Browser Cookie Hard Limit คือ 4,096 bytes)
    try {
        // คัดเลือกเฉพาะฟิลด์จำเป็นสำหรับ Cookie (ตัด address ที่ยาวและ slug ที่สามารถคำนวณจาก name ได้)
        const compactList = items.map(item => ({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl && !item.imageUrl.startsWith('data:') ? item.imageUrl.slice(0, 120) : '',
            province: item.province || '',
            price: item.price || 0,
            phone: item.phone || '',
            selectedAt: item.selectedAt,
            actionType: item.actionType
        }));

        let count = compactList.length;
        let cookiePayload = JSON.stringify(compactList.slice(0, count));

        // ป้องกันไม่ให้ URL encoded string เกิน 3,200 bytes เด็ดขาด ป้องกัน Browser ทิ้ง Cookie
        while (encodeURIComponent(cookiePayload).length > 3200 && count > 1) {
            count--;
            cookiePayload = JSON.stringify(compactList.slice(0, count));
        }

        setCookie(BASKET_COOKIE_NAME, cookiePayload, COOKIE_DAYS);
    } catch (e) {
        console.warn('Cookie save failed:', e);
    }
}

// ดึงรายการศูนย์ที่อยู่ในตระกร้าจาก LocalStorage เป็นหลัก (Fallback ไป Cookie) พร้อม Normalize Slug
export function getCenterBasket(): SavedCenterItem[] {
    if (typeof window === 'undefined') return [];

    const normalizeItem = (item: SavedCenterItem): SavedCenterItem => ({
        ...item,
        name: item.name || '',
        slug: createCenterSlug(item.name || item.slug || '')
    });

    try {
        // 1. อ่านจาก LocalStorage เป็นหลัก (รองรับข้อมูลขนาดใหญ่ ไม่โดนตัดทอน)
        const storageVal = localStorage.getItem(BASKET_STORAGE_KEY);
        if (storageVal) {
            const parsed = JSON.parse(storageVal);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizeItem);
            }
        }

        // 2. Fallback ไปที่ Cookie ถ้า LocalStorage ว่าง
        const cookieVal = getCookie(BASKET_COOKIE_NAME);
        if (cookieVal) {
            const parsed = JSON.parse(cookieVal);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // ซิงค์กลับเข้า LocalStorage เพื่อความรวดเร็ว
                try {
                    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(parsed));
                } catch {
                    // ignore
                }
                return parsed.map(normalizeItem);
            }
        }
    } catch (e) {
        console.warn('Error reading center basket:', e);
    }

    return [];
}

// เพิ่มหรืออัปเดตศูนย์ในตระกร้า
export function addCenterToBasket(
    center: Omit<SavedCenterItem, 'selectedAt' | 'slug'> & { selectedAt?: string; slug?: string }
): SavedCenterItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const current = getCenterBasket();
        // เอาศูนย์ที่มี id เดิมออกก่อน (ถ้ามี) เพื่อนำไปไว้หน้าสุด (Most recent)
        const filtered = current.filter(item => String(item.id) !== String(center.id));

        const cleanName = (center.name || '').trim();
        const safeSlug = createCenterSlug(cleanName || center.slug || '');

        const newItem: SavedCenterItem = {
            id: Number(center.id) || center.id as any,
            name: cleanName,
            slug: safeSlug,
            imageUrl: center.imageUrl || '',
            address: center.address || '',
            province: center.province || '',
            price: center.price || 0,
            phone: center.phone || '',
            selectedAt: center.selectedAt || new Date().toISOString(),
            actionType: center.actionType || 'manual'
        };

        // เก็บศูนย์ที่สนใจได้สูงสุด 30 แห่ง
        const updated = [newItem, ...filtered].slice(0, 30);

        saveBasket(updated);

        // ยิง event เพื่อให้ Component ทุกจุดอัปเดต UI ทันที
        window.dispatchEvent(new CustomEvent('tcc_basket_updated', { detail: updated }));

        return updated;
    } catch (e) {
        console.error('Error adding center to basket:', e);
        return getCenterBasket();
    }
}

// ลบศูนย์ออกจากตระกร้า
export function removeCenterFromBasket(centerId: number | string): SavedCenterItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const current = getCenterBasket();
        const updated = current.filter(item => String(item.id) !== String(centerId));

        saveBasket(updated);

        window.dispatchEvent(new CustomEvent('tcc_basket_updated', { detail: updated }));

        return updated;
    } catch (e) {
        console.error('Error removing center from basket:', e);
        return getCenterBasket();
    }
}

// ตรวจสอบว่าศูนย์นี้อยู่ในตระกร้าแล้วหรือไม่ (ตรวจสอบได้ทั้งจาก id และ ชื่อศูนย์)
export function isCenterInBasket(centerId?: number | string | null, centerName?: string | null): boolean {
    const list = getCenterBasket();
    const cleanName = (centerName || '').trim().toLowerCase();
    const cleanId = centerId !== undefined && centerId !== null ? String(centerId).trim() : '';

    return list.some(item => {
        if (cleanId && String(item.id) === cleanId) return true;
        if (cleanName && item.name && item.name.trim().toLowerCase() === cleanName) return true;
        return false;
    });
}

// เคลียร์ตระกร้าทั้งหมด
export function clearCenterBasket(): void {
    if (typeof window === 'undefined') return;

    deleteCookie(BASKET_COOKIE_NAME);
    localStorage.removeItem(BASKET_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('tcc_basket_updated', { detail: [] }));
}
