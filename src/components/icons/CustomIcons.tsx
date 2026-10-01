import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
}

/**
 * 1. IconHospitalProximity: สถานพยาบาลใกล้เคียง
 * สัญลักษณ์โรงพยาบาล/กากบาทแพทย์ พร้อมคลื่นเรดาร์พิกัดใกล้เคียง
 */
export const IconHospitalProximity: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Hospital Building Base */}
        <path
            d="M3 21H21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path
            d="M5 21V7C5 5.89543 5.89543 5 7 5H15C16.1046 5 17 5.89543 17 7V21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        {/* Medical Cross */}
        <path
            d="M11 9V15M8 12H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
        {/* Entrance Door */}
        <path
            d="M9.5 21V18.5C9.5 18.2239 9.72386 18 10 18H12C12.2761 18 12.5 18.2239 12.5 18.5V21"
            stroke="currentColor"
            strokeWidth="1.6"
        />
        {/* Proximity / Radar Signal Waves */}
        <path
            d="M18.5 7.5C19.8 8.8 20.5 10.5 20.5 12.5C20.5 14.5 19.8 16.2 18.5 17.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
        />
        <path
            d="M21 5C22.8 6.8 23.8 9.3 23.8 12C23.8 14.7 22.8 17.2 21 19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.45"
        />
    </svg>
);

/**
 * 2. IconEmergencyTransfer: การส่งต่อฉุกเฉิน
 * สัญลักษณ์การเคลื่อนย้ายส่งต่อฉุกเฉิน ลูกศรส่งต่อเร็ว + เครื่องหมายกากบาทกู้ชีพ
 */
export const IconEmergencyTransfer: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Shield / Frame */}
        <path
            d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22.5C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        {/* Medical Cross */}
        <path
            d="M12 7V13M9 10H15"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
        />
        {/* Fast Transfer Arrow */}
        <path
            d="M8.5 17L12 14.5L15.5 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/**
 * 3. IconCareCenter: 950+ ศูนย์ดูแลทั่วไทย (แทน emoji 🏢)
 * อาคารศูนย์ดูแลที่อบอุ่น ผสมผสานรูปทรงบ้านและหัวใจแห่งการเอาใจใส่
 */
export const IconCareCenter: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Main Care Center Home & Building */}
        <path
            d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        {/* Windows */}
        <rect x="6.5" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="14.5" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
        {/* Welcoming Door with Heart */}
        <path
            d="M10 21V16.5C10 16.2239 10.2239 16 10.5 16H13.5C13.7761 16 14 16.2239 14 16.5V21"
            stroke="currentColor"
            strokeWidth="1.6"
        />
        {/* Heart Roof Accent */}
        <circle cx="12" cy="8.2" r="1.2" fill="#ef4444" />
    </svg>
);

/**
 * 4. IconThailandMap: ครอบคลุม 77 จังหวัด (แทน emoji 🗺️)
 * แผนที่พับ 3 ส่วน พร้อมหมุดพิกัดกระจายทั่วภูมิภาค
 */
export const IconThailandMap: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* 3-Fold Map Outline */}
        <path
            d="M3 6.5L8.5 4L15.5 7L21 4.5V18.5L15.5 21L8.5 18L3 20.5V6.5Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        {/* Fold lines */}
        <path
            d="M8.5 4V18M15.5 7V21"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="1 1"
        />
        {/* Regional Pin Marker */}
        <circle cx="12" cy="11" r="2" fill="#3b82f6" />
        <circle cx="12" cy="11" r="3.5" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
    </svg>
);

/**
 * 5. IconProximityLoc: คำนวณพิกัด ใกล้บ้านคุณ (แทน emoji 📍)
 * หมุด GPS พิกัดแม่นยำ พร้อมคลื่นเรดาร์รอบตัวหมุด
 */
export const IconProximityLoc: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Pin Body */}
        <path
            d="M12 2C8.68629 2 6 4.68629 6 8C6 12.5 12 20 12 20C12 20 18 12.5 18 8C18 4.68629 15.3137 2 12 2Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        {/* Center Target Dot */}
        <circle cx="12" cy="8" r="2.5" fill="#f43f5e" />
        {/* Ground Pulse Rings */}
        <ellipse cx="12" cy="20.5" rx="5" ry="1.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    </svg>
);
