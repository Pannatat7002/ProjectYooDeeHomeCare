// src/lib/gtag.ts
// export const GA_TRACKING_ID = 'G-WB5T7TJ5PT'; // ใส่ ID ของคุณ
export const GA_TRACKING_ID = 'G-W86E63SF8B'; // ใส่ ID ของคุณ
export const GOOGLE_ADS_ID = 'AW-18210261649'; // ใส่ Google Ads ID ของคุณที่นี่ (เช่น AW-XXXXXXXXXX)

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

// Event snippet for ส่งโฆษณาแบบกรอกฟอร์ม conversion page
export const gtagReportConversion = (transactionId: string = '') => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
            'send_to': `${GOOGLE_ADS_ID}/aA5ZCOfVt7gcEJGVqutD`,
            'transaction_id': transactionId
        });
    }
};

// Google Ads LINE Click Conversion Label
export const GOOGLE_ADS_LINE_LABEL = '1pP8COnZ-LwcEJGVqutD'; 

// Event snippet for LINE click conversion page
export const gtagReportLineConversion = (transactionId: string = '') => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
            'send_to': `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LINE_LABEL}`,
            'value': 1.0,
            'currency': 'THB',
            'transaction_id': transactionId
        });
    }
};