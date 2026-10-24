'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, ChevronDown, Info, ArrowRight, Compass, Phone, MessageCircle, MapPin, Sparkles, Download, Check, Share2, Facebook, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { saveVerifiedLead, getVerifiedLead, VerifiedLeadData } from '../lib/leadSession';
import { downloadSlipFromDom, downloadLeadSlipImage, shareSlipFromDom } from '../lib/generateLeadSlip';
import { addCenterToBasket, createCenterSlug, isCenterInBasket } from '../lib/centerBasketSession';
import * as gtag from '../lib/gtag';

export type LeadActionType = 'navigation' | 'call' | 'line' | 'consultation' | 'view_info' | 'contact';

export interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (verifiedData: VerifiedLeadData) => void;
    centerId?: number;
    centerName?: string;
    centerPhone?: string;
    centerImageUrl?: string;
    centerAddress?: string;
    actionType?: LeadActionType;
    destinationUrl?: string;
    lineUrl?: string;
    facebookUrl?: string;
    initialRoomType?: string;
}

const conditionOptions = [
    { label: 'ติดเตียง', val: 'ผู้ป่วยติดเตียง' },
    { label: 'กึ่งติดเตียง/รถเข็น', val: 'กึ่งติดเตียง / ใช้วีลแชร์' },
    { label: 'เดินได้ปกติ', val: 'ช่วยเหลือตัวเองได้' },
    { label: 'พักฟื้น/Stroke', val: 'พักฟื้นหลังผ่าตัด / Stroke' },
    { label: 'สมองเสื่อม', val: 'สมองเสื่อม / อัลไซเมอร์' },
    { label: 'ทั่วไป/ไม่ระบุ', val: 'ทั่วไป / ยังไม่ระบุ' },
];

const roomTypeOptions = [
    { label: 'ห้องเดี่ยว', val: 'ห้องเดี่ยว' },
    { label: 'ห้องคู่', val: 'ห้องคู่' },
    { label: 'ห้องรวม', val: 'ห้องรวม' },
    { label: 'ไม่ระบุ', val: 'ไม่ระบุ' },
];

