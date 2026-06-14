/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    MapPin, Star, Phone, Globe, CheckCircle2, ArrowLeft,
    Share2, ShieldCheck, Info, DollarSign, Calendar, X,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import * as gtag from '../../lib/gtag';
import { CareCenter } from '../../types/index';

// =========================================================================================
// UTILITIES & CONSTANTS
// =========================================================================================

const decodeSlug = (slug: string) => {
    return decodeURIComponent(slug).replace(/-/g, ' ');
};

const isTrue = (value: any) => !!value;

const formatPhone = (phone: any) => {
    if (!phone) return '';
    const str = phone.toString().trim();
    const fullStr = str.startsWith('0') ? str : '0' + str;
    if (fullStr.length === 10) {
        return `${fullStr.slice(0, 3)}-${fullStr.slice(3, 6)}-${fullStr.slice(6)}`;
    }
    return fullStr;
};

const getEndDayText = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${lastDay} นี้`;
};

const BrandCard = ({ brandName, brandLogoUrl }: { brandName?: string, brandLogoUrl?: string }) => {
    if (!brandName) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between gap-4">
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
const VerificationByMOPHCard = ({ hasGovernmentCertificate }: { hasGovernmentCertificate: boolean }) => {
    if (!hasGovernmentCertificate) return null;
    return (
        <Link href="https://esta.hss.moph.go.th/shop_passed.php?utm_source=thaicarecenter&utm_medium=%E0%B8%B4banner&utm_campaign=esta">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5 break-words">ผ่านการรับรองจากกรมสนับสนุนบริการสุขภาพ (สบส.)</h3>
                </div>
                <div className="h-12 w-20 flex-shrink-0 flex items-center justify-end">
                    <img src="/images/สบส.png" alt="สบส. Logo" className="max-h-full max-w-full object-contain" />                </div>
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
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ formData, handleInputChange, handleSubmit, submitStatus }) => {
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
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุชื่อ-นามสกุล" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">หมายเลขโทรศัพท์ <span className="text-red-500">*</span></label>
                            <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุเบอร์โทรศัพท์" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <option value="ห้องเดี่ยว">ห้องเดี่ยว</option>
                                    <option value="ห้องพักรวม">ห้องรวม</option>
                                    <option value="V.I.P">V.I.P</option>
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

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, formData, handleInputChange, handleSubmit, submitStatus, centerName }) => {
    if (!isOpen) return null;

    // ✅ ปรับ Title ตามสถานะ
    const modalTitle = submitStatus === 'success' ?
        'การนัดหมายสำเร็จ' :
        `นัดเยี่ยมชมศูนย์ ${centerName}`;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 relative">
                {/* ✅ ซ่อนปุ่ม X เมื่อแสดงหน้า Success เพื่อให้ปิดอัตโนมัติเท่านั้น หรือแสดงเพื่ออนุญาตให้ผู้ใช้ปิดเองทันที */}
                {submitStatus !== 'success' && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
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

                <ConsultationForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    submitStatus={submitStatus}
                />
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
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                        <input id="contactName" type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุชื่อ-นามสกุล" required />
                    </div>
                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">หมายเลขโทรศัพท์ <span className="text-red-500">*</span></label>
                        <input id="contactPhone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800" placeholder="ระบุเบอร์โทรศัพท์" required />
                    </div>
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 relative">
                {submitStatus !== 'success' && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {submitStatus === 'success' ? (
                        <span className="text-green-600">{modalTitle}</span>
                    ) : (
                        <>
                            {modalTitle} <span className="text-blue-600 block text-lg mt-1">{centerName}</span>
                        </>
                    )}
                </h2>

                <ContactStaffForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    submitStatus={submitStatus}
                />
            </div>
        </div>
    );
};

// =========================================================================================
// MAIN COMPONENT
// =========================================================================================

export default function CenterDetailClient({
    center,
    relatedCenters = []
}: {
    center: CareCenter;
    relatedCenters: CareCenter[];
}) {
    const [loading, setLoading] = useState(false);
    const [activeImage, setActiveImage] = useState<string>(center?.imageUrls?.[0] || '');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [initialModalIndex, setInitialModalIndex] = useState(0);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
    const [isContactStaffModalOpen, setIsContactStaffModalOpen] = useState(false);
    const [contactStaffFormData, setContactStaffFormData] = useState<ContactStaffFormData>({ name: '', phone: '' });

    const logTraffic = useCallback((eventType: string) => {
        if (!center) return;
        fetch('/api/traffic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType,
                pagePath: window.location.pathname,
                centerId: center.id,
                centerName: center.name,
                utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
                utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || '',
                utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
                referrer: document.referrer || ''
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

    // ✅ ฟังก์ชันสร้าง Link พร้อม UTM โดยดึงค่าจาก API
    const createOutboundLink = (url: string, content: string = 'detail_page_sidebar') => {
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
        } catch (e) {
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
                // ไม่ต้อง alert() และไม่ต้อง reset form ทันที
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

    // Resets active image and form branch name when center prop changes
    useEffect(() => {
        if (center) {
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm animate-pulse">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (!center) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <Info className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลศูนย์ดูแล</h1>
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium w-full">
                        <ArrowLeft className="w-5 h-5 mr-2" /> กลับหน้าค้นหา
                    </Link>
                </div>
            </div>
        );
    }

    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x600?text=No+Image';
    // ใช้ center.imageUrls ที่ถูก normalize แล้ว
    const allImages = center.imageUrls.length > 0 ? center.imageUrls : [PLACEHOLDER_IMAGE];
    const galleryImages = allImages.slice(0, 5);
    const mainImage = activeImage || galleryImages[0] || PLACEHOLDER_IMAGE;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-left pb-4">
                    <Link href="/" className="inline-flex items-center text-black-600 font-medium text-md hover:text-blue-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> กลับหน้าค้นหาศูนย์ดูแล
                    </Link>
                </div>

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-snug">{center.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                        <p className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {center.address}
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

                        {/* ✅ ใช้ isTrue เช็ค isPartner */}
                        {isTrue(center.isPartner) ? (
                            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Partner
                            </div>
                        ) : (
                            <div className="flex items-center bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                                <Info className="h-3 w-3 mr-1" /> ข้อมูลเบื้องต้น
                            </div>
                        )}
                    </div>

                    {/* Gallery Section */}
                    <div className="space-y-3">
                        {/* 1. Main Gallery Grid (Desktop: Grid 5 รูป / Mobile: แสดงรูปที่เลือกรูปเดียว) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden relative group shadow-sm">

                            {/* รูปหลัก (ซ้ายมือบน Desktop / รูปใหญ่รูปเดียวบน Mobile) */}
                            <div className="md:col-span-2 h-full overflow-hidden relative">
                                <img
                                    src={activeImage || allImages[0]}
                                    alt="Main center view"
                                    className="w-full h-full object-cover transition-transform duration-500 cursor-pointer hover:scale-105"
                                    onClick={() => {
                                        const currentIndex = allImages.indexOf(activeImage || allImages[0]);
                                        setInitialModalIndex(currentIndex !== -1 ? currentIndex : 0);
                                        setIsGalleryOpen(true);
                                    }}
                                    onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                                />
                                {/* แสดงเลขลำดับรูปเฉพาะบนมือถือ */}
                                <div className="md:hidden absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg">
                                    {allImages.indexOf(activeImage || allImages[0]) + 1} / {allImages.length}
                                </div>
                            </div>

                            {/* รูปย่อย 4 รูป (ซ่อนบน Mobile / แสดงบน Desktop) */}
                            <div className="hidden md:grid grid-cols-2 gap-2 md:col-span-2 h-full">
                                {allImages.slice(1, 5).map((url, idx) => (
                                    <div key={idx} className="relative h-full overflow-hidden">
                                        <img
                                            src={url}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 cursor-pointer hover:scale-110"
                                            onClick={() => {
                                                setInitialModalIndex(idx + 1);
                                                setIsGalleryOpen(true);
                                            }}
                                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                                        />
                                        {idx === 3 && allImages.length > 5 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-lg font-bold pointer-events-none">
                                                +{allImages.length - 5}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ปุ่ม Share & ปุ่มดูรูปทั้งหมด */}
                            <div className="absolute top-4 right-4"><ShareButton /></div>
                            <button
                                onClick={() => { setInitialModalIndex(0); setIsGalleryOpen(true); }}
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-bold shadow-md hover:bg-white transition-all border border-gray-200 flex items-center gap-2"
                            >
                                <Share2 className="w-3 h-3 md:w-4 md:h-4" /> ดูทั้งหมด ({allImages.length})
                            </button>
                        </div>

                        {/* 2. Thumbnail Scroller (แสดงเฉพาะบน Mobile) */}
                        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                            {allImages.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(url)}
                                    className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${(activeImage === url || (!activeImage && idx === 0))
                                        ? 'border-blue-600 ring-2 ring-blue-50 scale-95'
                                        : 'border-transparent opacity-60'
                                        }`}
                                >
                                    <img
                                        src={url}
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/*  ผ่านการยืนยัน Strip */}
                {isTrue(center.isPartner) && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
                        <div className="bg-gradient-to-r from-[#0E1B4F] to-blue-600 text-white p-5 md:p-6 flex flex-col md:flex-row items-center justify-between relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                            <div className="flex items-center relative z-10 w-full md:w-auto mb-4 md:mb-0">
                                <div className="bg-white/20 p-3 rounded-full mr-5 backdrop-blur-sm shadow-inner border border-white/10 shrink-0">
                                    <ShieldCheck className="w-8 h-8 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-extrabold flex items-center tracking-tight">
                                        ผ่านการยืนยัน
                                        <span className="ml-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                        </span>
                                    </h3>
                                    <p className="text-blue-100 text-sm md:text-base mt-1 font-medium">
                                        ศูนย์นี้ผ่านการตรวจสอบมาตรฐานความปลอดภัยและบริการโดยทีมงาน ThaiCareCenter
                                    </p>
                                </div>
                            </div>
                            <div className="relative z-10 flex items-center space-x-6 md:border-l md:border-white/20 md:pl-6">
                                <div className="text-center md:text-right">
                                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Status</p>
                                    <p className="font-bold text-white">Official Partner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">เกี่ยวกับศูนย์ดูแล</h2>
                            <div
                                className="prose max-w-none text-gray-700 leading-relaxed text-base"
                                dangerouslySetInnerHTML={{ __html: center.description }}
                            />
                        </section>
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">สิ่งอำนวยความสะดวกและบริการ</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {/* ✅ โค้ดที่ได้รับการแก้ไข: center.services ถูก Normalize เป็น Array ว่างแล้วใน useEffect */}
                                {center.services.map((s, i) => (
                                    <div key={i} className="flex items-start p-3 rounded-lg bg-blue-50 text-blue-700 transition-colors">
                                        <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{s}</span>
                                    </div>
                                ))}
                                {/* ถ้า services เป็น Array ว่าง ก็จะไม่แสดง error และจะไม่มีอะไรถูก map */}
                            </div>
                        </section>

                        {/* ✅ Packages: center.packages ถูก Normalize เป็น Array ว่างแล้วใน useEffect */}
                        {isTrue(center.isPartner) && center.packages.length > 0 && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">รายละเอียดแผนการดูแล</h2>
                                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 mt-1 sm:mt-0">
                                        * ข้อมูลเบื้องต้น กรุณาสอบถามราคาอัปเดตล่าสุดกับศูนย์โดยตรง
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {center.packages.map((pkg, idx) => (
                                        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 transform 
                          hover:border-green-500 hover:shadow-2xl hover:shadow-green-100/50 group flex flex-col h-full">

                                            {/* 1. ส่วนหัว (ชื่อแพ็กเกจและราคา) - ปรับปรุง */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 mb-4">

                                                {/* ชื่อแพ็กเกจ */}
                                                <h4 className="font-extrabold text-xl text-gray-900 group-hover:text-green-700 transition-colors mb-2 sm:mb-0">
                                                    {pkg.name}
                                                </h4>

                                                {/* ราคา (จะถูกจัดให้อยู่ด้านล่างชื่อแพ็กเกจในจอมือถือ เนื่องจาก div หลักใช้ flex-col) */}
                                                <div className="text-left sm:text-right flex-shrink-0">
                                                    <span className="block text-3xl font-extrabold text-green-600 tracking-tight">
                                                        ฿{pkg.price?.toLocaleString() ?? '0'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">/ ต่อเดือน</span>
                                                </div>
                                            </div>

                                            {/* 2. ส่วนรายละเอียด (Details) */}
                                            <div className="flex-grow">
                                                {pkg.details && Array.isArray(pkg.details) && pkg.details.length > 0 ? (
                                                    <ul className="space-y-3">
                                                        {pkg.details.map((detail, dIdx) => (
                                                            <li key={dIdx} className="text-base text-gray-700 flex items-start">
                                                                <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-500 shrink-0" />
                                                                {detail}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="p-4 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-500 font-medium italic">
                                                            <span className="text-green-600 font-bold">สรุป:</span> เหมาะสำหรับผู้ที่ต้องการการดูแลระดับ {idx + 1}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {center.mapUrl && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">สถานที่ตั้ง</h2>
                                <div className="rounded-xl overflow-hidden shadow-inner border h-[350px] bg-gray-100 relative">
                                    {getMapSrc(center.mapUrl) ? (
                                        <iframe
                                            src={getMapSrc(center.mapUrl)!}
                                            width="100%" height="100%" style={{ border: 0 }}
                                            allowFullScreen loading="lazy"
                                            className="filter grayscale-[10%] hover:grayscale-0 transition-all duration-500"
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
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <BrandCard brandName={center.brandName} brandLogoUrl={center.brandLogoUrl} />
                        <VerificationByMOPHCard hasGovernmentCertificate={isTrue(center.hasGovernmentCertificate)} />
                        <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-10 transition-all duration-300 hover:shadow-2xl">
                            {/* Main Content Area */}
                            <div className="grid grid-cols-1 gap-5">
                                {/* Info Section */}
                                {isTrue(center.isPartner) && (
                                    <div className="space-y-4">
                                        {/* Price tag */}
                                        <div className="space-y-1">
                                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">อัตราค่าบริการ</div>
                                            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                                                <span className="text-3xl font-extrabold text-[#2b64a0] tracking-tight">
                                                    {center.price && center.price > 0 ? `เริ่มต้น ${center.price.toLocaleString()} บ.` : 'เริ่มต้น 15,000 บ.'}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800">/เดือน</span>
                                                <span className="text-xs font-bold text-red-500">(ไม่รวม VAT)</span>
                                            </div>
                                        </div>

                                        {/* Promo Box */}
                                        <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3 shadow-inner">
                                            <div className="flex items-start text-gray-800 text-sm font-bold leading-normal">
                                                <span className="text-lg mr-2 shrink-0 animate-bounce">🔥</span>
                                                <div>
                                                    จองสิทธิ์ <span className="text-[#2b64a0]">"ทดลองเข้าพัก ฟรี 2 วัน"</span>
                                                    <span className="text-gray-500 text-xs block mt-0.5 font-semibold">
                                                        (รับจำนวนจำกัด)
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs font-extrabold text-[#2b64a0]">
                                                จองสิทธิ์ทดลองพักฟรี โทรเลย!
                                            </div>

                                            {/* Big Phone Number Box */}
                                            <a
                                                href={`tel:${center.phone || '0958057052'}`}
                                                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-blue-200 w-fit shadow-sm hover:border-[#2b64a0] hover:shadow transition-all group"
                                                onClick={() => {
                                                    gtag.event({ action: 'click_phone_promo', category: 'Conversion', label: center.name });
                                                    logTraffic('click_phone');
                                                }}
                                            >
                                                <Phone className="w-5 h-5 text-[#2b64a0] group-hover:scale-110 transition-transform flex-shrink-0" />
                                                <span className="text-lg font-extrabold text-[#2b64a0] tracking-wider">
                                                    {formatPhone(center.phone || '095-805-7052')}
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Header */}
                                <div className={`text-gray-400 text-xs font-semibold uppercase tracking-wider ${isTrue(center.isPartner) ? 'border-t border-gray-100 pt-4' : ''}`}>
                                    ช่องทางการติดต่อ
                                </div>

                                {/* Buttons Stack */}
                                <div className="flex flex-col gap-3">
                                    {isTrue(center.isPartner) ? (
                                        <>
                                            {/* 1. เข้าชมเว็บไซต์ */}
                                            {center.website && (
                                                <a
                                                    href={createOutboundLink(center.website, 'sidebar_website_btn')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => {
                                                        gtag.event({ action: 'click_website_sticky', category: 'Conversion', label: center.name });
                                                        logTraffic('click_website');
                                                    }}
                                                    className="w-full flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white text-base font-extrabold rounded-full shadow hover:bg-blue-700 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                                >
                                                    <Globe className="w-6 h-6 mr-2 text-white flex-shrink-0" />
                                                    ติดต่อศูนย์ดูแล
                                                </a>
                                            )}

                                            {/* 2. ติดต่อผ่าน LINE */}
                                            <a
                                                href="https://line.me/R/ti/p/%40256zihiv"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => {
                                                    gtag.event({ action: 'click_line_button', category: 'Conversion', label: center.name });
                                                    gtag.gtagReportLineConversion();
                                                    logTraffic('click_line');
                                                }}
                                                className="w-full flex items-center justify-center px-6 py-3.5 bg-[#06C755] text-white text-base font-extrabold rounded-full shadow hover:bg-[#05a044] hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                            >
                                                <img
                                                    src="/images/LINE_APP_iOS.png"
                                                    alt="LINE Icon"
                                                    className="w-6 h-6 object-contain mr-2 flex-shrink-0"
                                                />
                                                ติดต่อผ่าน LINE
                                            </a>

                                            {/* 3. ติดต่อเจ้าหน้าที่ */}
                                            {center.phone ? (
                                                <a
                                                    href={`tel:${center.phone}`}
                                                    onClick={() => {
                                                        gtag.event({ action: 'click_phone_button', category: 'Conversion', label: center.name });
                                                        logTraffic('click_phone');
                                                    }}
                                                    className="w-full flex items-center justify-center px-6 py-3.5 bg-white text-blue-600 border-2 border-blue-100 text-base font-extrabold rounded-full shadow hover:border-blue-500 hover:bg-blue-50/50 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                                >
                                                    <Phone className="w-6 h-6 mr-2 text-blue-600 fill-current flex-shrink-0" />
                                                    ติดต่อเจ้าหน้าที่
                                                </a>
                                            ) : null}

                                            {/* Line Separator */}
                                            <div className="border-t border-gray-100 my-1" />

                                            {/* 4. นัดเยี่ยมชมศูนย์ */}
                                            <button
                                                onClick={() => {
                                                    setIsConsultationModalOpen(true);
                                                    gtag.event({ action: 'click_schedule_visit', category: 'Conversion', label: center.name });
                                                }}
                                                className="w-full flex items-center justify-center px-6 py-3 bg-blue-50/50 text-blue-600 border border-blue-100 text-base font-bold rounded-full hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-[0.98] group cursor-pointer"
                                            >
                                                <Calendar className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
                                                นัดเยี่ยมชมศูนย์
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {/* Web / Website button (Solid blue button style with white text) */}
                                            {center.website ? (
                                                <a
                                                    href={createOutboundLink(center.website, 'sidebar_website_btn')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => {
                                                        gtag.event({ action: 'click_website_sticky', category: 'Conversion', label: center.name });
                                                        logTraffic('click_website');
                                                    }}
                                                    className="w-full flex items-center justify-center px-6 py-3.5 bg-[#2b64a0] text-white text-base font-extrabold rounded-full shadow hover:bg-[#1e4a77] hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                                                >
                                                    <Globe className="w-6 h-6 mr-2 text-white flex-shrink-0" />
                                                    ติดต่อศูนย์ดูแล
                                                </a>
                                            ) : (
                                                <div className="text-center p-3.5 bg-gray-50 border border-dashed rounded-full text-gray-400 text-xs font-semibold">
                                                    ยังไม่มีข้อมูลเว็บไซต์ทางการ
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>

                            {isTrue(center.isPartner) && (
                                <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400">ติดต่อผ่าน ThaiCareCenter ไม่มีค่าใช้จ่ายเพิ่มเติม</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommended Centers Section */}
                {relatedCenters.length > 0 && (
                    <div className="mt-20 border-t border-gray-200 pt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">ศูนย์ดูแลอื่นๆ ที่น่าสนใจ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedCenters.map(rc => (
                                <Link
                                    key={rc.id}
                                    href={`/${createSlug(rc.name)}`}
                                    className="block group"
                                    onClick={() => gtag.event({ action: 'click_related_center', category: 'Navigation', label: rc.name })}
                                >
                                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden relative">
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={rc.imageUrls?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                                                alt={rc.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                {rc.type === 'daily' && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">รายวัน</span>}
                                                {rc.type === 'monthly' && <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">รายเดือน</span>}
                                                {rc.type === 'both' && <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">รายวัน/เดือน</span>}
                                            </div>
                                            {isTrue(rc.hasGovernmentCertificate) && (
                                                <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> กรม สบส.
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {rc.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm flex items-center mb-3">
                                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                                                <span className="line-clamp-1">{rc.address}</span>
                                            </p>
                                            <div className="flex items-center mb-4">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rc.rating || 0) ? 'fill-current' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400 ml-2 font-medium">{rc.rating ? rc.rating.toFixed(1) : '0.0'} (รีวิว)</span>
                                            </div>
                                            {/* <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-green-600 font-bold mb-0.5">ค้นหาและเข้าใช้งาน</p>
                                                    <p className="text-sm font-extrabold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg inline-block">
                                                        ฟรีไม่มีค่าใช้จ่าย
                                                    </p>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-200 transition-colors">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {isGalleryOpen && (
                <GalleryModal
                    images={allImages}
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
        </div>
    );
}