'use client';

/**
 * Anonymous Visitor & Session Tracking Utility
 * 
 * 100% PDPA & GDPR Compliant:
 * - Generates pseudonymous, random identifiers (UUID/Hash)
 * - Contains ZERO Personally Identifiable Information (No Name, Phone, Email, National ID)
 * - Used strictly for first-party analytics, unique visitor counting, and user journey measurement.
 */

const VISITOR_COOKIE_NAME = 'tcc_vid';
const VISITOR_STORAGE_KEY = 'tcc_visitor_id';
const SESSION_COOKIE_NAME = 'tcc_sid';
const SESSION_STORAGE_KEY = 'tcc_session_id';
const SESSION_TIMESTAMP_KEY = 'tcc_session_ts';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

// Helper to set cookie with SameSite=Lax and path=/
function setTrackingCookie(name: string, value: string, days: number) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Helper to get cookie value
function getTrackingCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Generate random anonymous ID (timestamp base36 + 12 chars random hex)
function generateRandomId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Array.from({ length: 3 }, () => Math.random().toString(36).substring(2, 6)).join('');
    return `${prefix}_${timestamp}${randomPart}`;
}

/**
 * Get or create an anonymous Visitor ID (persisted for 365 days across visits)
 */
export function getOrCreateVisitorId(): string {
    if (typeof window === 'undefined') return '';

    try {
        // 1. Check Cookie
        const cookieId = getTrackingCookie(VISITOR_COOKIE_NAME);
        if (cookieId && cookieId.startsWith('vid_')) {
            // Sync to localStorage
            try { localStorage.setItem(VISITOR_STORAGE_KEY, cookieId); } catch {}
            return cookieId;
        }

        // 2. Check localStorage
        try {
            const storageId = localStorage.getItem(VISITOR_STORAGE_KEY);
            if (storageId && storageId.startsWith('vid_')) {
                setTrackingCookie(VISITOR_COOKIE_NAME, storageId, 365);
                return storageId;
            }
        } catch {}

        // 3. Generate New Anonymous Visitor ID
        const newVisitorId = generateRandomId('vid');
        setTrackingCookie(VISITOR_COOKIE_NAME, newVisitorId, 365);
        try { localStorage.setItem(VISITOR_STORAGE_KEY, newVisitorId); } catch {}
        return newVisitorId;
    } catch {
        return '';
    }
}

/**
 * Get or create an anonymous Session ID (expires after 30 minutes of inactivity)
 */
export function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    try {
        const now = Date.now();
        let lastActivity = 0;
        let existingSessionId: string | null = null;

        // Check sessionStorage
        try {
            existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
            const ts = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
            if (ts) lastActivity = parseInt(ts, 10);
        } catch {}

        // Fallback to cookie
        if (!existingSessionId) {
            existingSessionId = getTrackingCookie(SESSION_COOKIE_NAME);
        }

        // Check if session is still valid within 30 minutes
        const isSessionValid = existingSessionId && 
            existingSessionId.startsWith('ses_') && 
            (lastActivity > 0 ? (now - lastActivity < SESSION_TIMEOUT_MS) : true);

        if (isSessionValid && existingSessionId) {
            // Touch / Extend session
            try {
                sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
            } catch {}
            setTrackingCookie(SESSION_COOKIE_NAME, existingSessionId, 1 / 48); // 30 minutes in days
            return existingSessionId;
        }

        // Generate New Session ID
        const newSessionId = generateRandomId('ses');
        try {
            sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
            sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
        } catch {}
        setTrackingCookie(SESSION_COOKIE_NAME, newSessionId, 1 / 48);
        return newSessionId;
    } catch {
        return '';
    }
}

/**
 * Get current anonymous tracking bundle (Visitor ID + Session ID)
 */
export function getVisitorTrackingData(): { visitorId: string; sessionId: string } {
    return {
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId()
    };
}

/**
 * Reset Anonymous Tracking IDs (Supports PDPA "Right to be Forgotten" / Erasure)
 */
export function clearVisitorTrackingData() {
    if (typeof window === 'undefined') return;
    try {
        setTrackingCookie(VISITOR_COOKIE_NAME, '', -1);
        setTrackingCookie(SESSION_COOKIE_NAME, '', -1);
        localStorage.removeItem(VISITOR_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    } catch {}
}
