export interface Package {
    name: string;
    price: number;
    details: string[];
}

export interface RoomType {
    name: string;
    imageUrls: string[];
    status: string;
    description?: string;
    facilities?: string[];
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
    roomTypes?: RoomType[];
    hasGovernmentCertificate?: boolean;
    brandName?: string;
    brandLogoUrl?: string;
    isPartner?: boolean;
    status?: 'visible' | 'hidden' | 'pending';
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    nearbyHospitals?: CenterNearbyHospital[];
}

export interface Hospital {
    id: string;
    nameTh: string;
    nameEn?: string;
    hospitalType: 'รัฐบาล' | 'เอกชน';
    level?: string;
    province: string;
    district?: string;
    latitude: number;
    longitude: number;
    emergency24h?: boolean;
    googleMapsUrl?: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CenterNearbyHospital {
    id?: number | string;
    centerId: number;
    hospitalId: string;
    distanceKm: number;
    durationMinutes?: number;
    isPrimaryTransfer?: boolean;
    priorityOrder: number;
    hospital?: Hospital;
}

export interface Blog {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isNew: any;
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    isPublished: boolean;
    category?: string;
    isRecent?: boolean;
    isFeatured?: boolean;
}

export interface Consultation {
    id: number;
    name: string;
    phone: string;
    email?: string;
    lineId?: string;
    contactName?: string; // ชื่อผู้ติดต่อ
    recipientName?: string; // ชื่อผู้รับบริการ
    recipientAge?: number; // อายุผู้รับบริการ
    relationshipToRecipient?: string; // ความสัมพันธ์กับผู้รับบริการ
    branch: string;
    budget: string;
    roomType: string;
    convenientTime: string;
    message: string;
    status: string;
    submittedAt: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: string;
    submittedAt: string;
}

export interface Admin {
    id: number;
    username: string;
    password: string; // hashed password
    email: string;
    fullName: string;
    role: 'super_admin' | 'admin';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

export interface AdminLoginRequest {
    username: string;
    password: string;
}

export interface AdminLoginResponse {
    success: boolean;
    token?: string;
    admin?: Omit<Admin, 'password'>;
    message?: string;
}

export interface JWTPayload {
    adminId: number;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}

export type AdPlacement = 'pr' | 'infeed' | 'both';

export interface Advertisement {
    id: number;
    imageUrl: string;
    linkUrl?: string;
    title?: string;
    description?: string;
    placement?: AdPlacement;
    category?: 'course' | 'product' | 'center' | 'general';
    createdAt?: string;
}