/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    MapPin, Star, Phone, Globe, CheckCircle2, ArrowLeft,
    Share2, ShieldCheck, Info, DollarSign, Calendar, X,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    User,
    Users,
    MessageSquare,
    Navigation,
    Eye,
    Sparkles,
    Facebook,
    Building2,
    Heart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as gtag from '../../lib/gtag';
import { CareCenter, RoomType } from '../../types/index';
import LeadCaptureModal, { LeadActionType } from '../../components/LeadCaptureModal';
import { getVerifiedLead, saveVerifiedLead } from '../../lib/leadSession';
import { addCenterToBasket, removeCenterFromBasket, isCenterInBasket } from '../../lib/centerBasketSession';
import { getVisitorTrackingData } from '../../lib/visitorTracking';
import { IconSearchTransit } from '../../components/icons/CustomIcons';
import { NearbyTransitStation, findTopNearbyTransitStations } from '../../lib/transitStations';


// =========================================================================================
// UTILITIES & CONSTANTS
// =========================================================================================

const isTrue = (value: any) => !!value;

const getTransitLineBadge = (lineCode: string, lineName?: string) => {
    switch (lineCode) {
        case 'BTS_GREEN':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    BTS สายสีเขียว
                </span>
            );
        case 'BTS_SILOM':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                    BTS สายสีลม
                </span>
            );
        case 'MRT_BLUE':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    MRT สายสีน้ำเงิน
                </span>
            );
        case 'MRT_PURPLE':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                    MRT สายสีม่วง
                </span>
            );
        case 'MRT_YELLOW':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    MRT สายสีเหลือง
                </span>
            );
        case 'MRT_PINK':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 shrink-0">
                    MRT สายสีชมพู
                </span>
            );
        case 'SRT_RED':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    SRT สายสีแดง
                </span>
            );
        case 'ARL':
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200 shrink-0">
                    ARL แอร์พอร์ตลิงก์
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                    {lineName || 'รถไฟฟ้า'}
                </span>
            );
    }
};

const formatPhone = (phone: any) => {
    if (!phone) return '';
    const str = phone.toString().trim();
    const fullStr = str.startsWith('0') ? str : '0' + str;
    if (fullStr.length === 10) {
        return `${fullStr.slice(0, 3)}-${fullStr.slice(3, 6)}-${fullStr.slice(6)}`;
    }
    return fullStr;
};

const maskPhone = (phone: any, fallback: string = '') => {
    const raw = phone || fallback;
    if (!raw) return '08x-xxx-xxxx';
    const str = raw.toString().trim().replace(/\D/g, '');
    const fullStr = str.startsWith('0') ? str : '0' + str;
    if (fullStr.length === 10) {
        return `${fullStr.slice(0, 3)}-xxx-${fullStr.slice(-4)}`;
    }
    if (fullStr.length === 9) {
        return `${fullStr.slice(0, 2)}-xxx-${fullStr.slice(-4)}`;
    }
    return fullStr.length > 6 ? `${fullStr.slice(0, 3)}-xxx-${fullStr.slice(-3)}` : '08x-xxx-xxxx';
};

const sanitizeAboutDescription = (rawHtml?: string, centerName?: string, province?: string): string => {
    let text = rawHtml || '';
    if (!text) {
        return `<p><strong>${centerName || 'ศูนย์ดูแล'}</strong> เป็นสถานดูแลผู้สูงอายุและผู้มีภาวะพึ่งพิง ตั้งอยู่ในพื้นที่ ${province ? 'จังหวัด' + province : 'ประเทศไทย'} ให้บริการดูแลสุขภาพ ฟื้นฟูสมรรถภาพ และการบริบาลตลอด 24 ชั่วโมง โดยทีมงานบริบาลผู้มีความพร้อม เพื่อให้ผู้สูงอายุและผู้รับการดูแลมีคุณภาพชีวิตที่ดี ปลอดภัย และมีความสุขในบรรยากาศที่อบอุ่น</p>`;
    }
    // 1. ลบประโยคติดต่อสอบถามเบอร์โทร เช่น "หรือโทรติดต่อสอบถามรายละเอียดได้ที่ 08x-xxx-xxxx" หรือ "หรือโทร. ..."
    text = text.replace(/(\s*หรือ\s*)?โทร(ติดต่อ)?(สอบถาม)?(รายละเอียด)?(ได้ที่)?\s*[:\s]*[\d\s\-,\./]+/gi, '');
    // 2. ลบ "โทร : 08x...", "Tel: ...", "เบอร์โทร : ...", "ติดต่อ : 08x..."
    text = text.replace(/(โทร(\.|ศัพท์|เบอร์)?|Tel(\.|ephone)?|ติดต่อ)[\s:]*[\d\s\-,\./]{8,}/gi, '');
    // 3. ลบ pattern เบอร์โทรศัพท์ไทยโดดๆ (0x-xxxx-xxxx หรือ 0xxxxxxxxx หรือ 02-xxx-xxxx)
    text = text.replace(/(?:\+?66|0)[2-9](?:[\s\-]?[0-9]){7,8}/g, '');
    // 4. ลบ comma, dash หรือ punctuation ท้ายวรรค
    text = text.replace(/[\s,\-–—]+(?=<\/p>)/gi, '');
    // 5. ลบ tag p ว่างเปล่า
    text = text.replace(/<p>\s*<\/p>/gi, '').trim();

    return text || `<p><strong>${centerName || 'ศูนย์ดูแล'}</strong> เป็นสถานดูแลผู้สูงอายุและผู้มีภาวะพึ่งพิง ให้บริการดูแลสุขภาพ ฟื้นฟูสมรรถภาพ และการบริบาลตลอด 24 ชั่วโมง ในบรรยากาศที่อบอุ่นและปลอดภัย</p>`;
};

const getTelHref = (phone: any, fallback: string = '') => {
    const rawPhone = phone || fallback;
    if (!rawPhone) return '#';
    const cleanPhone = rawPhone.toString().replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;
    return `tel:${finalPhone}`;
};

const BrandCard = ({ brandName, brandLogoUrl }: { brandName?: string, brandLogoUrl?: string }) => {
    if (!brandName) return null;

    return (
        <div className="bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-y border-x-0 sm:border border-gray-200 p-4 mb-6 -mx-4 sm:mx-0 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">แบรนด์/เครือบริษัท</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5 break-words">{brandName}</h3>
            </div>
            {brandLogoUrl && (
                <div className="h-12 w-20 flex-shrink-0 flex items-center justify-end">
                    <img src={brandLogoUrl} alt={`${brandName} Logo`} className="max-h-full max-w-full object-contain" />
                </div>
            )}
        </div>
    );
};
const VerificationByMOPHCard = ({
    hasGovernmentCertificate,
    mophOrder,
    licenseNumber,
    mophApprovedDate
}: {
    hasGovernmentCertificate: boolean;
    mophOrder?: number;
    licenseNumber?: string;
    mophApprovedDate?: string;
}) => {
    if (!hasGovernmentCertificate) return null;
    return (
        <Link
            href="https://esta.hss.moph.go.th/check-shops.php?utm_source=thaicarecenter&utm_medium=banner&utm_campaign=esta"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <div className="bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-y border-x-0 sm:border border-emerald-200/80 p-4 mb-6 -mx-4 sm:mx-0 flex items-center justify-between gap-4 transition-all duration-200 hover:border-emerald-400 hover:shadow-md">
                <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ผ่านการรับรองจาก กรม สบส.</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 break-words group-hover:text-emerald-700 transition-colors">
                        สถานประกอบการที่ได้รับอนุญาต
                    </h3>
                    {mophApprovedDate && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                            <span className="text-gray-500">
                                อนุญาตเมื่อ: {mophApprovedDate}
                            </span>
                        </div>
                    )}
                </div>
                <div className="h-12 w-20 flex-shrink-0 flex items-center justify-end">
                    <img src="/images/สบส.png" alt="สบส. Logo" className="max-h-full max-w-full object-contain" />
                </div>
            </div>
        </Link>
    );
};

