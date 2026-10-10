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
    </svg>
);

/**
 * 6. IconOfficialPartner: ตราสัญลักษณ์ Official Partner / พาร์ทเนอร์อย่างเป็นทางการ
 * โล่เกียรติยศ ผสานดาวแห่งมาตรฐาน เครื่องหมายยืนยันความถูกต้อง (Verified Check) และช่อชัยพฤกษ์ทองคำ
 * รองรับทั้งแบบ 'color' (เฉดสีน้ำเงินรอยัลบลู + ทองคำหรูหรา) และ 'mono' (ยึดตาม currentColor)
 */
export const IconOfficialPartner: React.FC<IconProps & { variant?: 'color' | 'mono' }> = ({
    size = 24,
    className = '',
    variant = 'color',
    ...props
}) => {
    if (variant === 'mono') {
        return (
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
                {/* Shield Outline */}
                <path
                    d="M12 2L4.5 5.5V11.5C4.5 16.5 7.7 21 12 22.5C16.3 21 19.5 16.5 19.5 11.5V5.5L12 2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                {/* Inner Shield Accent */}
                <path
                    d="M12 4.2L6.5 6.8V11.5C6.5 15.2 9 18.7 12 19.9C15 18.7 17.5 15.2 17.5 11.5V6.8L12 4.2Z"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                    strokeLinejoin="round"
                />
                {/* Verified Checkmark */}
                <path
                    d="M8.8 12.2L11 14.4L15.5 9.8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    // Rich multi-tone Royal Blue + Premium Gold Seal
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <defs>
                {/* Royal Blue Gradient for Shield Body */}
                <linearGradient id="opBlueGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                </linearGradient>

                {/* Metallic Gold Gradient for Outer Frame */}
                <linearGradient id="opGoldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="30%" stopColor="#EAB308" />
                    <stop offset="70%" stopColor="#CA8A04" />
                    <stop offset="100%" stopColor="#FACC15" />
                </linearGradient>

                {/* Inner Glow Gradient */}
                <linearGradient id="opInnerGlow" x1="24" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </linearGradient>

                {/* Filter for Drop Shadow */}
                <filter id="opShadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#1e3a8a" floodOpacity="0.25" />
                </filter>
            </defs>

            <g filter="url(#opShadow)">
                {/* Outer Shield Frame (Gold) */}
                <path
                    d="M24 4L7 9.5V23C7 33.5 14.2 42.8 24 45C33.8 42.8 41 33.5 41 23V9.5L24 4Z"
                    fill="url(#opGoldGrad)"
                />

                {/* Inner Shield Body (Royal Blue) */}
                <path
                    d="M24 6.8L9.5 11.5V23C9.5 32 15.7 40.2 24 42.2C32.3 40.2 38.5 32 38.5 23V11.5L24 6.8Z"
                    fill="url(#opBlueGrad)"
                />

                {/* Inner Highlights / Depth */}
                <path
                    d="M24 8.5L11.5 12.8V23C11.5 30.8 16.8 38 24 39.8C31.2 38 36.5 30.8 36.5 23V12.8L24 8.5Z"
                    fill="url(#opInnerGlow)"
                    stroke="url(#opGoldGrad)"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                />

                {/* Top Excellence Star */}
                <polygon
                    points="24,11 25.4,14.5 29,14.7 26.2,17 27.1,20.5 24,18.5 20.9,20.5 21.8,17 19,14.7 22.6,14.5"
                    fill="url(#opGoldGrad)"
                />

                {/* Bold Verified Checkmark */}
                <path
                    d="M17 26.5L21.8 31.5L31.5 21"
                    stroke="#FFFFFF"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M17 26.5L21.8 31.5L31.5 21"
                    stroke="url(#opGoldGrad)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.85"
                />

                {/* Laurel Leaves Bottom Accents */}
                <path
                    d="M14 36C17 38.5 20.5 39.5 24 39.5C27.5 39.5 31 38.5 34 36"
                    stroke="url(#opGoldGrad)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                />
            </g>
        </svg>
    );
};

/**
 * 7. IconSearchCareCenter: ไอคอนประจำ Tab ค้นหาศูนย์ดูแลผู้สูงอายุ (ThaiCareCenter Brand Palette)
 * ใช้เฉพาะสีประจำแบรนด์: น้ำเงิน (#2B5897), เขียวใบไม้ (#65A85A), ขาว (#FFFFFF)
 */
export const IconSearchCareCenter: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Ground Green Lawn */}
        <rect x="6" y="54" width="52" height="4" rx="2" fill="#65A85A" />

        {/* House Walls (Clean White with Brand Blue Border) */}
        <rect x="14" y="24" width="36" height="30" rx="3" fill="#FFFFFF" stroke="#2B5897" strokeWidth="2.4" />

        {/* Gable Roof (Brand Blue) */}
        <path
            d="M32 6L9 24C8 24.8 8.5 26 10 26H54C55.5 26 56 24.8 55 24L32 6Z"
            fill="#2B5897"
        />
        {/* Roof Overhang Trim */}
        <path d="M7 25L32 6.5L57 25" stroke="#1D3E6B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Chimney (Brand Green) */}
        <rect x="42" y="9" width="5" height="11" rx="1.5" fill="#65A85A" />

        {/* Heart Care Emblem in Attic (Brand Green) */}
        <circle cx="32" cy="18" r="5.2" fill="#FFFFFF" />
        <path
            d="M32 20.5C32 20.5 29 18.2 29 16.3C29 14.8 30.2 14.2 31.2 14.8C31.7 15.1 32 15.5 32 15.5C32 15.5 32.3 15.1 32.8 14.8C33.8 14.2 35 14.8 35 16.3C35 18.2 32 20.5 32 20.5Z"
            fill="#65A85A"
        />

        {/* Big Windows (Soft Ice Blue / White Tint with Brand Blue Frame) */}
        <rect x="17" y="29" width="11" height="11" rx="2" fill="#EBF3FA" stroke="#2B5897" strokeWidth="1.8" />
        <path d="M26 30.5L19 38.5" stroke="#2B5897" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />

        <rect x="36" y="29" width="11" height="11" rx="2" fill="#EBF3FA" stroke="#2B5897" strokeWidth="1.8" />
        <path d="M45 30.5L38 38.5" stroke="#2B5897" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />

        {/* Welcoming Door (Brand Blue with Green Knob) */}
        <path d="M26 42C26 40.5 27 39 28.5 39H35.5C37 39 38 40.5 38 42V54H26V42Z" fill="#2B5897" />
        <circle cx="35" cy="47" r="1.3" fill="#65A85A" />

        {/* Green Bushes */}
        <circle cx="11.5" cy="52" r="3.5" fill="#65A85A" />
        <circle cx="52.5" cy="52" r="3.5" fill="#65A85A" />
    </svg>
);

