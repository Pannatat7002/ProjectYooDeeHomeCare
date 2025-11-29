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
    status?: 'visible' | 'hidden' | 'pending';
}

export interface Blog {
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
}

export interface Consultation {
    id: number;
    name: string;
    phone: string;
    email?: string;
    lineId?: string;
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

export interface Advertisement {
    id: number;
    imageUrl: string;
    linkUrl?: string;
    title?: string;
    description?: string;
    createdAt: string;
}