const ShareButton = () => {
    const handleShare = async () => {
        const shareData = {
            title: document.title,
            text: 'แนะนำศูนย์ดูแลผู้สูงอายุ',
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert('คัดลอกลิงก์เรียบร้อยแล้ว!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <button onClick={handleShare} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-blue-500 transition-colors shadow-md">
            <Share2 className="w-5 h-5" />
        </button>
    );
};

interface GalleryModalProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prevIndex => prevIndex === 0 ? images.length - 1 : prevIndex - 1);
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prevIndex => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') handlePrev();
            else if (event.key === 'ArrowRight') handleNext();
            else if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full">
                <X className="w-6 h-6" />
            </button>
            <div className="absolute top-4 left-4 text-white text-lg font-semibold z-50">
                {currentIndex + 1} / {images.length}
            </div>
            <div className="relative w-full h-[90vh] max-w-7xl flex items-center justify-center">
                <button onClick={handlePrev} className="absolute left-0 top-1/2 transform -translate-y-1/2 z-40 p-3 mx-2 bg-black/50 hover:bg-black/70 rounded-full text-white">
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                        src={images[currentIndex]}
                        alt={`Gallery image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x600?text=No+Image")}
                    />
                </div>
                <button onClick={handleNext} className="absolute right-0 top-1/2 transform -translate-y-1/2 z-40 p-3 mx-2 bg-black/50 hover:bg-black/70 rounded-full text-white">
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

interface ConsultationFormData {
    name: string;
    phone: string;
    lineId: string;
    email: string;
    recipientName: string;
    recipientAge: string;
    relationshipToRecipient: string;
    roomType: string;
    branch: string;
    budget: string;
    convenientTime: string;
    message: string;
}

interface ConsultationFormProps {
    formData: ConsultationFormData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    submitStatus: 'idle' | 'submitting' | 'success' | 'error';
    roomTypes?: RoomType[];
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ formData, handleInputChange, handleSubmit, submitStatus, roomTypes }) => {
    const [currentStep, setCurrentStep] = useState(1);

    const validateStep1 = () => {
        return formData.name.trim() !== '' && formData.phone.trim() !== '';
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep === 1 && !validateStep1()) {
            alert('กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน');
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // ✅ ส่วนที่แก้ไข: แสดงหน้า Success เมื่อส่งฟอร์มสำเร็จ
    if (submitStatus === 'success') {
        return (
            <div className="text-center py-12 px-4 space-y-4 animate-in fade-in duration-500">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                <h3 className="text-2xl font-extrabold text-green-700">ส่งข้อมูลสำเร็จ!</h3>
                <p className="text-gray-700 text-lg font-medium">
                    ทางศูนย์จะติดต่อกลับเพื่อยืนยันการนัดหมาย <span className="font-bold">ภายใน 24 ชั่วโมง</span>
                </p>
                <p className="text-sm text-gray-500">ขอบคุณที่ให้ความสนใจบริการของเรา</p>
            </div>
        );
    }
    // -----------------------------------------------------

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8 relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all z-10 ${currentStep >= 1 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>1</div>
                <div className={`flex-1 h-1 mx-2 transition-all ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all z-10 ${currentStep >= 2 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>2</div>
                <div className={`flex-1 h-1 mx-2 transition-all ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all z-10 ${currentStep >= 3 ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>3</div>
            </div>

            {/* Step 1: Contact Info */}
            {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">ข้อมูลผู้ติดต่อ</h3>
                        <p className="text-sm text-gray-500">กรุณากรอกข้อมูลเพื่อใช้ในการติดต่อกลับ</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุชื่อ-นามสกุล" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">หมายเลขโทรศัพท์ <span className="text-red-500">*</span></label>
                            <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุเบอร์โทรศัพท์" required />
                        </div>
                        <div>
                            <label htmlFor="lineId" className="block text-sm font-medium text-gray-700 mb-1">LINE ID (ถ้ามี)</label>
                            <input id="lineId" type="text" name="lineId" value={formData.lineId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุ LINE ID" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล (ถ้ามี)</label>
                            <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุอีเมล" />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Recipient Info */}
            {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">ข้อมูลผู้รับบริการ</h3>
                        <p className="text-sm text-gray-500">ข้อมูลเบื้องต้นของผู้สูงอายุหรือผู้ป่วย</p>
                    </div>
                    <div>
                        <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้รับบริการ (ผู้สูงอายุ)</label>
                        <input id="recipientName" type="text" name="recipientName" value={formData.recipientName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุชื่อผู้รับบริการ" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientAge" className="block text-sm font-medium text-gray-700 mb-1">อายุ (ปี)</label>
                            <input id="recipientAge" type="number" name="recipientAge" value={formData.recipientAge} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุอายุ" />
                        </div>
                        <div>
                            <label htmlFor="relationshipToRecipient" className="block text-sm font-medium text-gray-700 mb-1">ความสัมพันธ์ <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    id="relationshipToRecipient"
                                    name="relationshipToRecipient"
                                    value={formData.relationshipToRecipient}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none"
                                    required // แนะนำให้กำหนดเป็น required
                                >
                                    <option value="" disabled>--- เลือกความสัมพันธ์ ---</option>
                                    <option value="บุตร/ธิดา">บุตร/ธิดา</option>
                                    <option value="คู่สมรส">คู่สมรส</option>
                                    <option value="พี่/น้อง">พี่/น้อง</option>
                                    <option value="ญาติ">ญาติ (อื่นๆ)</option>
                                    <option value="เพื่อน/คนรู้จัก">เพื่อน/คนรู้จัก</option>
                                    <option value="อื่น ๆ">อื่น ๆ</option>
                                </select>
                                {/* Dropdown Icon */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">รายละเอียดความสนใจ</h3>
                        <p className="text-sm text-gray-500">เลือกบริการและช่วงเวลาที่สะดวก</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">ประเภทห้องพัก <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select id="roomType" name="roomType" value={formData.roomType} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none">
                                    <option value="" disabled>เลือกประเภทห้อง</option>
                                    {roomTypes && roomTypes.length > 0 ? (
                                        roomTypes.map((rt) => (
                                            <option key={rt.name} value={rt.name}>{rt.name}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="ห้องเดี่ยว">ห้องเดี่ยว</option>
                                            <option value="ห้องพักรวม">ห้องรวม</option>
                                            <option value="V.I.P">V.I.P</option>
                                        </>
                                    )}
                                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">งบประมาณ <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select id="budget" name="budget" value={formData.budget} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none">
                                    <option value="" disabled>เลือกช่วงราคา</option>
                                    <option value="ต่ำกว่า 20,000">ต่ำกว่า 20,000</option>
                                    <option value="20,000 - 30,000">20,000 - 30,000</option>
                                    <option value="มากกว่า 30,000">มากกว่า 30,000</option>
                                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="convenientTime" className="block text-sm font-medium text-gray-700 mb-1">เวลาที่สะดวกให้ติดต่อกลับ <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select id="convenientTime" name="convenientTime" value={formData.convenientTime} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none">
                                <option value="" disabled>เลือกช่วงเวลา</option>
                                <option value="ช่วงเช้า (9:00 - 12:00)">09:00 - 12:00</option>
                                <option value="ช่วงบ่าย (13:00 - 17:00)">13:00 - 17:00</option>
                                <option value="ช่วงเย็น (17:00 - 20:00)">17:00 - 20:00</option>
                                <option value="ไม่ระบุ">ไม่ระบุ</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">ข้อความเพิ่มเติม (ถ้ามี)</label>
                        <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="รายละเอียดเพิ่มเติม เช่น อาการของผู้ป่วย"></textarea>
                    </div>
                    <input type="hidden" name="branch" value={formData.branch} />

                    {/* PDPA Consent Checkbox */}
                    <div className="pt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <input
                                type="checkbox"
                                required
                                defaultChecked
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5 shrink-0"
                            />
                            <span>
                                ยินยอมให้ ThaiCareCenter บันทึกข้อมูลและประสานงานกับศูนย์ดูแลตาม{' '}
                                <Link href="/privacy" target="_blank" className="text-blue-600 underline font-medium hover:text-blue-800">
                                    นโยบายความเป็นส่วนตัว (PDPA)
                                </Link>
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
                {currentStep > 1 ? (
                    <button type="button" onClick={handlePrev} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all flex items-center">
                        <ChevronLeft className="w-4 h-4 mr-1" /> ย้อนกลับ
                    </button>
                ) : (
                    <div></div>
                )}

                {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center">
                        ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                ) : (
                    <button type="submit" disabled={submitStatus === 'submitting'} className={`px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center ${submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {submitStatus === 'submitting' ? 'กำลังส่งข้อมูล...' : 'ยืนยันการนัดหมาย'} <CheckCircle2 className="w-4 h-4 ml-2" />
                    </button>
                )}
            </div>

            {submitStatus === 'error' && <p className="text-center text-sm font-medium text-red-600 mt-3 flex items-center justify-center"><Info className="w-4 h-4 mr-1.5" /> เกิดข้อผิดพลาด! กรุณาลองใหม่อีกครั้ง</p>}
        </form>
    );
};

interface ConsultationModalProps extends ConsultationFormProps {
    isOpen: boolean;
    onClose: () => void;
    centerName: string;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, formData, handleInputChange, handleSubmit, submitStatus, centerName, roomTypes }) => {
    if (!isOpen) return null;

    // ✅ ปรับ Title ตามสถานะ
    const modalTitle = submitStatus === 'success' ?
        'การนัดหมายสำเร็จ' :
        `นัดเยี่ยมชมศูนย์ ${centerName}`;

    return (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col p-5 sm:p-8 relative">
                {/* ✅ ซ่อนปุ่ม X เมื่อแสดงหน้า Success เพื่อให้ปิดอัตโนมัติเท่านั้น หรือแสดงเพื่ออนุญาตให้ผู้ใช้ปิดเองทันที */}
                {submitStatus !== 'success' && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10">
                        <X className="w-5 h-5" />
                    </button>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6 shrink-0 pr-8 pl-4">
                    {/* ใช้ modalTitle ที่ปรับตามสถานะ */}
                    {submitStatus === 'success' ? (
                        <span className="text-green-600">{modalTitle}</span>
                    ) : (
                        <>
                            {modalTitle.split(centerName).map((part, index) => (
                                <span key={index}>
                                    {part}
                                    {index === 0 && <span className="text-blue-600">{centerName}</span>}
                                </span>
                            ))}
                        </>
                    )}
                </h2>

                <div className="overflow-y-auto flex-grow pr-1 scrollbar-hide max-h-[calc(92vh-100px)]">
                    <ConsultationForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        submitStatus={submitStatus}
                        roomTypes={roomTypes}
                    />
                </div>
            </div>
        </div>
    );
};

interface ContactStaffFormData {
    name: string;
    phone: string;
}

interface ContactStaffFormProps {
    formData: ContactStaffFormData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    submitStatus: 'idle' | 'submitting' | 'success' | 'error';
}

const ContactStaffForm: React.FC<ContactStaffFormProps> = ({ formData, handleInputChange, handleSubmit, submitStatus }) => {
    // ✅ ส่วนที่แก้ไข: แสดงหน้า Success เมื่อส่งฟอร์มสำเร็จ
    if (submitStatus === 'success') {
        return (
            <div className="text-center py-12 px-4 space-y-4 animate-in fade-in duration-500">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                <h3 className="text-2xl font-extrabold text-green-700">ส่งข้อมูลสำเร็จ!</h3>
                <p className="text-gray-700 text-lg font-medium">
                    เจ้าหน้าที่จะติดต่อกลับหาท่าน <span className="font-bold">โดยเร็วที่สุด</span>
                </p>
                <p className="text-sm text-gray-500">ขอบคุณที่ให้ความสนใจบริการของเรา</p>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-500">กรุณากรอกข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                        <input id="contactName" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุชื่อ-นามสกุล" required />
                    </div>
                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">หมายเลขโทรศัพท์ <span className="text-red-500">*</span></label>
                        <input id="contactPhone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุเบอร์โทรศัพท์" required />
                    </div>
                </div>

                {/* PDPA Consent Checkbox */}
                <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <input
                            type="checkbox"
                            required
                            defaultChecked
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5 shrink-0"
                        />
                        <span>
                            ยินยอมให้ ThaiCareCenter บันทึกข้อมูลและประสานงานกับศูนย์ดูแลตาม{' '}
                            <Link href="/privacy" target="_blank" className="text-blue-600 underline font-medium hover:text-blue-800">
                                นโยบายความเป็นส่วนตัว (PDPA)
                            </Link>
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button type="submit" disabled={submitStatus === 'submitting'} className={`px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center ${submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {submitStatus === 'submitting' ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลให้เจ้าหน้าที่'} <CheckCircle2 className="w-4 h-4 ml-2" />
                </button>
            </div>

            {submitStatus === 'error' && <p className="text-center text-sm font-medium text-red-600 mt-3 flex items-center justify-center"><Info className="w-4 h-4 mr-1.5" /> เกิดข้อผิดพลาด! กรุณาลองใหม่อีกครั้ง</p>}
        </form>
    );
};

interface ContactStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: ContactStaffFormData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    submitStatus: 'idle' | 'submitting' | 'success' | 'error';
    centerName: string;
}

const ContactStaffModal: React.FC<ContactStaffModalProps> = ({ isOpen, onClose, formData, handleInputChange, handleSubmit, submitStatus, centerName }) => {
    if (!isOpen) return null;

    const modalTitle = submitStatus === 'success' ?
        'ส่งข้อมูลสำเร็จ' :
        `ติดต่อเจ้าหน้าที่`;

    return (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col p-5 sm:p-8 relative">
                {submitStatus !== 'success' && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10">
                        <X className="w-5 h-5" />
                    </button>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6 shrink-0 pr-8 pl-4">
                    {submitStatus === 'success' ? (
                        <span className="text-green-600">{modalTitle}</span>
                    ) : (
                        <>
                            {modalTitle} <span className="text-blue-600 block text-base sm:text-lg mt-1">{centerName}</span>
                        </>
                    )}
                </h2>

                <div className="overflow-y-auto flex-grow pr-1 scrollbar-hide max-h-[calc(92vh-100px)]">
                    <ContactStaffForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        submitStatus={submitStatus}
                    />
                </div>
            </div>
        </div>
    );
};


// Helper to get English sub-name
const getRoomSubName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('เดี่ยว')) return 'Private Room';
    if (lower.includes('รวม')) return 'Shared Room';
    if (lower.includes('คู่')) return 'Twin Room';
    if (lower.includes('พิเศษ')) return 'Special Room';
    if (lower.includes('premium')) return 'Premium Room';
    if (lower.includes('vip')) return 'VIP Room';
    return 'Care Room';
};

// Helper to get pill badge
const getRoomBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('เดี่ยว')) {
        return { text: 'ความเป็นส่วนตัว', icon: <User className="w-4 h-4 text-[#2b64a0]" /> };
    }
    if (lower.includes('รวม')) {
        return { text: 'ราคาประหยัด', icon: <DollarSign className="w-4 h-4 text-[#2b64a0]" /> };
    }
    if (lower.includes('คู่')) {
        return { text: 'พักได้ 2 ท่าน', icon: <Users className="w-4 h-4 text-[#2b64a0]" /> };
    }
    return { text: 'มาตรฐาน สบส.', icon: <ShieldCheck className="w-4 h-4 text-[#2b64a0]" /> };
};

// Helper to get default target audience description
const getRoomDefaultDescription = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('เดี่ยว')) {
        return 'ผู้ที่ต้องการความเป็นส่วนตัวสูง, ญาติเข้าเยี่ยมได้สะดวก, หรือผู้ที่ต้องการความเงียบสงบในการพักผ่อน';
    }
    if (lower.includes('รวม')) {
        return 'ผู้สูงอายุที่ชอบสังคม ไม่ชอบอยู่คนเดียว, ต้องการประหยัดค่าใช้จ่าย แต่ยังได้รับการดูแลมาตรฐานครบถ้วน';
    }
    if (lower.includes('คู่')) {
        return 'คู่สามีภรรยา, พี่น้อง หรือเพื่อนที่ต้องการพักห้องเดียวกัน เพื่อให้อุ่นใจและดูแลกันได้ใกล้ชิด';
    }
    return 'ผู้ต้องการการดูแลระดับมาตรฐาน พร้อมสิ่งอำนวยความสะดวกครบครัน';
};

const RoomTypeCard = ({
    room,
    onInquire,
    onOpenGallery
}: {
    room: RoomType;
    onInquire: (roomName: string) => void;
    onOpenGallery: (images: string[], index: number) => void;
}) => {
    const images = Array.isArray(room.imageUrls) && room.imageUrls.length > 0 ? room.imageUrls : [];
    const badge = getRoomBadge(room.name);
    const subName = getRoomSubName(room.name);
    const targetDesc = room.description || getRoomDefaultDescription(room.name);

    return (
        <div className="bg-white text-slate-800 rounded-none sm:rounded-lg p-4 sm:p-6 shadow-sm border-y border-slate-200 border-x-0 sm:border sm:border-slate-200 -mx-4 sm:mx-0 flex flex-col gap-6 mb-8 sm:mb-10 transition-all duration-300 hover:shadow-md hover:border-blue-200">

            {/* Top Row: Title & Subtitle + Badge */}
            <div className="flex flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex flex-row items-baseline flex-wrap gap-2">
                    <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight leading-tight">
                        {room.name}
                    </h3>
                    <span className="inline-block bg-blue-50 text-blue-600 text-[10px] md:text-sm font-extrabold px-2 py-0.5 md:px-2.5 md:py-1 rounded-md uppercase tracking-wider">
                        {subName}
                    </span>
                </div>

                {/* Feature Pill Badge */}
                <div className="bg-blue-50 text-blue-800 text-xs md:text-base font-bold px-2 py-1.5 md:px-3.5 md:py-2 rounded-md shadow-sm flex items-center gap-1.5 border border-blue-100 shrink-0">
                    {badge.icon}
                    {badge.text}
                </div>
            </div>

            {/* Middle Row: Suitability text */}
            <div className="flex items-start gap-2 text-sm md:text-base text-slate-700 leading-relaxed">
                <span className="shrink-0 text-base md:text-lg">🎯</span>
                <p>
                    <strong className="text-slate-900 font-sans font-extrabold text-base md:text-lg">เหมาะสำหรับ:</strong> {targetDesc}
                </p>
            </div>

            {/* Bottom Row: Status and Inquiry Button */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                {/* Bed Status */}
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-md w-fit">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    <span>{room.status || 'เตียงว่างพร้อมดูแลทันที'}</span>
                </div>

                {/* Inquiry Button */}
                <button
                    type="button"
                    onClick={() => onInquire(room.name)}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm md:text-base font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 self-end"
                >
                    <MessageSquare className="w-5 h-5" /> สอบถามราคาห้องนี้
                </button>
            </div>

            {/* Images Grid Block inside Card */}
            {images.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 md:grid md:grid-cols-3 md:gap-3">
                        {images.map((url, idx) => (
                            <div
                                key={url + idx}
                                onClick={() => onOpenGallery(images, idx)}
                                className="w-[88%] md:w-full shrink-0 snap-center relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-slate-200 group/img cursor-pointer bg-slate-50"
                            >
                                <img
                                    src={url}
                                    alt={`${room.name} view ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/600x400?text=No+Room+Image';
                                    }}
                                />
                                {/* Mobile pagination counter */}
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-sans md:hidden">
                                    {idx + 1} / {images.length}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// =========================================================================================
// MAIN COMPONENT
// =========================================================================================

export default function CenterDetailClient({
    center,
    nearbyCenters = [],
    relatedCenters = [],
    nearbyHospitals = [],
    nearbyTransitStations = []
}: {
    center: CareCenter;
    nearbyCenters?: (CareCenter & { distanceKm?: number })[];
    relatedCenters: CareCenter[];
    nearbyHospitals?: any[];
    nearbyTransitStations?: NearbyTransitStation[];
}) {
    const router = useRouter();

    const handleBackToSearch = (e: React.MouseEvent) => {
        if (typeof window !== 'undefined') {
            const savedQuery = sessionStorage.getItem('thaicarecenter_search_query');
            if (window.history.length > 1) {
                e.preventDefault();
                router.back();
            } else {
                e.preventDefault();
                router.push(savedQuery ? `/${savedQuery}` : '/');
            }
        }
    };

    const effectiveTransitStations = useMemo(() => {
        if (nearbyTransitStations && nearbyTransitStations.length > 0) {
            return nearbyTransitStations;
        }
        if (center?.lat && center?.lng) {
            return findTopNearbyTransitStations(Number(center.lat), Number(center.lng), 3, 20);
        }
        return [];
    }, [nearbyTransitStations, center?.lat, center?.lng]);
    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x600?text=No+Image';
    const allImages = useMemo(
        () => (center?.imageUrls?.length > 0 ? center.imageUrls : [PLACEHOLDER_IMAGE]),
        [center?.imageUrls]
    );

    // ทำความสะอาดข้อความเกี่ยวกับศูนย์ดูแล: ต้องไม่แสดงเบอร์มือถือ/ช่องทางโทรใดๆ ในส่วนนี้เด็ดขาด
    const cleanAboutHtml = useMemo(
        () => sanitizeAboutDescription(center?.description, center?.name, center?.province),
        [center?.description, center?.name, center?.province]
    );

    const [activeImage, setActiveImage] = useState<string>(center?.imageUrls?.[0] || '');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [initialModalIndex, setInitialModalIndex] = useState(0);
    const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>([]);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
    const [isContactStaffModalOpen, setIsContactStaffModalOpen] = useState(false);
    const [contactStaffFormData, setContactStaffFormData] = useState<ContactStaffFormData>({ name: '', phone: '' });

    // Lead Capture Friction Modal State
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isInfoUnlocked, setIsInfoUnlocked] = useState(false);
    const [leadModalConfig, setLeadModalConfig] = useState<{
        actionType: LeadActionType;
        destinationUrl?: string;
        onProceed?: () => void;
    }>({ actionType: 'navigation' });


    // ตรวจสอบว่าศูนย์นี้เคยถูกปลดล็อกใน Session ของผู้ใช้หรือไม่
    useEffect(() => {
        if (!center?.id) return;
        try {
            const unlockedStr = sessionStorage.getItem('tcc_unlocked_centers');
            if (unlockedStr) {
                const list = JSON.parse(unlockedStr);
                if (Array.isArray(list) && list.includes(center.id)) {
                    setIsInfoUnlocked(true);
                }
            }
        } catch {
            // ignore
        }
    }, [center?.id]);

    const unlockThisCenter = useCallback(() => {
        setIsInfoUnlocked(true);
        if (!center?.id) return;
        try {
            const unlockedStr = sessionStorage.getItem('tcc_unlocked_centers');
            const list = unlockedStr ? JSON.parse(unlockedStr) : [];
            if (Array.isArray(list) && !list.includes(center.id)) {
                list.push(center.id);
                sessionStorage.setItem('tcc_unlocked_centers', JSON.stringify(list));
            }
        } catch {
            // ignore
        }
    }, [center?.id]);

    const handleGatedAction = useCallback((
        actionType: LeadActionType,
        destinationUrl?: string,
        onProceed?: () => void
    ) => {
        // ตรวจสอบว่าศูนย์นี้เคยปลดล็อกในเซสชันนี้แล้วหรือไม่
        let isCurrentCenterUnlocked = false;
        try {
            const unlockedStr = sessionStorage.getItem('tcc_unlocked_centers');
            if (unlockedStr) {
                const list = JSON.parse(unlockedStr);
                if (Array.isArray(list) && center?.id && list.includes(center.id)) {
                    isCurrentCenterUnlocked = true;
                }
            }
        } catch {
            // ignore
        }

        if (isCurrentCenterUnlocked) {
            // ศูนย์นี้เคยยืนยันแล้วในเซสชันนี้ -> ให้ผ่านได้ทันที
            if (onProceed) {
                onProceed();
            } else if (destinationUrl) {
                if (destinationUrl.startsWith('tel:')) {
                    window.location.href = destinationUrl;
                } else {
                    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
                }
            }
            return;
        }

        // หากยังไม่ได้ปลดล็อกศูนย์นี้ (หรือเปลี่ยนไปดูศูนย์อื่น):
        // ให้เปิด LeadCaptureModal ซึ่งจะดึงข้อมูลเดิมที่เคยกรอก (ชื่อ, เบอร์, อาการ, ห้อง, ตำแหน่ง) มาแสดงอัตโนมัติ
        setLeadModalConfig({ actionType, destinationUrl, onProceed });
        setIsLeadModalOpen(true);
    }, [center]);

    // สถานะว่าศูนย์นี้อยู่ในตระกร้าหรือไม่
    const [isInBasket, setIsInBasket] = useState(false);

    useEffect(() => {
        if (!center?.id) return;
        setIsInBasket(isCenterInBasket(center.id));

        const handleBasketUpdated = () => {
            if (center?.id) setIsInBasket(isCenterInBasket(center.id));
        };
        window.addEventListener('tcc_basket_updated', handleBasketUpdated);
        return () => window.removeEventListener('tcc_basket_updated', handleBasketUpdated);
    }, [center?.id]);

    const handleToggleBasket = useCallback(() => {
        if (!center?.id) return;
        if (isInBasket) {
            // หากบันทึกแล้ว คลิกเพื่อเปิดแถบ "ศูนย์ที่คุณสนใจ"
            window.dispatchEvent(new Event('tcc_open_basket'));
        } else {
            // + สนใจศูนย์นี้: ต้องกรอกข้อมูลเยี่ยมชมก่อนเท่านั้น
            // จึงเปิดฟอร์มกรอกข้อมูลเพื่อนัดหมายเข้าชมศูนย์ (LeadCaptureModal)
            handleGatedAction('consultation');
        }
    }, [center, isInBasket, handleGatedAction]);

    const handleLeadSuccess = useCallback(() => {
        unlockThisCenter();
        if (center?.id) {
            addCenterToBasket({
                id: center.id,
                name: center.name,
                slug: createSlug(center.name),
                imageUrl: center.imageUrls?.[0] || center.brandLogoUrl || '',
                address: center.address || '',
                province: center.province || '',
                price: center.price || 0,
                phone: center.phone || '',
                actionType: leadModalConfig.actionType
            });
            setIsInBasket(true);
        }
        if (leadModalConfig.onProceed) {
            leadModalConfig.onProceed();
        }
    }, [center, leadModalConfig, unlockThisCenter]);

    const logTraffic = useCallback((eventType: string) => {
        if (!center) return;
        const verified = getVerifiedLead();
        const tracker = getVisitorTrackingData();
        fetch('/api/traffic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType,
                pagePath: window.location.pathname,
                centerId: center.id,
                centerName: center.name,
                visitorId: tracker.visitorId,
                sessionId: tracker.sessionId,
                utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
                utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || '',
                utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
                referrer: typeof document !== 'undefined' ? (document.referrer || '') : '',
                userPhone: verified?.phone || ''
            })
        }).catch(err => console.error('Error logging traffic:', err));
    }, [center]);
    const [contactStaffSubmitStatus, setContactStaffSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    // Initial Form State
    const initialFormData: ConsultationFormData = {
        name: '', phone: '', lineId: '', email: '',
        recipientName: '', recipientAge: '', relationshipToRecipient: '',
        roomType: '', branch: center?.name || '', budget: '', convenientTime: '', message: ''
    };
    const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);
    // Submit Status: idle | submitting | success | error
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    // ดึงข้อมูลที่เคยกรอกไว้มาแสดงในแบบฟอร์มปรึกษาและติดต่อเจ้าหน้าที่อัตโนมัติ
    useEffect(() => {
        const verified = getVerifiedLead();
        if (verified && (verified.phone || verified.name)) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || verified.name || '',
                phone: prev.phone || verified.phone || '',
                roomType: prev.roomType || verified.roomType || '',
                budget: prev.budget || verified.budget || '',
            }));
            setContactStaffFormData(prev => ({
                name: prev.name || verified.name || '',
                phone: prev.phone || verified.phone || '',
            }));
        }
    }, []);

    // ✅ ฟังก์ชันสร้าง Link พร้อม UTM โดยดึงค่าจาก API
    const createOutboundLink = (url?: string | null, content: string = 'detail_page_sidebar') => {
        if (!url) return '#';
        try {
            const targetUrl = new URL(url);

            // ใช้ค่าจาก API ถ้ามี, ถ้าไม่มีให้ใช้ค่า Default
            // ใช้ trim() เพื่อป้องกันช่องว่างที่อาจติดมาจาก JSON (เช่น "thaicarecenter\t")
            const source = center?.utmSource ? center.utmSource.trim() : 'thaicarecenter';
            const medium = center?.utmMedium ? center.utmMedium.trim() : 'referral';
            const campaign = center?.utmCampaign ? center.utmCampaign.trim() : 'directory_listing';

            targetUrl.searchParams.set('utm_source', source);
            targetUrl.searchParams.set('utm_medium', medium);
            targetUrl.searchParams.set('utm_campaign', campaign);
            targetUrl.searchParams.set('utm_content', content);

            return targetUrl.toString();
        } catch {
            return url;
        }
    };

    // Helper to create slug
    const createSlug = (name: string) => {
        return encodeURIComponent(name.replace(/\s+/g, '-'));
    };

    // Form Handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleInquireRoom = useCallback((roomName: string) => {
        setFormData(prev => ({ ...prev, roomType: roomName }));
        const element = document.getElementById('contact-sidebar');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-blue-500/30');
            setTimeout(() => {
                element.classList.remove('ring-4', 'ring-blue-500/30');
            }, 1500);
        }
    }, []);

    const handleOpenGallery = useCallback((images: string[], index: number) => {
        setCurrentGalleryImages(images);
        setInitialModalIndex(index);
        setIsGalleryOpen(true);
    }, []);

    // ✅ ส่วนที่แก้ไข: จัดการ Success State และการปิด Modal อัตโนมัติ
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('submitting');
        gtag.event({ action: 'start_consultation_form', category: 'Conversion', label: center?.name || 'Unknown' });

        try {
            const res = await fetch('/api/care-centers/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitStatus('success');
                if (formData.phone) {
                    saveVerifiedLead({
                        phone: formData.phone,
                        name: formData.name,
                        budget: formData.budget,
                        timeframe: formData.convenientTime,
                    });
                }
                if (center?.id) {
                    addCenterToBasket({
                        id: center.id,
                        name: center.name,
                        slug: createSlug(center.name),
                        imageUrl: center.imageUrls?.[0] || center.brandLogoUrl || '',
                        address: center.address || '',
                        province: center.province || '',
                        price: center.price || 0,
                        phone: center.phone || '',
                        actionType: 'consultation'
                    });
                }
                gtag.event({ action: 'submit_form_success', category: 'Conversion', label: center?.name || 'Unknown' });
                gtag.gtagReportConversion();

                // ✅ ตั้งเวลาปิด Modal อัตโนมัติหลังแสดงหน้า Success 3 วินาที
                setTimeout(() => {
                    setIsConsultationModalOpen(false); // ปิด Modal
                    setSubmitStatus('idle'); // Reset Status
                    // Reset Form State และเติมชื่อ Branch กลับเข้าไป
                    setFormData({ ...initialFormData, branch: center?.name || '' });
                }, 3000);

            } else {
                setSubmitStatus('error');
                // alert ถูกเอาออก
                gtag.event({ action: 'submit_form_error', category: 'Error', label: center?.name || 'Unknown' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            // alert ถูกเอาออก
        } finally {
            // ตั้งเวลา reset status สำหรับกรณี error
            if (submitStatus === 'error') {
                setTimeout(() => setSubmitStatus('idle'), 2000);
            }
        }
    };

    const handleContactStaffInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactStaffFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleContactStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactStaffSubmitStatus('submitting');
        gtag.event({ action: 'start_contact_staff_form', category: 'Conversion', label: center?.name || 'Unknown' });

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: contactStaffFormData.name,
                    phone: contactStaffFormData.phone,
                    subject: `ติดต่อเจ้าหน้าที่ - ${center?.name || ''}`,
                    message: `ลูกค้าลงชื่อให้เจ้าหน้าที่ติดต่อกลับเกี่ยวกับศูนย์: ${center?.name || ''} (เบอร์โทร: ${contactStaffFormData.phone})`,
                    email: '-'
                }),
            });

            if (res.ok) {
                setContactStaffSubmitStatus('success');
                if (contactStaffFormData.phone) {
                    saveVerifiedLead({
                        phone: contactStaffFormData.phone,
                        name: contactStaffFormData.name,
                    });
                }
                if (center?.id) {
                    addCenterToBasket({
                        id: center.id,
                        name: center.name,
                        slug: createSlug(center.name),
                        imageUrl: center.imageUrls?.[0] || center.brandLogoUrl || '',
                        address: center.address || '',
                        province: center.province || '',
                        price: center.price || 0,
                        phone: center.phone || '',
                        actionType: 'contact_staff'
                    });
                }
                gtag.event({ action: 'submit_contact_staff_success', category: 'Conversion', label: center?.name || 'Unknown' });
                gtag.gtagReportConversion();

                // ✅ ตั้งเวลาปิด Modal อัตโนมัติหลังแสดงหน้า Success 3 วินาที
                setTimeout(() => {
                    setIsContactStaffModalOpen(false);
                    setContactStaffSubmitStatus('idle');
                    setContactStaffFormData({ name: '', phone: '' });
                }, 3000);
            } else {
                setContactStaffSubmitStatus('error');
                gtag.event({ action: 'submit_contact_staff_error', category: 'Error', label: center?.name || 'Unknown' });
            }
        } catch (error) {
            console.error('Error submitting contact staff form:', error);
            setContactStaffSubmitStatus('error');
            gtag.event({ action: 'submit_contact_staff_error', category: 'Error', label: center?.name || 'Unknown' });
        } finally {
            if (contactStaffSubmitStatus === 'error') {
                setTimeout(() => setContactStaffSubmitStatus('idle'), 2000);
            }
        }
    };

    const getMapSrc = (iframeString: string | undefined): string | null => {
        if (!iframeString) return null;
        const match = iframeString.match(/src="([^"]+)"/);
        return match ? match[1] : null;
    };

    // Guard to prevent duplicate page_view logs (e.g. React StrictMode in development)
    const hasLoggedPageViewRef = useRef<number | string | null>(null);

    // Resets active image and form branch name when center prop changes
    useEffect(() => {
        if (center && hasLoggedPageViewRef.current !== center.id) {
            hasLoggedPageViewRef.current = center.id;
            setActiveImage(center.imageUrls?.[0] || '');
            setFormData(prev => ({ ...prev, branch: center.name }));

            gtag.event({
                action: 'view_item',
                category: 'Engagement',
                label: center.name,
                value: center.price,
                center_id: center.id
            });

            logTraffic('page_view');
        }
    }, [center, logTraffic]);

    // Scroll active page thumbnail into view
    useEffect(() => {
        const activeIndex = allImages.indexOf(activeImage);
        if (activeIndex !== -1) {
            const activeThumb = document.getElementById(`page-thumb-${activeIndex}`);
            if (activeThumb) {
                activeThumb.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeImage, allImages]);

    if (!center) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <Info className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลศูนย์ดูแล</h1>
                    <Link href="/" onClick={handleBackToSearch} className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium w-full">
                        <ArrowLeft className="w-5 h-5 mr-2" /> กลับหน้าค้นหา
                    </Link>
                </div>
            </div>
        );
    }

    const galleryImages = allImages.slice(0, 5);
    const mainImage = activeImage || galleryImages[0] || PLACEHOLDER_IMAGE;

    const hasValidCoordinates = Boolean(center.lat && center.lng && Number(center.lat) !== 0 && Number(center.lng) !== 0);
    const googleMapsDirectionsUrl = hasValidCoordinates
        ? `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + (center.address || ''))}`;
    const googleMapsEmbedUrl = hasValidCoordinates
        ? `https://maps.google.com/maps?q=${center.lat},${center.lng}&hl=th&z=16&output=embed`
        : (center.mapUrl ? getMapSrc(center.mapUrl) : null);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-left pb-4">
                    <Link href="/" onClick={handleBackToSearch} className="inline-flex items-center text-black-600 font-medium text-md hover:text-blue-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> กลับหน้าค้นหาศูนย์ดูแล
                    </Link>
                </div>

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-snug">{center.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                        <p className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0" /> {center.address || (center.province ? `จังหวัด${center.province}` : 'ประเทศไทย')}
                        </p>
                        <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-800 mr-1">{(center.rating || 0).toFixed(1)}</span>
                            <span className="text-gray-500">(รีวิว)</span>
                        </div>

                        {/* ✅ ใช้ isTrue เช็ค hasGovernmentCertificate */}
                        {isTrue(center.hasGovernmentCertificate) && (
                            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                <ShieldCheck className="h-3 w-3 mr-1" /> รับรองจาก กรม สบส.
                            </div>
                        )}

                        <div className="flex items-center bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                            <Info className="h-3 w-3 mr-1" /> ข้อมูลเบื้องต้น
                        </div>

                        {/* ปุ่มบันทึกศูนย์ที่คุณสนใจ */}
                        <button
                            type="button"
                            onClick={handleToggleBasket}
                            title={isInBasket ? 'คลิกเพื่อดูศูนย์ที่คุณสนใจทั้งหมด' : 'กรอกข้อมูลเพื่อนัดหมายเข้าชมศูนย์'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer active:scale-95 shadow-2xs ${
                                isInBasket
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                            }`}
                        >
                            <Building2 className={`w-3.5 h-3.5 ${isInBasket ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span>{isInBasket ? '✓ สนใจศูนย์นี้แล้ว' : '+ สนใจศูนย์นี้'}</span>
                        </button>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="space-y-4">
                    {/* Main Image Card */}
                    <div className="relative w-full h-[280px] sm:h-[350px] md:h-[480px] rounded-3xl overflow-hidden shadow-sm bg-slate-950 flex items-center justify-center">
                        {/* Blurred background for premium aspect-ratio filling */}
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-105 pointer-events-none"
                            style={{ backgroundImage: `url(${mainImage})` }}
                        />
                        <img
                            src={mainImage}
                            alt="Main center view"
                            className="relative z-10 max-w-full max-h-full object-contain transition-all duration-500 cursor-pointer hover:scale-101"
                            onClick={() => {
                                const currentIndex = allImages.indexOf(mainImage);
                                handleOpenGallery(allImages, currentIndex !== -1 ? currentIndex : 0);
                            }}
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                        />

                        {/* Share Button (Top Right) */}
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                            <ShareButton />
                        </div>

                        {/* Pagination Counter Badge (Bottom Left) */}
                        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-20">
                            {allImages.indexOf(activeImage || allImages[0]) + 1} / {allImages.length}
                        </div>

                        {/* View All Button (Bottom Right) */}
                        <button
                            onClick={() => {
                                const currentIndex = allImages.indexOf(activeImage || allImages[0]);
                                handleOpenGallery(allImages, currentIndex !== -1 ? currentIndex : 0);
                            }}
                            className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all border border-gray-200/60 flex items-center gap-1.5 z-20"
                        >
                            <Share2 className="w-4 h-4 text-gray-600" /> ดูทั้งหมด ({allImages.length})
                        </button>
                    </div>

                    {/* Thumbnails Carousel (Below Main Image) */}
                    <div className="w-full">
                        <div className="flex gap-3 overflow-x-auto py-1.5 scrollbar-hide snap-x snap-mandatory justify-start">
                            {allImages.map((url, idx) => {
                                const isActive = (activeImage || allImages[0]) === url;
                                return (
                                    <button
                                        key={idx}
                                        id={`page-thumb-${idx}`}
                                        onClick={() => {
                                            setActiveImage(url);
                                        }}
                                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-center ${isActive
                                            ? 'border-blue-500 scale-102 ring-4 ring-blue-500/20 opacity-100 shadow-md shadow-blue-500/10'
                                            : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={url}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-xl shadow-none sm:shadow-sm border-y border-x-0 sm:border border-gray-100 -mx-4 sm:mx-0">
                            <div className="flex items-center justify-between mb-5 border-b pb-3">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">เกี่ยวกับศูนย์ดูแล</h2>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                    ข้อมูลศูนย์
                                </span>
                            </div>
                            <div
                                className="prose max-w-none text-gray-800 leading-relaxed text-base md:text-lg animate-in fade-in duration-300"
                                dangerouslySetInnerHTML={{
                                    __html: cleanAboutHtml
                                }}
                            />
                        </section>
                        {center.services && center.services.length > 0 && (
                            <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-xl shadow-none sm:shadow-sm border-y border-x-0 sm:border border-gray-100 -mx-4 sm:mx-0">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">สิ่งอำนวยความสะดวกและบริการ</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                    {center.services.map((s, i) => (
                                        <div key={i} className="flex items-start p-3.5 rounded-lg bg-blue-50 text-blue-900 transition-colors hover:bg-blue-100/70">
                                            <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-base font-semibold leading-snug">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ✅ Room Types & Beds Section */}
                        {center.roomTypes && center.roomTypes.length > 0 && (
                            <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-lg shadow-none sm:shadow-sm border-y border-x-0 sm:border border-gray-100 -mx-4 sm:mx-0">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-6">
                                    <div className="flex flex-col">
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">ประเภทห้องพักและสถานะเตียงว่าง</h2>
                                        <p className="text-sm text-gray-500 mt-1 font-medium">ข้อมูลความพร้อมในการให้บริการของแต่ละประเภทห้องพัก</p>
                                    </div>
                                    <span className="text-xs md:text-sm text-blue-600 font-extrabold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 mt-1 sm:mt-0 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                        อัปเดตเรียลไทม์
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {center.roomTypes.map((room, idx) => (
                                        <RoomTypeCard key={idx} room={room} onInquire={handleInquireRoom} onOpenGallery={handleOpenGallery} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ✅ Packages (ซ่อนไว้ชั่วคราว)
                        Array.isArray(center.packages) && center.packages.length > 0 && (
                            <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-y border-x-0 sm:border border-slate-100 -mx-4 sm:mx-0">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 gap-2">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-100">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                            <span>แผนการดูแลมาตรฐาน</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">รายละเอียดแผนการดูแล</h2>
                                    </div>
                                    <span className="text-xs md:text-sm text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/60 mt-1 sm:mt-0">
                                        * ข้อมูลเบื้องต้น กรุณาสอบถามราคาอัปเดตล่าสุดกับศูนย์โดยตรง
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {center.packages.map((pkg, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 group flex flex-col h-full"
                                        >
                                            {/* 1. ส่วนหัว (ชื่อแพ็กเกจและราคา) */}
                                            {/*
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline pb-4 border-b border-slate-100 mb-4 gap-2">
                                                <h4 className="font-bold text-xl sm:text-2xl text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                                                    {pkg.name}
                                                </h4>
                                                <div className="flex items-baseline gap-1.5 shrink-0">
                                                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">
                                                        ฿{Number(pkg.price || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-semibold text-slate-500">/ ต่อเดือน</span>
                                                </div>
                                            </div>
                                            */}

                                            {/* 2. ส่วนรายละเอียด (Details) */}
                                            {/*
                                            <div className="flex-grow">
                                                {pkg.details && Array.isArray(pkg.details) && pkg.details.length > 0 ? (
                                                    <ul className="space-y-3">
                                                        {pkg.details.map((detail, dIdx) => (
                                                            <li key={dIdx} className="text-sm sm:text-base text-slate-700 font-medium flex items-start leading-relaxed gap-2.5">
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                                <span>{detail}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                                            <span className="text-blue-600 font-bold">สรุป:</span> เหมาะสำหรับผู้ที่ต้องการการดูแลระดับ {idx + 1}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            */}

                                            {/* 3. ปุ่มสอบถามแพ็กเกจนี้ */}
                                            {/*
                                            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleInquireRoom(pkg.name)}
                                                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>สอบถามแผนการดูแลนี้</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                        */}

                        {(hasValidCoordinates || center.mapUrl) && (
                            <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-xl shadow-none sm:shadow-sm border-y border-x-0 sm:border border-gray-100 -mx-4 sm:mx-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b pb-4">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">สถานที่ตั้ง</h2>
                                        {center.address && (
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-start gap-1.5">
                                                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                <span>{center.address}</span>
                                            </p>
                                        )}
                                    </div>
                                    <a
                                        href={googleMapsDirectionsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            gtag.event({ action: 'click_map_section_direction', category: 'Engagement', label: center.name });
                                            logTraffic('click_map');
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] shrink-0 self-start sm:self-auto cursor-pointer"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        นำทาง (Google Maps)
                                    </a>
                                </div>
                                <div className="rounded-xl overflow-hidden shadow-inner border h-[350px] bg-gray-100 relative">
                                    {googleMapsEmbedUrl ? (
                                        <iframe
                                            src={googleMapsEmbedUrl}
                                            width="100%" height="100%" style={{ border: 0 }}
                                            allowFullScreen loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="w-full h-full transition-all duration-500 filter grayscale-[5%] hover:grayscale-0"
                                            title={`Map of ${center.name}`}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
                                            <MapPin className="w-10 h-10 mb-2 opacity-30" />
                                            <span>ไม่สามารถโหลดแผนที่ได้</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* สถานพยาบาลที่อยู่ใกล้ */}
                        {nearbyHospitals && nearbyHospitals.length > 0 && (
                            <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-xl border-y border-x-0 sm:border border-gray-100 -mx-4 sm:mx-0">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2.5">
                                    <Image src="/images/badges/badge-hospital.png" alt="สถานพยาบาลใกล้เคียง" width={80} height={80} className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-xs" />
                                    <span>สถานพยาบาลที่อยู่ใกล้</span>
                                </h3>
                                <div className="space-y-2 text-sm sm:text-base">
                                    {nearbyHospitals.map((item, idx) => {
                                        const hosp = item.hospital;
                                        if (!hosp) return null;
                                        const hospRouteUrl = (center.lat && center.lng && hosp.latitude && hosp.longitude)
                                            ? `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${hosp.latitude},${hosp.longitude}`
                                            : (hosp.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.nameTh)}`);

                                        return (
                                            <div key={hosp.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-700 py-2 sm:py-2.5 border-b border-gray-50 last:border-b-0 gap-1 sm:gap-3 group">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <Link
                                                        href={`/hospitals/${hosp.id}?fromCenter=${encodeURIComponent(center.name)}&centerLat=${center.lat}&centerLng=${center.lng}`}
                                                        onClick={() => {
                                                            gtag.event({ action: 'click_nearby_hospital', category: 'Engagement', label: hosp.nameTh });
                                                            logTraffic('click_nearby_hospital');
                                                        }}
                                                        className="hover:text-blue-600 font-semibold text-gray-800 transition-colors text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-1"
                                                    >
                                                        {hosp.nameTh}
                                                    </Link>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                                    <span className="text-gray-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                        <span className="hidden sm:inline">ระยะประมาณ </span>
                                                        {Number(item.distanceKm).toFixed(1)} กม.
                                                        {item.durationMinutes && item.durationMinutes > 0 ? (
                                                            <span className="text-gray-400 font-normal text-xs ml-1">(~{item.durationMinutes} นาที)</span>
                                                        ) : null}
                                                    </span>
                                                    <a
                                                        href={hospRouteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => {
                                                            gtag.event({ action: 'click_hospital_map_route', category: 'Engagement', label: `${center.name} -> ${hosp.nameTh}` });
                                                            logTraffic('click_nearby_hospital_route');
                                                        }}
                                                        className="inline-flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                                                        title={`เปิดเส้นทางนำทางไป ${hosp.nameTh} ใน Google Maps`}
                                                    >
                                                        <Navigation className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ใกล้สถานีรถไฟ */}
                        {effectiveTransitStations && effectiveTransitStations.length > 0 && (
                            <section className="bg-white p-4 sm:p-6 rounded-none sm:rounded-xl border-y border-x-0 sm:border border-gray-100 -mx-4 sm:mx-0">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2.5">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-emerald-100 flex items-center justify-center shrink-0 drop-shadow-xs p-1.5 sm:p-2">
                                        <IconSearchTransit className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>ใกล้สถานีรถไฟ</span>
                                        <span className="text-xs text-gray-400 font-normal">สถานีรถไฟฟ้า / รถไฟใกล้เคียง 3 ลำดับแรก</span>
                                    </div>
                                </h3>
                                <div className="space-y-2 text-sm sm:text-base">
                                    {effectiveTransitStations.slice(0, 3).map((item, idx) => {
                                        const station = item.station;
                                        if (!station) return null;
                                        const routeUrl = center.lat && center.lng
                                            ? `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${station.lat},${station.lng}`
                                            : `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;
                                        const displayName = station.nameTh.startsWith('สถานี') ? station.nameTh : `สถานี${station.nameTh}`;

                                        return (
                                            <div key={station.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-700 py-2 sm:py-2.5 border-b border-gray-50 last:border-b-0 gap-1.5 sm:gap-3 group">
                                                <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                                                    <a
                                                        href={routeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => {
                                                            gtag.event({ action: 'click_nearby_transit', category: 'Engagement', label: displayName });
                                                            logTraffic('click_nearby_transit');
                                                        }}
                                                        className="hover:text-emerald-700 font-semibold text-gray-800 transition-colors text-sm sm:text-base leading-snug"
                                                        title={`ดูเส้นทางไป ${displayName} บน Google Maps`}
                                                    >
                                                        {displayName}
                                                    </a>
                                                    {getTransitLineBadge(station.lineCode, station.line)}
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                                    <span className="text-gray-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                        <span className="hidden sm:inline">ระยะประมาณ </span>
                                                        {Number(item.distanceKm).toFixed(1)} กม.
                                                        {item.durationMinutes && item.durationMinutes > 0 ? (
                                                            <span className="text-gray-400 font-normal text-xs ml-1">(~{item.durationMinutes} นาที)</span>
                                                        ) : null}
                                                    </span>
                                                    <a
                                                        href={routeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => {
                                                            gtag.event({ action: 'click_transit_map_route', category: 'Engagement', label: `${center.name} -> ${displayName}` });
                                                            logTraffic('click_nearby_transit_route');
                                                        }}
                                                        className="inline-flex items-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors p-1 rounded-md hover:bg-emerald-50"
                                                        title="เปิดเส้นทางนำทางใน Google Maps"
                                                    >
                                                        <Navigation className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>


                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <BrandCard brandName={center.brandName} brandLogoUrl={center.brandLogoUrl} />
                        <VerificationByMOPHCard
                            hasGovernmentCertificate={isTrue(center.hasGovernmentCertificate)}
                            mophOrder={center.mophOrder}
                            licenseNumber={center.licenseNumber}
                            mophApprovedDate={center.mophApprovedDate}
                        />
                        <div id="contact-sidebar" className="sticky top-24 bg-white rounded-none sm:rounded-3xl shadow-none sm:shadow-xl border-y border-x-0 sm:border border-gray-100 p-4 sm:p-5 -mx-4 sm:mx-0 z-10 transition-all duration-300 hover:shadow-2xl">
                            {/* Main Content Area */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Info Section */}
                                {center.price && Number(center.price) > 0 ? (
                                    <div className="space-y-3.5">
                                        {/* Price tag */}
                                        <div className="space-y-1">
                                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">อัตราค่าบริการ</div>
                                            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                                                <span className="text-2xl sm:text-3xl font-extrabold text-[#2b64a0] tracking-tight">
                                                    เริ่มต้น {Number(center.price).toLocaleString()} บ.
                                                </span>
                                                <span className="text-sm font-bold text-gray-800">/เดือน</span>
                                                <span className="text-xs font-bold text-red-500">(ไม่รวม VAT)</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Contact Header */}
                                <div className={`text-gray-400 text-xs font-semibold uppercase tracking-wider ${center.price && Number(center.price) > 0 ? 'border-t border-gray-100 pt-3' : ''}`}>
                                    ช่องทางการติดต่อ
                                </div>

                                {/* Buttons Stack */}
                                <div className="flex flex-col gap-2.5">
                                    {/* 1. ปุ่ม LINE หาเจ้าหน้าที่ */}
                                    <a
                                        href="https://line.me/R/ti/p/%40256zihiv"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            gtag.event({ action: 'click_line_button', category: 'Conversion', label: center.name });
                                            gtag.gtagReportLineConversion();
                                            logTraffic('click_line');
                                        }}
                                        className="w-full flex items-center justify-center px-5 py-3.5 bg-[#06C755] text-white text-base font-extrabold rounded-full shadow hover:bg-[#05a044] hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                    >
                                        <img
                                            src="/images/LINE_APP_iOS.png"
                                            alt="LINE Icon"
                                            className="w-5 h-5 object-contain mr-2 flex-shrink-0 animate-pulse"
                                        />
                                        LINE หาเจ้าหน้าที่
                                    </a>

                                    {/* 2. ปุ่ม Facebook */}
                                    <a
                                        href="https://www.facebook.com/profile.php?id=61584261862432"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            gtag.event({ action: 'click_facebook_button', category: 'Conversion', label: center.name });
                                            logTraffic('click_facebook');
                                        }}
                                        className="w-full flex items-center justify-center px-5 py-3.5 bg-[#1877F2] hover:bg-[#0c63d4] text-white text-base font-extrabold rounded-full shadow hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                    >
                                        <Facebook className="w-5 h-5 mr-2 text-white fill-current flex-shrink-0" />
                                        ติดต่อผ่าน Facebook
                                    </a>

                                    {/* 3. ปุ่มนัดเยี่ยมชมศูนย์ดูแล */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLeadModalConfig({ actionType: 'consultation' });
                                            setIsLeadModalOpen(true);
                                            gtag.event({ action: 'click_schedule_visit', category: 'Conversion', label: center.name });
                                            logTraffic('click_consultation');
                                        }}
                                        className="w-full flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-extrabold rounded-full shadow hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                    >
                                        <Calendar className="w-5 h-5 mr-2 text-white flex-shrink-0" />
                                        นัดเยี่ยมชมศูนย์ดูแล
                                    </button>

                                    {/* 4. ปุ่มเปิดแผนที่ / นำทาง */}
                                    <a
                                        href={googleMapsDirectionsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            gtag.event({ action: 'click_sidebar_map_navigation', category: 'Engagement', label: center.name });
                                            logTraffic('click_map');
                                        }}
                                        className="w-full flex items-center justify-center px-5 py-3 bg-white text-slate-800 border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/40 text-base font-extrabold rounded-full shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                    >
                                        <Navigation className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 group-hover:rotate-45 transition-transform" />
                                        เปิดแผนที่ / นำทาง
                                    </a>
                                </div>

                                {/* Reassurance Micro-Copy */}
                                <div className="mt-4 pt-3.5 border-t border-gray-100 text-center space-y-1">
                                    <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>ปรึกษาและสอบถามข้อมูลฟรี ไม่มีค่าบริการแอบแฝง</span>
                                    </p>
                                    <p className="text-[11px] text-gray-400">
                                        ทีมงาน ThaiCareCenter ประสานงานตรวจเช็กเตียงว่างและสิทธิประโยชน์ให้ฟรี
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nearby Centers Section (ศูนย์ดูแลใกล้เคียง) */}
                {
                    nearbyCenters && nearbyCenters.length > 0 && (
                        <div className="mt-20 border-t border-slate-200 pt-12">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-100">
                                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                        <span>ทำเลใกล้เคียง</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ศูนย์ดูแลใกล้เคียง</h2>
                                    <p className="text-slate-500 text-sm mt-1">ศูนย์ดูแลผู้สูงอายุและผู้มีภาวะพึ่งพิงในละแวกใกล้เคียง เดินทางสะดวก</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {nearbyCenters.map(nc => (
                                    <Link
                                        key={nc.id}
                                        href={`/${createSlug(nc.name)}`}
                                        className="block group h-full"
                                        onClick={() => gtag.event({ action: 'click_nearby_center', category: 'Navigation', label: nc.name })}
                                    >
                                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-100 overflow-hidden relative">
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={nc.imageUrls?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                                                    alt={nc.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                                {/* Starting Price Badge */}
                                                {nc.price && Number(nc.price) > 0 ? (
                                                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/60">
                                                        <span className="text-slate-500 font-medium text-[11px]">เริ่มต้น</span>
                                                        <span className="text-blue-600 font-extrabold">
                                                            ฿{Number(nc.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : null}

                                                {/* Distance Badge */}
                                                {nc.distanceKm !== undefined && (
                                                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-blue-100">
                                                        <Navigation className="w-3 h-3 shrink-0" />
                                                        <span>ห่าง ~{Number(nc.distanceKm).toFixed(1)} กม.</span>
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className="absolute bottom-3 right-3 flex items-center">
                                                    <span className="text-[10px] font-medium text-slate-600 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                                                        ข้อมูลเบื้องต้น
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex-grow flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {nc.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm flex items-center mb-3">
                                                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                                                        <span className="line-clamp-1">{nc.address}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center pt-2 border-t border-slate-100">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(nc.rating || 0) ? 'fill-current' : 'text-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-400 ml-2 font-medium">{nc.rating ? nc.rating.toFixed(1) : '0.0'} (รีวิว)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Recommended Centers Section */}
                {
                    relatedCenters.length > 0 && (
                        <div className="mt-16 border-t border-slate-200 pt-12">
                            <div className="mb-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-100">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    <span>ทางเลือกแนะนำ</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ศูนย์ดูแลอื่นๆ ที่น่าสนใจ</h2>
                                <p className="text-slate-500 text-sm mt-1">ศูนย์พันธมิตรในรัศมี 7 กม. หรือทางเลือกในช่วงราคาที่ใกล้เคียงกัน</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedCenters.map(rc => (
                                    <Link
                                        key={rc.id}
                                        href={`/${createSlug(rc.name)}`}
                                        className="block group h-full"
                                        onClick={() => gtag.event({ action: 'click_related_center', category: 'Navigation', label: rc.name })}
                                    >
                                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-100 overflow-hidden relative">
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={rc.imageUrls?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                                                    alt={rc.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                                {/* Starting Price Badge */}
                                                {rc.price && Number(rc.price) > 0 ? (
                                                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/60">
                                                        <span className="text-slate-500 font-medium text-[11px]">เริ่มต้น</span>
                                                        <span className="text-blue-600 font-extrabold">
                                                            ฿{Number(rc.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : null}

                                                {/* Status Badge */}
                                                <div className="absolute bottom-3 right-3 flex items-center">
                                                    <span className="text-[10px] font-medium text-slate-600 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                                                        ข้อมูลเบื้องต้น
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex-grow flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {rc.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm flex items-center mb-3">
                                                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                                                        <span className="line-clamp-1">{rc.address}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center pt-2 border-t border-slate-100">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rc.rating || 0) ? 'fill-current' : 'text-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-400 ml-2 font-medium">{rc.rating ? rc.rating.toFixed(1) : '0.0'} (รีวิว)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
            </main >

            {isGalleryOpen && (
                <GalleryModal
                    images={currentGalleryImages.length > 0 ? currentGalleryImages : allImages}
                    initialIndex={initialModalIndex}
                    onClose={() => setIsGalleryOpen(false)}
                />
            )}

            <ConsultationModal
                isOpen={isConsultationModalOpen}
                // ✅ เพิ่มการ Reset State เมื่อปิด Modal ด้วยปุ่ม X (ในกรณีที่ยังไม่ Success)
                onClose={() => {
                    setIsConsultationModalOpen(false);
                    setSubmitStatus('idle');
                    setFormData({ ...initialFormData, branch: center?.name || '' });
                }}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                submitStatus={submitStatus}
                centerName={center.name}
                roomTypes={center.roomTypes}
            />

            <ContactStaffModal
                isOpen={isContactStaffModalOpen}
                onClose={() => {
                    setIsContactStaffModalOpen(false);
                    setContactStaffSubmitStatus('idle');
                    setContactStaffFormData({ name: '', phone: '' });
                }}
                formData={contactStaffFormData}
                handleInputChange={handleContactStaffInputChange}
                handleSubmit={handleContactStaffSubmit}
                submitStatus={contactStaffSubmitStatus}
                centerName={center.name}
            />

            {/* Lead Capture Friction Modal (Consultation Theme, No OTP) */}
            <LeadCaptureModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                onSuccess={handleLeadSuccess}
                centerId={center.id}
                centerName={center.name}
                centerPhone={center.phone}
                centerImageUrl={center.imageUrls?.[0] || center.brandLogoUrl || ''}
                centerAddress={center.address || ''}
                actionType={leadModalConfig.actionType}
                destinationUrl={leadModalConfig.destinationUrl}
            />
        </div >

    );
}