// src/types.ts

export interface Package {
    name: string;
    price: number;
    details: string[]; // ✅ เป็น Array ของ String ตาม JSON
}

export interface CareCenter {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    price: number;
    type: string; // 'daily' | 'monthly' | 'both'
    rating: number;
    phone: string;
    website?: string;
    lineId?: string;
    facebook?: string;
    mapUrl?: string; // เก็บเป็น Iframe string

    // ✅ รองรับทั้ง number (จาก API: 0, 1) และ boolean
    hasGovernmentCertificate?: number | boolean;
    isPartner?: number | boolean;

    imageUrls: string[];
    description: string;
    services: string[];
    packages: Package[];

    brandName?: string;
    brandLogoUrl?: string;
    province?: string;
    status?: string;

    // ✅ UTM Fields จาก API
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

export interface Advertisement {
    id: number;
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