/**
 * 8. IconSearchTransit: ไอคอนประจำ Tab รถไฟฟ้า BTS / MRT (ThaiCareCenter Brand Palette)
 * ใช้เฉพาะสีประจำแบรนด์: เขียวใบไม้ (#65A85A), น้ำเงิน (#2B5897), ขาว (#FFFFFF)
 */
export const IconSearchTransit: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Rails underneath (Brand Blue) */}
        <path d="M12 57L22 46M52 57L42 46" stroke="#2B5897" strokeWidth="3.6" strokeLinecap="round" />
        <path d="M13 56H51" stroke="#2B5897" strokeWidth="3" strokeLinecap="round" />
        <path d="M17 50H47" stroke="#65A85A" strokeWidth="2.6" strokeLinecap="round" />

        {/* Main Locomotive Body (Brand Green with Brand Blue Trim) */}
        <path
            d="M20 7C20 4.5 24 3 32 3C40 3 44 4.5 44 7L52 14C53.5 15.5 54 18 54 21V43C54 48 46 51 32 51C18 51 10 48 10 43V21C10 18 10.5 15.5 12 14L20 7Z"
            fill="#65A85A"
            stroke="#2B5897"
            strokeWidth="2.2"
        />

        {/* Top Indicator Pod */}
        <rect x="27" y="2" width="10" height="6" rx="2" fill="#2B5897" />
        <circle cx="30" cy="5" r="1.3" fill="#FFFFFF" />
        <circle cx="34" cy="5" r="1.3" fill="#FFFFFF" />

        {/* Windshields Frame (Brand Blue) */}
        <rect x="14" y="11" width="36" height="17" rx="3.5" fill="#2B5897" />

        {/* Left Windshield (White / Ice Blue + Reflection) */}
        <rect x="15.5" y="12.5" width="15" height="14" rx="2" fill="#FFFFFF" />
        <path d="M27 13.5L17.5 25" stroke="#EBF3FA" strokeWidth="2.5" strokeLinecap="round" />

        {/* Right Windshield */}
        <rect x="33.5" y="12.5" width="15" height="14" rx="2" fill="#FFFFFF" />
        <path d="M45 13.5L35.5 25" stroke="#EBF3FA" strokeWidth="2.5" strokeLinecap="round" />

        {/* Center Chevron Front Accent (Brand Blue) */}
        <path
            d="M10 27L22 35H42L54 27V33L37 41H27L10 33V27Z"
            fill="#FFFFFF"
        />
        <path
            d="M22 35L32 40L42 35L37 41H27L22 35Z"
            fill="#2B5897"
        />

        {/* Lower Brand Blue Accent Band */}
        <rect x="10" y="38" width="44" height="4" fill="#2B5897" />

        {/* Twin Headlights (White / Green) */}
        <circle cx="15" cy="35" r="2.5" fill="#FFFFFF" />
        <circle cx="21" cy="36" r="3" fill="#FFFFFF" stroke="#2B5897" strokeWidth="1" />
        <circle cx="43" cy="36" r="3" fill="#FFFFFF" stroke="#2B5897" strokeWidth="1" />
        <circle cx="49" cy="35" r="2.5" fill="#FFFFFF" />

        {/* Front Air Intake Slats */}
        <rect x="27" y="37" width="10" height="1.6" rx="0.8" fill="#65A85A" />
        <rect x="27" y="40" width="10" height="1.6" rx="0.8" fill="#65A85A" />
        <rect x="27" y="43" width="10" height="1.6" rx="0.8" fill="#65A85A" />

        {/* Lower Coupler Skirt */}
        <path d="M24 45H40L38 49H26L24 45Z" fill="#2B5897" />
        <rect x="28" y="46" width="8" height="3" rx="1" fill="#FFFFFF" />
    </svg>
);

