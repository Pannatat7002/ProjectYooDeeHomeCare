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

// ดึงรายการศูนย์ที่อยู่ในตระกร้าจาก Cookie หรือ LocalStorage พร้อม Normalize Slug
export function getCenterBasket(): SavedCenterItem[] {
    if (typeof window === 'undefined') return [];

    const normalizeItem = (item: SavedCenterItem): SavedCenterItem => ({
        ...item,
        name: item.name || '',
        slug: createCenterSlug(item.name || item.slug || '')
    });

    try {
        // 1. ลองอ่านจาก Cookie ก่อน
        const cookieVal = getCookie(BASKET_COOKIE_NAME);
        if (cookieVal) {
            const parsed = JSON.parse(cookieVal);
            if (Array.isArray(parsed)) return parsed.map(normalizeItem);
        }

        // 2. Fallback ไปที่ LocalStorage
        const storageVal = localStorage.getItem(BASKET_STORAGE_KEY);
        if (storageVal) {
            const parsed = JSON.parse(storageVal);
            if (Array.isArray(parsed)) return parsed.map(normalizeItem);
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
        const filtered = current.filter(item => item.id !== center.id);

        const cleanName = (center.name || '').trim();
        const safeSlug = createCenterSlug(cleanName || center.slug || '');

        const newItem: SavedCenterItem = {
            id: center.id,
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

        // จำกัดตระกร้าสูงสุด 20 รายการเพื่อไม่ให้ Cookie มีขนาดใหญ่เกิน 4KB
        const updated = [newItem, ...filtered].slice(0, 20);

        const serialized = JSON.stringify(updated);
        setCookie(BASKET_COOKIE_NAME, serialized, COOKIE_DAYS);
        localStorage.setItem(BASKET_STORAGE_KEY, serialized);

        // ยิง event เพื่อให้ Component ทุกจุดอัปเดต UI ทันที
        window.dispatchEvent(new CustomEvent('tcc_basket_updated', { detail: updated }));

        return updated;
    } catch (e) {
        console.error('Error adding center to basket:', e);
        return getCenterBasket();
    }
}

// ลบศูนย์ออกจากตระกร้า
export function removeCenterFromBasket(centerId: number): SavedCenterItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const current = getCenterBasket();
        const updated = current.filter(item => item.id !== centerId);

        const serialized = JSON.stringify(updated);
        setCookie(BASKET_COOKIE_NAME, serialized, COOKIE_DAYS);
        localStorage.setItem(BASKET_STORAGE_KEY, serialized);

        window.dispatchEvent(new CustomEvent('tcc_basket_updated', { detail: updated }));

        return updated;
    } catch (e) {
        console.error('Error removing center from basket:', e);
        return getCenterBasket();
    }
}

// ตรวจสอบว่าศูนย์นี้อยู่ในตระกร้าแล้วหรือไม่
export function isCenterInBasket(centerId: number): boolean {
    const list = getCenterBasket();
    return list.some(item => item.id === centerId);
}

// เคลียร์ตระกร้าทั้งหมด
export function clearCenterBasket(): void {
    if (typeof window === 'undefined') return;

    deleteCookie(BASKET_COOKIE_NAME);
    localStorage.removeItem(BASKET_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('tcc_basket_updated', { detail: [] }));
}
