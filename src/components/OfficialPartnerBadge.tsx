import React from 'react';
import Image from 'next/image';
import { IconOfficialPartner } from './icons/CustomIcons';

export interface OfficialPartnerBadgeProps {
    variant?: 'pill' | 'badge' | 'seal' | 'card' | '3d';
    size?: 'sm' | 'md' | 'lg';
    iconType?: '3d' | 'svg';
    label?: string;
    subLabel?: string;
    className?: string;
}

/**
 * OfficialPartnerBadge Component
 * คอมโพเนนต์ตราสัญลักษณ์ Official Partner มาตรฐานสูง (PNG โปร่งใส ไม่มี Background)
 * รองรับหลายรูปแบบ:
 * - 'pill': แถบเรียบหรูขนาดกะทัดรัด (สำหรับหน้ารายละเอียดศูนย์)
 * - 'badge': ป้าย Tag ขอบทอง-น้ำเงิน (สำหรับการ์ดศูนย์ดูแลหน้าแรก)
 * - 'seal': ตราประทับเกียรติยศ Glassmorphism
 * - 'card': การ์ดเต็มกรอบสำหรับ Sidebar (เข้าคู่กับ BrandCard / สบส.)
 * - '3d': 3D Glossy Icon สมจริง โปร่งใส ไร้พื้นหลัง
 */
export const OfficialPartnerBadge: React.FC<OfficialPartnerBadgeProps> = ({
    variant = 'pill',
    size = 'md',
    iconType = '3d',
    label = 'Official Partner',
    subLabel = 'ผ่านการรับรองมาตรฐานจาก ThaiCareCenter',
    className = '',
}) => {
    // 1. Variant: 3D Image Badge เดี่ยวๆ
    if (variant === '3d') {
        const imgSize = size === 'sm' ? 36 : size === 'lg' ? 72 : 48;
        return (
            <div className={`inline-flex items-center gap-2.5 ${className}`}>
                <div className="relative shrink-0 transition-transform duration-300 hover:scale-105 filter drop-shadow-md">
                    <Image
                        src="/images/badges/badge-official-partner.png"
                        alt="Official Partner Badge"
                        width={imgSize}
                        height={imgSize}
                        className="object-contain"
                        priority={size === 'lg'}
                    />
                </div>
                {label && (
                    <div className="flex flex-col">
                        <span className="font-extrabold text-blue-900 tracking-tight text-sm leading-tight flex items-center gap-1">
                            {label}
                        </span>
                        {subLabel && (
                            <span className="text-[11px] text-gray-500 font-medium">
                                {subLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // 2. Variant: Card (สำหรับใส่ใน Sticky Sidebar ด้านขวา)
    if (variant === 'card') {
        return (
            <div className={`bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-none sm:rounded-2xl p-4 sm:p-5 mb-6 -mx-4 sm:mx-0 shadow-lg border border-blue-400/20 relative overflow-hidden group ${className}`}>
                {/* Background ambient glow */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Verified Partner
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                            {label}
                        </h3>
                        <p className="text-xs text-blue-100/80 mt-1 leading-snug font-normal">
                            {subLabel}
                        </p>
                    </div>

                    <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                        <Image
                            src="/images/badges/badge-official-partner.png"
                            alt="Official Partner"
                            width={64}
                            height={64}
                            className="object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // 3. Variant: Seal (ตราเกียรติยศทรงกลม/โล่ สำหรับ Hero Banner)
    if (variant === 'seal') {
        return (
            <div className={`inline-flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-300/60 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
                <div className="shrink-0">
                    {iconType === '3d' ? (
                        <Image
                            src="/images/badges/badge-official-partner.png"
                            alt="Official Partner"
                            width={32}
                            height={32}
                            className="object-contain drop-shadow-sm"
                        />
                    ) : (
                        <IconOfficialPartner size={32} variant="color" />
                    )}
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider leading-none">
                        Certified
                    </span>
                    <span className="text-sm font-extrabold text-blue-950 tracking-tight leading-tight mt-0.5">
                        {label}
                    </span>
                </div>
            </div>
        );
    }

    // 4. Variant: Badge (ป้ายทอง-น้ำเงิน เหมาะกับ Tag มุมรูป ในหน้าแรก)
    if (variant === 'badge') {
        const iconSize = size === 'sm' ? 15 : size === 'lg' ? 22 : 18;
        return (
            <span
                className={`inline-flex items-center gap-1.5 font-bold rounded-lg shadow-sm border transition-all duration-200 ${size === 'sm'
                        ? 'text-[10px] px-2 py-0.5'
                        : size === 'lg'
                            ? 'text-xs px-3 py-1.5'
                            : 'text-[11px] px-2.5 py-1'
                    } bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-indigo-950/95 text-white border-amber-400/50 hover:border-amber-400 shadow-blue-950/30 backdrop-blur-xs ${className}`}
            >
                {iconType === '3d' ? (
                    <Image
                        src="/images/badges/badge-official-partner.png"
                        alt="Official Partner"
                        width={iconSize}
                        height={iconSize}
                        className="object-contain shrink-0 drop-shadow-xs"
                    />
                ) : (
                    <IconOfficialPartner size={iconSize} variant="color" />
                )}
                <span>{label}</span>
            </span>
        );
    }

    // 5. Variant: Pill (Default เรียบหรู สำหรับหน้ารายละเอียดศูนย์)
    const iconPx = size === 'sm' ? 16 : size === 'lg' ? 24 : 18;
    return (
        <div
            className={`inline-flex items-center gap-1.5 font-bold rounded-full border transition-all duration-200 ${size === 'sm'
                    ? 'text-[11px] px-2.5 py-0.5 bg-blue-50/90 text-blue-800 border-blue-200'
                    : size === 'lg'
                        ? 'text-sm px-4 py-1.5 bg-blue-50/90 text-blue-900 border-blue-200 shadow-sm'
                        : 'text-xs px-3 py-1 bg-blue-50/90 text-blue-800 border-blue-200 shadow-xs'
                } ${className}`}
        >
            {iconType === '3d' ? (
                <Image
                    src="/images/badges/badge-official-partner.png"
                    alt="Official Partner"
                    width={iconPx}
                    height={iconPx}
                    className="object-contain shrink-0 drop-shadow-xs"
                />
            ) : (
                <IconOfficialPartner size={iconPx} variant="color" />
            )}
            <span className="tracking-tight">{label}</span>
        </div>
    );
};

export default OfficialPartnerBadge;