/**
 * 9. IconSearchHospital: ไอคอนประจำ Tab โรงพยาบาล (ThaiCareCenter Brand Palette)
 * ใช้เฉพาะสีประจำแบรนด์: น้ำเงิน (#2B5897), เขียว (#65A85A), ขาว (#FFFFFF)
 */
export const IconSearchHospital: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
    >
        {/* Ground Baseline */}
        <rect x="6" y="54" width="52" height="4" rx="2" fill="#65A85A" />

        {/* Hospital Building Base (White with Brand Blue Border) */}
        <rect x="13" y="14" width="38" height="40" rx="4" fill="#FFFFFF" stroke="#2B5897" strokeWidth="2.4" />

        {/* Roof Accent / Helipad Pavilion (Brand Blue) */}
        <rect x="20" y="8" width="24" height="6" rx="2" fill="#2B5897" />
        <rect x="25" y="6" width="14" height="3" rx="1" fill="#65A85A" />

        {/* Medical Cross Emblem (Brand Blue Shield + Green Cross) */}
        <rect x="23" y="16" width="18" height="17" rx="8.5" fill="#EBF3FA" stroke="#2B5897" strokeWidth="1.6" />
        <path
            d="M32 19V30M26.5 24.5H37.5"
            stroke="#65A85A"
            strokeWidth="3.6"
            strokeLinecap="round"
        />

        {/* Tinted Clinic Windows */}
        <rect x="17" y="34" width="8.5" height="7.5" rx="2" fill="#EBF3FA" stroke="#2B5897" strokeWidth="1.6" />
        <path d="M23.5 35L19 40.5" stroke="#2B5897" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />

        <rect x="38.5" y="34" width="8.5" height="7.5" rx="2" fill="#EBF3FA" stroke="#2B5897" strokeWidth="1.6" />
        <path d="M45 35L40.5 40.5" stroke="#2B5897" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />

        {/* Automatic Sliding Emergency Doors (Brand Blue with Green Accents) */}
        <rect x="26" y="42" width="12" height="12" rx="2" fill="#2B5897" />
        <line x1="32" y1="42" x2="32" y2="54" stroke="#FFFFFF" strokeWidth="1.4" />

        {/* Emergency Canopy (Brand Green) */}
        <rect x="23" y="41" width="18" height="2.8" rx="1" fill="#65A85A" />
    </svg>
);