export default function LeadCaptureModal({
    isOpen,
    onClose,
    onSuccess,
    centerId,
    centerName = 'ศูนย์ดูแล',
    centerPhone,
    centerImageUrl,
    centerAddress,
    actionType = 'navigation',
    destinationUrl,
    lineUrl = 'https://line.me/R/ti/p/%40256zihiv',
    facebookUrl = 'https://www.facebook.com/profile.php?id=61584261862432',
    initialRoomType
}: LeadCaptureModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [patientCondition, setPatientCondition] = useState('ผู้ป่วยติดเตียง');
    const [roomType, setRoomType] = useState('ไม่ระบุ');
    const [budget, setBudget] = useState('20,000 - 30,000');
    const [timeframe, setTimeframe] = useState('ด่วนภายใน 7 วัน');
    const [pdpaConsent, setPdpaConsent] = useState(true);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [hasExistingData, setHasExistingData] = useState(false);
    const [isDownloadingSlip, setIsDownloadingSlip] = useState(false);
    const [isSharingSlip, setIsSharingSlip] = useState(false);
    const [hasDownloadedSlip, setHasDownloadedSlip] = useState(false);
    const slipCardRef = useRef<HTMLDivElement>(null);

    // ดึงข้อมูลเดิมที่เคยกรอกมาแสดงอัตโนมัติเมื่อเปิด Modal
    // และตรวจเช็กว่าศูนย์นี้เคยกดเยี่ยมชมแล้วหรือไม่ ถ้าเคยแล้วจะไม่แสดงให้กรอกใหม่ แต่จะแสดงใบนัดหมาย (Success) ทันที
    useEffect(() => {
        if (!isOpen) return;

        // หากมีการระบุประเภทห้องพักเข้ามา ให้ใช้ค่านั้นเป็นค่าเริ่มต้น
        if (initialRoomType) {
            if (initialRoomType.includes('เดี่ยว')) setRoomType('ห้องเดี่ยว');
            else if (initialRoomType.includes('คู่')) setRoomType('ห้องคู่');
            else if (initialRoomType.includes('รวม')) setRoomType('ห้องรวม');
            else setRoomType(initialRoomType);
        }

        const verified = getVerifiedLead();
        if (verified && (verified.phone || verified.name)) {
            setHasExistingData(true);
            if (verified.name) setName(verified.name);
            if (verified.phone) setPhone(verified.phone);
            if (verified.location) setLocation(verified.location);
            if (!initialRoomType && verified.roomType) setRoomType(verified.roomType);
            if (verified.patientCondition || verified.condition) {
                setPatientCondition(verified.patientCondition || verified.condition || 'ผู้ป่วยติดเตียง');
            }
            if (verified.budget) setBudget(verified.budget);
            if (verified.timeframe) setTimeframe(verified.timeframe);
        }

        // ตรวจสอบว่าศูนย์นี้เคยกดเยี่ยมชมหรือบันทึกไว้ในคุกกี้ (tcc_center_basket) แล้วหรือไม่
        const alreadyBooked = isCenterInBasket(centerId || 0, centerName);
        if (alreadyBooked) {
            setSubmitStatus('success');
        } else {
            setSubmitStatus('idle');
        }
    }, [isOpen, initialRoomType, centerId, centerName]);

    // จัดการปุ่ม Back บนมือถือ (และปุ่ม Esc) เพื่อปิด Modal โดยไม่ให้ออกจากหน้าเว็บ
    const isPushedRef = useRef(false);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            setSubmitStatus('idle');
            setErrorMessage('');
            if (isPushedRef.current) {
                isPushedRef.current = false;
                try {
                    if (window.history.state?.leadCaptureModalOpen) {
                        window.history.back();
                    }
                } catch (e) {
                    // Ignore
                }
            }
            return;
        }

        // ดันประวัติหน้าชั่วคราว เพื่อดักจับปุ่ม Back บนมือถือ
        if (!isPushedRef.current) {
            try {
                window.history.pushState({ leadCaptureModalOpen: true }, '');
                isPushedRef.current = true;
            } catch (e) {
                console.warn('Failed to pushState for modal:', e);
            }
        }

        const handlePopState = () => {
            isPushedRef.current = false;
            onCloseRef.current();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCloseRef.current();
            }
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const actionText = initialRoomType
        ? `สอบถามราคา: ${initialRoomType}`
        : ({
            navigation: 'เปิดแผนที่นำทางสู่',
            call: 'โทรติดต่อเจ้าหน้าที่',
            line: 'ติดต่อผ่าน LINE ของ',
            consultation: 'นัดหมายเยี่ยมชม',
            view_info: 'ดูข้อมูลและรายละเอียดของ',
            contact: 'ติดต่อศูนย์ดูแล'
        }[actionType] || 'ดูข้อมูลของ');

    const buttonText = initialRoomType
        ? `ยืนยันสอบถามราคา ${initialRoomType}`
        : ({
            navigation: 'ยืนยันและเปิดแผนที่นำทาง',
            call: 'ยืนยันและโทรออก',
            line: 'ยืนยันและเปิด LINE',
            consultation: 'ยืนยันข้อมูลเพื่อนัดหมาย',
            view_info: 'ยืนยันเพื่อดูข้อมูลศูนย์',
            contact: 'ยืนยันเพื่อติดต่อศูนย์ดูแล'
        }[actionType] || 'ยืนยันข้อมูล');

    const handleGetCurrentLocation = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setErrorMessage('อุปกรณ์ของคุณไม่รองรับการดึงพิกัดตำแหน่ง');
            return;
        }
        setIsLocating(true);
        setErrorMessage('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=th`,
                        { headers: { 'Accept-Language': 'th,en' } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const addr = data.address || {};
                        const district = addr.suburb || addr.district || addr.subdistrict || addr.quarter;
                        const province = addr.city || addr.province || addr.state;
                        const parts = [district, province].filter(Boolean);
                        if (parts.length > 0) {
                            setLocation(parts.join(', '));
                            setIsLocating(false);
                            return;
                        }
                    }
                } catch {
                    // Fallback to coords
                }
                setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                setIsLocating(false);
            },
            (err) => {
                console.warn('Geolocation error:', err);
                setIsLocating(false);
                setErrorMessage('ไม่สามารถระบุพิกัดอัตโนมัติได้ กรุณากรอกทำเลหรือเขตที่สะดวกด้วยตนเอง');
            },
            { timeout: 7000, enableHighAccuracy: false }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name.trim()) {
            setErrorMessage('กรุณาระบุชื่อผู้ติดต่อ');
            return;
        }

        const cleanPhone = phone.trim().replace(/[^\d]/g, '');
        if (cleanPhone.length < 9 || cleanPhone.length > 11 || !cleanPhone.startsWith('0')) {
            setErrorMessage('กรุณาระบุหมายเลขโทรศัพท์ 10 หลักที่ถูกต้อง (เช่น 0812345678)');
            return;
        }

        if (!pdpaConsent) {
            setErrorMessage('กรุณายินยอมเงื่อนไขการให้ข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)');
            return;
        }

        setSubmitStatus('submitting');

        try {
            // 1. Post Lead to /api/care-centers/consultations พร้อมหน่วงเวลาขั้นต่ำ 800ms เพื่อให้หน้าโหลดแสดงอย่างสมบูรณ์
            const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const utmSource = urlParams?.get('utm_source') || '';
            const utmMedium = urlParams?.get('utm_medium') || '';
            const utmCampaign = urlParams?.get('utm_campaign') || '';

            const trimmedLocation = location.trim();
            const locationText = trimmedLocation ? ` | ทำเล/ตำแหน่ง: ${trimmedLocation}` : '';

            try {
                await Promise.all([
                    fetch('/api/care-centers/consultations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: name.trim(),
                            phone: cleanPhone,
                            branch: centerName,
                            patientCondition,
                            condition: patientCondition,
                            roomType: roomType || 'ไม่ระบุ',
                            location: trimmedLocation,
                            budget: budget || 'ยังไม่ระบุ',
                            convenientTime: timeframe || 'ด่วนภายใน 7 วัน',
                            message: initialRoomType
                                ? `[สอบถามราคาห้องพัก] สนใจห้อง: ${initialRoomType} | ศูนย์: ${centerName} | อาการ: ${patientCondition} | ห้อง: ${roomType}${locationText} | งบประมาณ: ${budget} | ความเร่งด่วน: ${timeframe}${utmSource ? ` | แหล่งที่มา: ${utmSource}/${utmMedium}` : ''}`
                                : actionType === 'consultation'
                                    ? `[นัดเยี่ยมชมศูนย์] สนใจนัดเข้าชม: ${centerName} | อาการ: ${patientCondition} | ห้อง: ${roomType}${locationText} | งบประมาณ: ${budget} | ความเร่งด่วน: ${timeframe}${utmSource ? ` | แหล่งที่มา: ${utmSource}/${utmMedium}` : ''}`
                                    : `[Lead Capture] ดำเนินการ: ${actionText} ${centerName} | อาการ: ${patientCondition} | ห้อง: ${roomType}${locationText} | งบ: ${budget} | ความเร่งด่วน: ${timeframe}${utmSource ? ` | แหล่งที่มา: ${utmSource}` : ''}`,
                            utmSource,
                            utmMedium,
                            utmCampaign
                        })
                    }),
                    new Promise((resolve) => setTimeout(resolve, 800))
                ]);
            } catch (fetchErr) {
                console.warn('API consultation fetch warning:', fetchErr);
            }

            // 2. Save verified lead into Cookie & LocalStorage (30 days TTL) พร้อม roomType และ location
            const savedData = saveVerifiedLead({
                phone: cleanPhone,
                name: name.trim(),
                patientCondition,
                condition: patientCondition,
                roomType: initialRoomType || roomType,
                location: trimmedLocation,
                budget,
                timeframe
            });

            // 3. บันทึกศูนย์นี้ลงในตระกร้าศูนย์ที่เลือก (Cookie 30 วัน)
            if (centerName) {
                try {
                    addCenterToBasket({
                        id: centerId || Math.floor(Math.random() * 900000 + 100000),
                        name: centerName,
                        slug: createCenterSlug(centerName),
                        imageUrl: centerImageUrl || '',
                        address: centerAddress || '',
                        phone: centerPhone || '',
                        actionType: actionType
                    });
                } catch (basketErr) {
                    console.warn('Basket save error:', basketErr);
                }
            }

            gtag.event({
                action: 'lead_capture_success',
                category: 'Conversion',
                label: `${centerName} | ${actionType}`
            });

            // 4. แจ้ง onSuccess ไปยัง parent เพื่อปลดล็อกศูนย์
            if (onSuccess) {
                try {
                    onSuccess(savedData);
                } catch (callbackErr) {
                    console.warn('onSuccess callback error:', callbackErr);
                }
            }

            // บันทึกสำเร็จ: แสดงหน้าจอยืนยันพร้อมตัวเลือกบันทึกรูปภาพใบนัดหมาย
            setSubmitStatus('success');

        } catch (err) {
            console.error('Error submitting lead:', err);
            setSubmitStatus('error');
            setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleDownloadSlip = async () => {
        setIsDownloadingSlip(true);
        try {
            const filename = `ใบนัดหมาย-${centerName.replace(/[\/\\?%*:|"<>]/g, '-')}.png`;
            if (slipCardRef.current) {
                // แปลง DOM Card ที่แสดงบนหน้าจอเป็นรูปภาพโดยตรง (แบบที่ 2)
                await downloadSlipFromDom(slipCardRef.current, filename);
                setHasDownloadedSlip(true);
            } else {
                // Fallback Canvas
                const ok = await downloadLeadSlipImage({
                    centerName,
                    name: name.trim(),
                    phone: phone.trim(),
                    location: location.trim(),
                    patientCondition,
                    roomType,
                    budget,
                    timeframe,
                    submittedAt: new Date().toISOString()
                }, filename);
                if (ok) setHasDownloadedSlip(true);
            }
        } catch (err) {
            console.error('Error downloading slip via DOM:', err);
            // Fallback to Canvas
            try {
                await downloadLeadSlipImage({
                    centerName,
                    name: name.trim(),
                    phone: phone.trim(),
                    location: location.trim(),
                    patientCondition,
                    roomType,
                    budget,
                    timeframe,
                    submittedAt: new Date().toISOString()
                });
                setHasDownloadedSlip(true);
            } catch (e) {
                console.error('Canvas fallback error:', e);
            }
        } finally {
            setIsDownloadingSlip(false);
        }
    };

    const handleShareSlip = async () => {
        setIsSharingSlip(true);
        try {
            const filename = `ใบนัดหมาย-${centerName.replace(/[\/\\?%*:|"<>]/g, '-')}.png`;
            if (slipCardRef.current) {
                await shareSlipFromDom(slipCardRef.current, filename, `ใบนัดหมาย - ${centerName}`);
            }
        } catch (err) {
            console.error('Error sharing slip:', err);
        } finally {
            setIsSharingSlip(false);
        }
    };

    const handleProceed = () => {
        const cleanPhone = phone.trim().replace(/[^\d]/g, '');
        const savedData: VerifiedLeadData = {
            phone: cleanPhone,
            name: name.trim(),
            patientCondition,
            condition: patientCondition,
            roomType,
            location: location.trim(),
            budget,
            timeframe,
            verifiedAt: new Date().toISOString()
        };
        onSuccess(savedData);
        onClose();
        if (destinationUrl) {
            if (destinationUrl.startsWith('tel:')) {
                window.location.href = destinationUrl;
            } else {
                window.open(destinationUrl, '_blank', 'noopener,noreferrer');
            }
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200 cursor-pointer"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${centerImageUrl && submitStatus === 'idle' ? 'max-w-3xl' : 'max-w-lg'
                    } max-h-[92vh] sm:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden relative cursor-default`}
            >

                {/* Close Button พร้อมคำว่า "ปิด" ให้เห็นชัดเจน (ซ่อนขณะกำลังส่งข้อมูล) */}
                {submitStatus !== 'submitting' && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่าง"
                        className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md text-xs font-bold transition-all cursor-pointer border border-white/20 active:scale-95"
                    >
                        <X className="w-4 h-4" />
                        <span>ปิด</span>
                    </button>
                )}

                {/* Smartphone Photo Header (Natural aspect ratio, not squeezed) */}
                {centerImageUrl && submitStatus === 'idle' && (
                    <div className="relative w-full h-44 sm:h-48 shrink-0 block lg:hidden">
                        <Image
                            src={centerImageUrl}
                            alt={centerName}
                            fill
                            sizes="(max-width: 1024px) 100vw, 400px"
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-14 text-white">
                            <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block">
                                {actionText}
                            </span>
                            <h3 className="text-sm font-bold truncate drop-shadow-sm">{centerName}</h3>
                        </div>
                    </div>
                )}

                {/* Left Side: Form / Loading / Success Container */}
                <div className={`flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 ${centerImageUrl && submitStatus === 'idle' ? 'lg:w-7/12' : 'w-full'}`}>
                    {submitStatus === 'submitting' ? (
                        /* หน้าโหลดที่แสดงขึ้นมาทันทีเมื่อกดบันทึกหรือนัดเยี่ยมชม */
                        <div className="py-16 sm:py-24 px-4 text-center flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-300">
                            <div className="relative flex items-center justify-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-1.5 max-w-sm">
                                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                    กำลังบันทึกข้อมูลและส่งเรื่องนัดหมาย...
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    ระบบกำลังจัดเตรียมใบนัดหมายและส่งข้อมูลให้เจ้าหน้าที่ศูนย์ {centerName} กรุณารอสักครู่
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-xs font-semibold text-blue-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                <span>กำลังเชื่อมต่อฐานข้อมูลศูนย์ดูแล...</span>
                            </div>
                        </div>
                    ) : submitStatus === 'success' ? (
                        <div className="py-1 space-y-3.5 animate-in fade-in duration-300">
                            {/* Booking Slip Card (กล่องข้อมูลที่มีรูปภาพศูนย์ด้านบนเหมือนตอนกรอก พร้อมดาวน์โหลดลงเครื่อง) */}
                            <div
                                ref={slipCardRef}
                                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm text-left"
                            >
                                {/* รูปภาพศูนย์ด้านบนเหมือนตอนกรอก */}
                                {centerImageUrl ? (
                                    <div className="relative w-full h-44 sm:h-48 bg-slate-900 shrink-0">
                                        <img
                                            src={centerImageUrl}
                                            alt={centerName}
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                                            <h3 className="text-base sm:text-lg font-bold drop-shadow-sm text-white line-clamp-1">
                                                {centerName}
                                            </h3>
                                            {centerAddress && (
                                                <p className="text-[11px] text-white/80 line-clamp-1 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                                                    <span>{centerAddress}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-4 sm:p-5 text-white">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                                                THAI CARE CENTER
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                ✓ ใบนัดหมาย
                                            </span>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold">{centerName}</h3>
                                    </div>
                                )}

                                {/* รายละเอียดข้อมูลที่กรอก */}
                                <div className="p-4 sm:p-5 space-y-2.5 bg-white">
                                    <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-200 text-[11px] text-slate-500 font-mono">
                                        <span>ใบนัดหมายและข้อมูลประสานงาน</span>
                                        <span>
                                            {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span className="text-gray-500">ชื่อผู้ติดต่อ:</span>
                                            <span className="font-semibold text-gray-800">{name || 'ผู้รับบริการ'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span className="text-gray-500">หมายเลขโทรศัพท์:</span>
                                            <span className="font-bold text-blue-700 font-mono text-sm">{phone || '-'}</span>
                                        </div>
                                        {location && (
                                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                <span className="text-gray-500">ทำเล / ตำแหน่ง:</span>
                                                <span className="font-medium text-gray-800 text-right max-w-[210px] truncate">{location}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span className="text-gray-500">อาการ / ภาวะ:</span>
                                            <span className="font-medium text-gray-800 text-right max-w-[210px] truncate">{patientCondition || 'ทั่วไป / ยังไม่ระบุ'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span className="text-gray-500">ประเภทห้องพัก:</span>
                                            <span className="font-semibold text-emerald-700">{initialRoomType || roomType || 'ไม่ระบุ'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span className="text-gray-500">งบประมาณต่อเดือน:</span>
                                            <span className="font-medium text-gray-800">{budget || 'ยังไม่ระบุ'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-500">ระยะเวลาเข้าพัก:</span>
                                            <span className="font-medium text-gray-800">{timeframe || 'ด่วนภายใน 7 วัน'}</span>
                                        </div>
                                    </div>

                                    {/* ท้ายสลิป */}
                                    <div className="pt-2 border-t border-dashed border-slate-200 text-center space-y-0.5">
                                        <p className="text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                                            <span>เจ้าหน้าที่ศูนย์จะติดต่อกลับตามเบอร์โทรศัพท์ที่ระบุไว้</span>
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-mono">
                                            www.thaicarecenter.com | ศูนย์ประสานงานบริการดูแลผู้สูงอายุ
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ปุ่มคำสั่ง: บันทึกรูปภาพ (พร้อมปุ่มแชร์ด้านขวา) + ดำเนินการต่อ + ปิด */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadSlip}
                                        disabled={isDownloadingSlip || isSharingSlip}
                                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
                                    >
                                        {isDownloadingSlip ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                <span>กำลังดาวน์โหลดรูปภาพ...</span>
                                            </>
                                        ) : hasDownloadedSlip ? (
                                            <>
                                                <Check className="w-4 h-4 text-emerald-200" />
                                                <span>ดาวน์โหลดแล้ว</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>ดาวน์โหลดใบนัดหมาย</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Icon Share ด้านขวาปุ่มดาวน์โหลด */}
                                    <button
                                        type="button"
                                        onClick={handleShareSlip}
                                        disabled={isDownloadingSlip || isSharingSlip}
                                        title="แชร์รูปภาพใบนัดหมาย"
                                        aria-label="แชร์รูปภาพใบนัดหมาย"
                                        className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                                    >
                                        {isSharingSlip ? (
                                            <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <Share2 className="w-4 h-4 text-slate-700" />
                                        )}
                                    </button>
                                </div>

                                {/* ช่องทางติดต่อด่วน: LINE, Facebook, โทร */}
                                <div className="pt-1.5 space-y-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500 block">
                                        ช่องทางติดต่อเจ้าหน้าที่โดยตรง:
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {/* LINE */}
                                        <a
                                            href={lineUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => {
                                                gtag.event({ action: 'click_line_button', category: 'Conversion', label: centerName });
                                            }}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#06C755] hover:bg-[#05a044] text-white text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
                                        >
                                            <img
                                                src="/images/LINE_APP_iOS.png"
                                                alt="LINE"
                                                className="w-4 h-4 object-contain shrink-0"
                                            />
                                            <span>LINE</span>
                                        </a>

                                        {/* Facebook */}
                                        <a
                                            href={facebookUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => {
                                                gtag.event({ action: 'click_facebook_button', category: 'Conversion', label: centerName });
                                            }}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#0c63d4] text-white text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
                                        >
                                            <Facebook className="w-4 h-4 fill-current text-white shrink-0" />
                                            <span>Facebook</span>
                                        </a>

                                        {/* โทรปรึกษาทีมงาน ThaiCareCenter หรือ แผนที่นำทาง */}
                                        {destinationUrl && actionType === 'navigation' ? (
                                            <a
                                                href={destinationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
                                            >
                                                <Compass className="w-3.5 h-3.5 shrink-0" />
                                                <span>เปิดแผนที่</span>
                                            </a>
                                        ) : (
                                            <a
                                                href="tel:095-805-7052"
                                                onClick={() => {
                                                    gtag.event({ action: 'click_call_advisor_button', category: 'Conversion', label: '095-805-7052' });
                                                }}
                                                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
                                            >
                                                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                <span>โทรปรึกษาทีมงาน</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setSubmitStatus('idle')}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition cursor-pointer hover:underline"
                                    >
                                        แก้ไขข้อมูลการนัดหมาย
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-xs text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Header (Desktop & Clean Subtitle) */}
                            <div className="mb-4 pr-6">
                                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                                    {centerName}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {initialRoomType
                                        ? `ระบุข้อมูลเพื่อให้เจ้าหน้าที่ศูนย์แจ้งราคาและรายละเอียดของ ${initialRoomType}`
                                        : 'ระบุข้อมูลเพื่อให้เจ้าหน้าที่ศูนย์ติดต่อประสานงานและเตรียมการต้อนรับ'}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                {errorMessage && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                                        <Info className="w-4 h-4 flex-shrink-0 text-red-500" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {/* Contact Name & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="lead-name" className="block text-xs font-semibold text-gray-700 mb-1">
                                            ชื่อผู้ติดต่อ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="lead-name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="เช่น คุณสมชาย"
                                            required
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lead-phone" className="block text-xs font-semibold text-gray-700 mb-1">
                                            หมายเลขโทรศัพท์ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="lead-phone"
                                            type="tel"
                                            inputMode="numeric"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="เช่น 0812345678"
                                            maxLength={12}
                                            required
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Location / ตำแหน่ง (สามารถระบุตำแหน่งหรือดึงพิกัดได้) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="lead-location" className="block text-xs font-semibold text-gray-700">
                                            ตำแหน่ง / ทำเลที่ต้องการ <span className="text-gray-400 font-normal text-[11px]">(ถ้ามี)</span>
                                        </label>
                                        <span className="text-[11px] text-gray-500">พิมพ์ระบุ หรือกดปุ่มดึงพิกัด</span>
                                    </div>
                                    <div className="flex gap-2 items-stretch">
                                        <div className="relative flex-1 min-w-0">
                                            <input
                                                id="lead-location"
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="เช่น บางนา, รังสิต, นนทบุรี"
                                                className="w-full h-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm font-medium pr-8"
                                            />
                                            {location && (
                                                <button
                                                    type="button"
                                                    onClick={() => setLocation('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                                                    title="ล้างตำแหน่ง"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            disabled={isLocating}
                                            className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap"
                                        >
                                            <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce text-yellow-300' : 'text-white'}`} />
                                            <span>{isLocating ? 'กำลังดึงพิกัด...' : 'ตำแหน่งปัจจุบัน'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Patient Condition (อาการ / ภาวะของผู้รับการดูแล) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-semibold text-gray-700">
                                            อาการ / ภาวะของผู้รับการดูแล <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-blue-600 font-medium">แตะเลือกอาการ</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                        {conditionOptions.map(item => (
                                            <button
                                                key={item.val}
                                                type="button"
                                                onClick={() => setPatientCondition(item.val)}
                                                className={`text-xs px-2.5 py-2 rounded-xl border transition-all cursor-pointer text-center flex items-center justify-center font-medium ${patientCondition === item.val
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-semibold'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Room Type (ตัวเลือกห้อง เดี่ยว / คู่ / รวม / ไม่ระบุ) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        ประเภทห้องพักที่สนใจ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {roomTypeOptions.map(item => (
                                            <button
                                                key={item.val}
                                                type="button"
                                                onClick={() => setRoomType(item.val)}
                                                className={`text-xs px-1.5 py-2 rounded-xl border transition-all cursor-pointer text-center flex items-center justify-center font-medium ${roomType === item.val
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-semibold'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget & Timeframe Selects */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="lead-budget" className="block text-xs font-semibold text-gray-700 mb-1">
                                            งบประมาณต่อเดือน <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="lead-budget"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                required
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="ต่ำกว่า 20,000">ต่ำกว่า 20,000 บาท</option>
                                                <option value="20,000 - 30,000">20,000 - 30,000 บาท</option>
                                                <option value="มากกว่า 30,000">มากกว่า 30,000 บาท</option>
                                                <option value="ไม่ระบุ">ไม่ระบุ</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="lead-timeframe" className="block text-xs font-semibold text-gray-700 mb-1">
                                            ระยะเวลาเข้าพัก / เยี่ยมชม <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="lead-timeframe"
                                                value={timeframe}
                                                onChange={(e) => setTimeframe(e.target.value)}
                                                required
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="ด่วนภายใน 7 วัน">ด่วนภายใน 7 วัน</option>
                                                <option value="ภายใน 30 วัน">ภายใน 30 วัน</option>
                                                <option value="ศึกษาข้อมูลล่วงหน้า">ศึกษาข้อมูลล่วงหน้า</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PDPA Consent Checkbox (Clean, no tacky border box) */}
                                <div className="pt-0.5">
                                    <label className="flex items-start gap-2.5 text-[11px] sm:text-xs text-gray-500 leading-relaxed cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={pdpaConsent}
                                            onChange={(e) => setPdpaConsent(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                        />
                                        <span>
                                            ยินยอมให้ ThaiCareCenter บันทึกข้อมูลและประสานงานกับศูนย์ดูแลตาม{' '}
                                            <Link href="/privacy" target="_blank" className="text-blue-600 underline font-medium hover:text-blue-800">
                                                นโยบายความเป็นส่วนตัว (PDPA)
                                            </Link>
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {actionType === 'navigation' && <Compass className="w-5 h-5" />}
                                        {actionType === 'call' && <Phone className="w-5 h-5" />}
                                        {actionType === 'line' && <MessageCircle className="w-5 h-5" />}
                                        <span>{buttonText}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Side: Center Image (Desktop Only: Edge-to-edge full height, zero ugly borders or framed boxes) */}
                {centerImageUrl && submitStatus === 'idle' && (
                    <div className="hidden lg:block lg:w-5/12 shrink-0 relative min-h-[460px] bg-slate-900">
                        <Image
                            src={centerImageUrl}
                            alt={centerName}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                            <div className="space-y-1.5">
                                <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-blue-200 bg-blue-900/60 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                                    สถานที่จริง
                                </span>
                                <h3 className="text-base font-bold leading-snug drop-shadow-sm">
                                    {centerName}
                                </h3>
                                {centerAddress && (
                                    <p className="text-xs text-white/80 line-clamp-2 flex items-start gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                                        <span>{centerAddress}</span>
                                    </p>
                                )}
                                <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>ฟรี ไม่มีค่าใช้จ่ายในการนัดหมาย</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
