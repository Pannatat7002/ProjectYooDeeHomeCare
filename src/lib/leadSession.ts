'use client';

export interface VerifiedLeadData {
    phone: string;
    name?: string;
    budget?: string;
    timeframe?: string;
    verifiedAt: string;
}

const COOKIE_NAME = 'tcc_verified_lead';
const STORAGE_KEY = 'tcc_verified_lead_data';

// Helper to set cookie with expiration (default 30 days)
export function setCookie(name: string, value: string, days = 30) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Helper to get cookie value
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Helper to delete cookie
export function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Get verified lead from cookie / localStorage
export function getVerifiedLead(): VerifiedLeadData | null {
    if (typeof window === 'undefined') return null;

    try {
        const cookieVal = getCookie(COOKIE_NAME);
        if (cookieVal) {
            const data = JSON.parse(cookieVal);
            if (data && data.phone) return data;
        }

        const storageVal = localStorage.getItem(STORAGE_KEY);
        if (storageVal) {
            const data = JSON.parse(storageVal);
            if (data && data.phone) return data;
        }
    } catch {
        return null;
    }
    return null;
}

// Save verified lead to cookie and localStorage
export function saveVerifiedLead(data: {
    phone: string;
    name?: string;
    budget?: string;
    timeframe?: string;
}): VerifiedLeadData {
    const leadData: VerifiedLeadData = {
        phone: data.phone,
        name: data.name || '',
        budget: data.budget || '',
        timeframe: data.timeframe || '',
        verifiedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(leadData);
        setCookie(COOKIE_NAME, serialized, 30);
        localStorage.setItem(STORAGE_KEY, serialized);
        window.dispatchEvent(new Event('tcc_lead_updated'));
    }

    return leadData;
}

// Clear verified lead (Right to erasure / PDPA)
export function clearVerifiedLead() {
    if (typeof window !== 'undefined') {
        deleteCookie(COOKIE_NAME);
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('tcc_lead_updated'));
    }
}
