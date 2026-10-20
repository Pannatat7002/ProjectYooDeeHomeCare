'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, ChevronDown, Info, ArrowRight, Compass, Phone, MessageCircle, MapPin, Building } from 'lucide-react';
import Link from 'next/link';
import { saveVerifiedLead, VerifiedLeadData } from '../lib/leadSession';
import * as gtag from '../lib/gtag';

export type LeadActionType = 'navigation' | 'call' | 'line' | 'consultation' | 'view_info' | 'contact';

export interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (verifiedData: VerifiedLeadData) => void;
    centerName?: string;
    centerPhone?: string;
    centerImageUrl?: string;
    centerAddress?: string;
    actionType?: LeadActionType;
    destinationUrl?: string;
}

export default function LeadCaptureModal({
    isOpen,
    onClose,
    onSuccess,
    centerName = 'ศูนย์ดูแล',
    centerPhone,
    centerImageUrl,
    centerAddress,
    actionType = 'navigation',
    destinationUrl
}: LeadCaptureModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [patientCondition, setPatientCondition] = useState('ผู้ป่วยติดเตียง');
    const [budget, setBudget] = useState('20,000 - 30,000');
    const [timeframe, setTimeframe] = useState('ด่วนภายใน 7 วัน');
    const [pdpaConsent, setPdpaConsent] = useState(true);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const actionText = {
        navigation: 'เปิดแผนที่นำทางสู่',
        call: 'โทรติดต่อเจ้าหน้าที่',
        line: 'ติดต่อผ่าน LINE ของ',
        consultation: 'นัดหมายเยี่ยมชม',
        view_info: 'ดูข้อมูลและรายละเอียดของ',
        contact: 'ติดต่อศูนย์ดูแล'
    }[actionType] || 'ดูข้อมูลของ';

    const buttonText = {
        navigation: 'ยืนยันและเปิดแผนที่นำทาง',
        call: 'ยืนยันและโทรออก',
        line: 'ยืนยันและเปิด LINE',
        consultation: 'ยืนยันข้อมูลเพื่อนัดหมาย',
        view_info: 'ยืนยันเพื่อดูข้อมูลศูนย์',
        contact: 'ยืนยันเพื่อติดต่อศูนย์ดูแล'
    }[actionType] || 'ยืนยันข้อมูล';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

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
            // 1. Post Lead to /api/care-centers/consultations พร้อมเก็บข้อมูลสำคัญครบถ้วน (UTM, ช่องทาง, วันที่นัด, อาการ)
            const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const utmSource = urlParams?.get('utm_source') || '';
            const utmMedium = urlParams?.get('utm_medium') || '';
            const utmCampaign = urlParams?.get('utm_campaign') || '';

            await fetch('/api/care-centers/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || 'ผู้สนใจบริการ',
                    phone: cleanPhone,
                    branch: centerName,
                    patientCondition,
                    condition: patientCondition,
                    budget: budget || 'ยังไม่ระบุ',
                    convenientTime: timeframe || 'ด่วนภายใน 7 วัน',
                    message: actionType === 'consultation'
                        ? `[นัดเยี่ยมชมศูนย์] สนใจนัดเข้าชม: ${centerName} | อาการ: ${patientCondition} | งบประมาณ: ${budget} | ความเร่งด่วน: ${timeframe}${utmSource ? ` | แหล่งที่มา: ${utmSource}/${utmMedium}` : ''}`
                        : `[Lead Capture] ดำเนินการ: ${actionText} ${centerName} | อาการ: ${patientCondition} | งบ: ${budget} | ความเร่งด่วน: ${timeframe}${utmSource ? ` | แหล่งที่มา: ${utmSource}` : ''}`,
                    roomType: 'ยังไม่ระบุห้องพัก',
                    utmSource,
                    utmMedium,
                    utmCampaign
                })
            });

            // 2. Save verified lead into Cookie & LocalStorage (30 days TTL)
            const savedData = saveVerifiedLead({
                phone: cleanPhone,
                name: name.trim(),
                patientCondition,
                condition: patientCondition,
                budget,
                timeframe
            });

            gtag.event({
                action: 'lead_capture_success',
                category: 'Conversion',
                label: `${centerName} | ${actionType}`
            });

            setSubmitStatus('success');

            // 3. Automatically proceed to destination after brief success display
            setTimeout(() => {
                onSuccess(savedData);
                onClose();
                if (destinationUrl) {
                    if (destinationUrl.startsWith('tel:')) {
                        window.location.href = destinationUrl;
                    } else {
                        window.open(destinationUrl, '_blank', 'noopener,noreferrer');
                    }
                }
            }, 1200);

        } catch (err) {
            console.error('Error submitting lead:', err);
            setSubmitStatus('error');
            setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
            <div className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${centerImageUrl ? 'max-w-3xl' : 'max-w-lg'} max-h-[92vh] sm:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden relative`}>
                
                {/* Close Button */}
                {submitStatus !== 'success' && (
                    <button
                        onClick={onClose}
                        aria-label="ปิดหน้าต่าง"
                        className={`absolute top-3.5 right-3.5 z-30 p-2 rounded-full transition-colors cursor-pointer ${
                            centerImageUrl 
                                ? 'bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm lg:text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Smartphone Photo Header (Natural aspect ratio, not squeezed) */}
                {centerImageUrl && submitStatus !== 'success' && (
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

                {/* Left Side: Form Container */}
                <div className={`flex-1 flex flex-col overflow-y-auto p-5 sm:p-7 ${centerImageUrl ? 'lg:w-7/12' : 'w-full'}`}>
                    {submitStatus === 'success' ? (
                        <div className="text-center py-12 px-4 space-y-4 animate-in fade-in duration-300 my-auto">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                            <h3 className="text-2xl font-extrabold text-green-700">ยืนยันข้อมูลสำเร็จ!</h3>
                            <p className="text-gray-700 text-sm font-medium">
                                เจ้าหน้าที่ศูนย์ดูแลจะติดต่อกลับตามเบอร์โทรศัพท์ที่ระบุไว้
                            </p>
                            <p className="text-xs text-gray-400">
                                ระบบบันทึกข้อมูลเรียบร้อยแล้ว กำลังนำท่านเข้าสู่ปลายทาง...
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* Header (Desktop & Clean Subtitle) */}
                            <div className="mb-4 pr-6">
                                <div className="hidden lg:flex items-center gap-2 mb-1.5">
                                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                        {actionText}
                                    </span>
                                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> ไม่มีค่าใช้จ่าย
                                    </span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                                    {centerName}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    ระบุข้อมูลเพื่อให้เจ้าหน้าที่ศูนย์ติดต่อประสานงานและเตรียมการต้อนรับ
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
                                            ชื่อผู้ติดต่อ
                                        </label>
                                        <input
                                            id="lead-name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="ระบุชื่อของคุณ (ถ้ามี)"
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm"
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

                                {/* Patient Condition (อาการ / ภาวะของผู้รับการดูแล) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="lead-condition" className="block text-xs font-semibold text-gray-700">
                                            อาการ / ภาวะของผู้รับการดูแล <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-blue-600 font-medium">เลือกอาการหรือแตะปุ่มด่วน</span>
                                    </div>
                                    <div className="relative">
                                        <select
                                            id="lead-condition"
                                            value={patientCondition}
                                            onChange={(e) => setPatientCondition(e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 text-sm appearance-none cursor-pointer font-medium"
                                        >
                                            <option value="ผู้ป่วยติดเตียง">ผู้ป่วยติดเตียง (Bedridden)</option>
                                            <option value="กึ่งติดเตียง / ใช้วีลแชร์">กึ่งติดเตียง / ใช้วีลแชร์ (Wheelchair)</option>
                                            <option value="ช่วยเหลือตัวเองได้">ช่วยเหลือตัวเองได้ / เดินได้ปกติ</option>
                                            <option value="พักฟื้นหลังผ่าตัด / Stroke">พักฟื้นหลังผ่าตัด / Stroke / กายภาพบำบัด</option>
                                            <option value="สมองเสื่อม / อัลไซเมอร์">สมองเสื่อม / อัลไซเมอร์ (Dementia)</option>
                                            <option value="ทั่วไป / ยังไม่ระบุ">ทั่วไป / ยังไม่ระบุ</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Quick Selection Tags */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {[
                                            { label: 'ติดเตียง', val: 'ผู้ป่วยติดเตียง' },
                                            { label: 'กึ่งติดเตียง/รถเข็น', val: 'กึ่งติดเตียง / ใช้วีลแชร์' },
                                            { label: 'เดินได้ปกติ', val: 'ช่วยเหลือตัวเองได้' },
                                            { label: 'พักฟื้น/Stroke', val: 'พักฟื้นหลังผ่าตัด / Stroke' },
                                            { label: 'สมองเสื่อม', val: 'สมองเสื่อม / อัลไซเมอร์' },
                                        ].map(item => (
                                            <button
                                                key={item.val}
                                                type="button"
                                                onClick={() => setPatientCondition(item.val)}
                                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                                                    patientCondition === item.val
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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
                                        disabled={submitStatus === 'submitting'}
                                        className={`w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                                            submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {submitStatus === 'submitting' ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                <span>กำลังบันทึกข้อมูล...</span>
                                            </>
                                        ) : (
                                            <>
                                                {actionType === 'navigation' && <Compass className="w-5 h-5" />}
                                                {actionType === 'call' && <Phone className="w-5 h-5" />}
                                                {actionType === 'line' && <MessageCircle className="w-5 h-5" />}
                                                <span>{buttonText}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Side: Center Image (Desktop Only: Edge-to-edge full height, zero ugly borders or framed boxes) */}
                {centerImageUrl && (
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
