// src/lib/gtag.ts
export const GA_TRACKING_ID = 'G-WB5T7TJ5PT'; // ใส่ ID ของคุณ
export const GOOGLE_ADS_ID = 'AW-816450323'; // ใส่ Google Ads ID ของคุณที่นี่ (เช่น AW-XXXXXXXXXX)

// ประกาศ Type ให้ TypeScript รู้จัก window.gtag
declare global {
    interface Window {
        gtag: (command: string, ...args: (string | number | boolean | Record<string, unknown> | undefined)[]) => void;
    }
}

interface GTagEvent {
    action: string;
    category?: string;
    label?: string;
    value?: number;
    [key: string]: string | number | boolean | undefined;
}

// ฟังก์ชันส่ง Event
export const event = ({ action, category, label, value, ...customParameters }: GTagEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            ...customParameters
        });
    }
};

// Event snippet for การซื้อ conversion page
export const gtagReportConversion = (transactionId: string = '') => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
            'send_to': `${GOOGLE_ADS_ID}/bJIsCJHmmMwbEJOWqIUD`,
            'transaction_id': transactionId
        });
    }
};