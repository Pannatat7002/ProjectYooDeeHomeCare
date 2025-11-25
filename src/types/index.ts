export interface Package {
    name: string;
    price: number;
    details: string[];
}

export interface CareCenter {
    id: number;
    name: string;
    address: string;
    province?: string;
    lat: number;
    lng: number;
    price: number;
    type: 'daily' | 'monthly' | 'both';
    rating: number;
    phone: string;
    website?: string;
    mapUrl?: string;
    imageUrls: string[];
    description: string;
    services: string[];
    packages: Package[];
    hasGovernmentCertificate?: boolean;
    brandName?: string;
    brandLogoUrl?: string;
    isPartner?: boolean;
}