/**
 * 10. FlatIconNearMe: หมุดพิกัดใกล้ฉัน (Flat Illustration Theme)
 */
export const FlatIconNearMe: React.FC<IconProps> = ({ size = 26, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <ellipse cx="32" cy="56" rx="14" ry="4" fill="#CBD5E1" />
        <path d="M32 6C20.9 6 12 14.9 12 26C12 40.5 32 54 32 54C32 54 52 40.5 52 26C52 14.9 43.1 6 32 6Z" fill="#2563EB" />
        <circle cx="32" cy="25" r="9" fill="#FFFFFF" />
        <circle cx="32" cy="25" r="5" fill="#EF4444" />
    </svg>
);

/**
 * 11. FlatIconBedridden: ผู้ป่วยติดเตียง / การดูแลพิเศษ (Flat Illustration Theme)
 */
export const FlatIconBedridden: React.FC<IconProps> = ({ size = 26, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        {/* IV Pole */}
        <path d="M12 12V48M8 14H16M8 48H16" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="18" r="3" fill="#38BDF8" />
        {/* Bed Frame & Headboard */}
        <rect x="18" y="22" width="6" height="26" rx="2" fill="#3B82F6" />
        <rect x="52" y="30" width="5" height="18" rx="2" fill="#3B82F6" />
        {/* Mattress */}
        <rect x="22" y="34" width="32" height="10" rx="3" fill="#E2E8F0" />
        {/* Pillow & Blanket */}
        <rect x="24" y="30" width="8" height="6" rx="2" fill="#FFFFFF" />
        <path d="M30 36H52C53 36 54 37 54 38V44H30V36Z" fill="#10B981" />
        {/* Bed Legs */}
        <rect x="22" y="44" width="4" height="6" rx="1" fill="#1E293B" />
        <rect x="48" y="44" width="4" height="6" rx="1" fill="#1E293B" />
    </svg>
);

/**
 * 12. FlatIconAlzheimer: สมองเสื่อม / อัลไซเมอร์ / ความทรงจำ (Flat Illustration Theme)
 */
export const FlatIconAlzheimer: React.FC<IconProps> = ({ size = 26, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path
            d="M32 10C24 10 18 16 18 24C14 26 12 30 12 35C12 41 16 46 22 47C24 51 28 54 32 54C36 54 40 51 42 47C48 46 52 41 52 35C52 30 50 26 46 24C46 16 40 10 32 10Z"
            fill="#F472B6"
        />
        {/* Inner Brain Folds */}
        <path d="M32 16V48M24 24C28 26 28 32 24 36M40 24C36 26 36 32 40 36" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
        {/* Memory Star / Heart */}
        <circle cx="32" cy="30" r="7" fill="#FFFFFF" />
        <path d="M32 33C32 33 29 31 29 29.5C29 28.5 29.8 28 30.5 28.5C31.2 29 32 29 32 29C32 29 32.8 29 33.5 28.5C34.2 28 35 28.5 35 29.5C35 31 32 33 32 33Z" fill="#EF4444" />
    </svg>
);

/**
 * 13. FlatIconBudget: ราคาประหยัด / งบประมาณคุ้มค่า (Flat Illustration Theme)
 */
export const FlatIconBudget: React.FC<IconProps> = ({ size = 26, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        {/* Wallet Body */}
        <rect x="8" y="18" width="46" height="32" rx="6" fill="#F59E0B" />
        <path d="M8 26H54" stroke="#D97706" strokeWidth="2.5" />
        {/* Wallet Flap */}
        <rect x="36" y="27" width="20" height="14" rx="4" fill="#B45309" />
        <circle cx="43" cy="34" r="2.5" fill="#FDE68A" />
        {/* Gold Coin Pop-out */}
        <circle cx="32" cy="16" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <text x="32" y="20" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold" fontFamily="sans-serif">฿</text>
    </svg>
);


