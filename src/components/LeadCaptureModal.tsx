'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ChevronDown, Info, ArrowRight, Compass, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { saveVerifiedLead, VerifiedLeadData } from '../lib/leadSession';
import * as gtag from '../lib/gtag';

export type LeadActionType = 'navigation' | 'call' | 'line' | 'consultation';

export interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (verifiedData: VerifiedLeadData) => void;
    centerName?: string;
    centerPhone?: string;
    actionType?: LeadActionType;
    destinationUrl?: string;
}

export default function LeadCaptureModal({
    isOpen,
    onClose,
    onSuccess,
    centerName = 'ศูนย์ดูแล',
    actionType = 'navigation',
    destinationUrl
}: LeadCaptureModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
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
        consultation: 'นัดหมายเยี่ยมชม'
    }[actionType];

    const buttonText = {
        navigation: 'ยืนยันและเปิดแผนที่นำทาง',
        call: 'ยืนยันและโทรออก',
        line: 'ยืนยันและเปิด LINE',
        consultation: 'ยืนยันข้อมูลเพื่อนัดหมาย'
    }[actionType];

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
            // 1. Post Lead to /api/care-centers/consultations
            await fetch('/api/care-centers/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || 'ผู้สนใจบริการ',
                    phone: cleanPhone,
                    branch: centerName,
                    budget: budget || 'ยังไม่ระบุ',
                    convenientTime: timeframe || 'ด่วนภายใน 7 วัน',
                    message: `[Lead Capture] ดำเนินการ: ${actionText} ${centerName} | งบ: ${budget} | ความเร่งด่วน: ${timeframe}`,
                    roomType: 'ยังไม่ระบุห้องพัก'
                })
            });

            // 2. Save verified lead into Cookie & LocalStorage (30 days TTL)
            const savedData = saveVerifiedLead({
                phone: cleanPhone,
                name: name.trim(),
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
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col p-5 sm:p-8 relative">
                
                {/* Close Button */}
                {submitStatus !== 'success' && (
                    <button
                        onClick={onClose}
                        aria-label="ปิดหน้าต่าง"
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Modal Title (Theme matching ConsultationModal) */}
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6 shrink-0 pr-8 pl-4">
                    {submitStatus === 'success' ? (
                        <span className="text-green-600">บันทึกข้อมูลเรียบร้อยแล้ว</span>
                    ) : (
                        <>
                            <span>{actionText} </span>
                            <span className="text-blue-600">{centerName}</span>
                        </>
                    )}
                </h2>

                {/* Body Content */}
                <div className="overflow-y-auto flex-grow pr-1 scrollbar-hide">
                    {submitStatus === 'success' ? (
                        <div className="text-center py-10 px-4 space-y-4 animate-in fade-in duration-300">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                            <h3 className="text-2xl font-extrabold text-green-700">ยืนยันข้อมูลสำเร็จ!</h3>
                            <p className="text-gray-700 text-base font-medium">
                                กำลังนำท่านเข้าสู่ปลายทางตามที่เลือกไว้...
                            </p>
                            <p className="text-xs text-gray-400">
                                ระบบได้บันทึกความต้องการของคุณไว้แล้ว ท่านสามารถใช้งานต่อเนื่องได้ทันที
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errorMessage && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0 text-red-500" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 text-center mb-2">
                                กรุณาระบุข้อมูลเบื้องต้น เพื่อให้ศูนย์ดูแลเตรียมข้อมูลและอำนวยความสะดวกให้ท่านได้อย่างรวดเร็ว
                            </p>

                            {/* Contact Name & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="lead-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อผู้ติดต่อ
                                    </label>
                                    <input
                                        id="lead-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ระบุชื่อของคุณ (ถ้ามี)"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-700 mb-1">
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Budget & Timeframe Selects (matching ConsultationForm style) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="lead-budget" className="block text-sm font-medium text-gray-700 mb-1">
                                        งบประมาณที่คาดการณ์ต่อเดือน <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="lead-budget"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm appearance-none cursor-pointer"
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
                                    <label htmlFor="lead-timeframe" className="block text-sm font-medium text-gray-700 mb-1">
                                        ระยะเวลาที่ต้องการเข้าพัก / ประเมิน <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="lead-timeframe"
                                            value={timeframe}
                                            onChange={(e) => setTimeframe(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm appearance-none cursor-pointer"
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

                            {/* PDPA Consent Checkbox */}
                            <div className="pt-2">
                                <label className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed cursor-pointer bg-blue-50/50 p-3 rounded-xl border border-blue-100">
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
                                        </Link>{' '}
                                        (ระบบจะจดจำข้อมูลในเครื่องของคุณเป็นเวลา 30 วันเพื่อความสะดวกในการเข้าชมครั้งถัดไป)
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={submitStatus === 'submitting'}
                                    className={`w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer ${
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
                    )}
                </div>

            </div>
        </div>
    );
}
