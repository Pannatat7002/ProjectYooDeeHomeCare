/**
 * Utility functions สำหรับ authentication ฝั่ง client
 */

export interface AdminData {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'super_admin' | 'admin';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

/**
 * ดึง token จาก localStorage
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

/**
 * ดึงข้อมูล admin จาก localStorage
 */
export const getAdmin = (): AdminData | null => {
    if (typeof window === 'undefined') return null;

    const adminData = localStorage.getItem('admin');
    if (!adminData) return null;

    try {
        return JSON.parse(adminData);
    } catch {
        return null;
    }
};

/**
 * บันทึก token และข้อมูล admin
 */
export const setAuthData = (token: string, admin: AdminData): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
};

/**
 * ลบข้อมูล authentication
 */
export const clearAuthData = (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('admin');
};

/**
 * ตรวจสอบว่า user login อยู่หรือไม่
 */
export const isAuthenticated = (): boolean => {
    return !!getToken() && !!getAdmin();
};

/**
 * ตรวจสอบว่าเป็น super admin หรือไม่
 */
export const isSuperAdmin = (): boolean => {
    const admin = getAdmin();
    return admin?.role === 'super_admin';
};

/**
 * Fetch ที่มี authentication header
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    // ถ้า token หมดอายุหรือไม่ถูกต้อง
    if (response.status === 401) {
        clearAuthData();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error('Authentication failed');
    }

    return response;
};

/**
 * Login helper
 */
export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success && data.token) {
            setAuthData(data.token, data.admin);
            return { success: true };
        }

        return { success: false, message: data.message };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
    }
};

/**
 * Logout helper
 */
export const logout = (): void => {
    clearAuthData();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};
