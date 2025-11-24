'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    MapPin, Star, Phone, Globe, CheckCircle2, ArrowLeft,
    Share2, Heart, ShieldCheck, Info, DollarSign, Calendar, X,
    ChevronDown,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import * as gtag from '../../lib/gtag';
import { CareCenter } from '../../types';

// =========================================================================================
// UTILITIES & CONSTANTS
// =========================================================================================

// Utility function remains the same
const decodeSlug = (slug: string) => {
    return decodeURIComponent(slug).replace(/-/g, ' ');
};

// Form State Interface/Type (For better type safety if not using Zod/etc)
interface ConsultationFormData {
    name: string;
    phone: string;
    lineId: string;
    email: string;
    roomType: string;
    branch: string;
    budget: string;
    convenientTime: string;
    message: string;
}

// =========================================================================================
// COMPONENTS (MOVED OUTSIDE MAIN EXPORT FOR CLEANER CODE)
// =========================================================================================

// --- LOGO Text Component (Deep Blue/Dark Gray style) ---
// ใช้ Tailwind utilities ในการกำหนดสีตามสไตล์ YoodeeHomeCare
const YoodeeHomeCareLogoText = ({ size = 'xl', dark = true }: { size?: 'xl' | '2xl', dark?: boolean }) => (
    <div className={`flex items-baseline font-extrabold tracking-tight ${size === 'xl' ? 'text-xl' : 'text-2xl'}`}>
        {/* Deep Blue/blue for 'YooDee' */}
        <span className={`text-[#0E1B4F] ${dark ? 'dark:text-blue-400' : ''}`}>
            YooDee
        </span>
        {/* Dark Gray/White for 'HomeCare' */}
        <span className={`text-gray-900 font-semibold ml-0.5 ${dark ? 'dark:text-gray-200' : ''}`}>
            HomeCare
        </span>
    </div>
);
// --- END LOGO Text Component ---

// --- Brand/Chain Card Component ---
const BrandCard = ({ brandName, brandLogoUrl }: { brandName?: string, brandLogoUrl?: string }) => {
    if (!brandName) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">แบรนด์/เครือบริษัท</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{brandName}</h3>
            </div>
            {brandLogoUrl && (
                <div className="h-12 w-auto max-w-[120px] flex items-center justify-end">
                    <img src={brandLogoUrl} alt={`${brandName} Logo`} className="max-h-full object-contain" />
                </div>
            )}
        </div>
    );
};
// --- END Brand/Chain Card Component ---

// --- Trial Offer Card Component (UNCHANGED) ---
const TrialOfferCard = () => (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 h-10 w-10 bg-yellow-400 rounded-bl-full opacity-30"></div>
        <h3 className="text-xl font-medium text-gray-800 mb-2 flex items-center">
            ไม่ต้องดูแลคนที่คุณรักเพียงลำพัง
            <span className="ml-2 text-2xl">💛</span>
        </h3>
        <p className="text-lg font-bold text-red-600 mb-3 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-red-500 fill-red-500/10 flex-shrink-0" />
            ลองเข้าพัก <span className="underline underline-offset-4 decoration-2 decoration-red-300 mx-1">ฟรี 2 วัน</span> ได้เลย
        </p>

        <ul className="space-y-2 text-sm text-gray-700 mb-4 pl-1">
            <li className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                บรรยากาศเหมือนบ้าน อบอุ่น ปลอดภัย
            </li>
            <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                ทีมมืออาชีพดูแลใกล้ชิด 24 ชม.
            </li>
        </ul>

        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-yellow-200">
            <p className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-red-500" />
                สมัครภายใน <span className="font-medium text-red-600 ml-1">30 วันนี้</span> เท่านั้น!
            </p>
            <a
                href="tel:098-193-8856"
                className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => gtag.event({ action: 'click_trial_call', category: 'Promotion', label: '098-193-8856' })}
            >
                📞 098-193-8856
            </a>
        </div>
    </div>
);
// --- END Trial Offer Card Component ---

// --- Full Screen Gallery Modal Component ---
// --- GalleryModal: Slideshow/Carousel Version ---
interface GalleryModalProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prevIndex =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prevIndex =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                handlePrev();
            } else if (event.key === 'ArrowRight') {
                handleNext();
            } else if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePrev, handleNext, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 p-2 bg-black/50 rounded-full"
                aria-label="Close"
            >
                <X className="w-6 h-6" />
            </button>
            <div className="absolute top-4 left-4 text-white text-lg font-semibold z-50">
                {/* <Image className="w-5 h-5 inline mr-2 text-gray-400" /> */}
                {currentIndex + 1} / {images.length}
            </div>

            <div className="relative w-full h-[90vh] max-w-7xl flex items-center justify-center">

                {/* Previous Button */}
                <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-40 p-3 mx-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-opacity"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Main Image View */}
                <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                    {images.map((url, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-center ${idx === currentIndex ? 'opacity-100 z-30' : 'opacity-0 z-20 pointer-events-none'}`}
                        >
                            <img
                                src={url}
                                alt={`Gallery image ${idx + 1}`}
                                className="max-w-full max-h-full object-contain" // object-contain ทำให้รูปไม่ถูกตัดขอบ
                                loading="eager"
                                onError={(e) => (e.currentTarget.src = "PLACEHOLDER_IMAGE")}
                            />
                        </div>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-40 p-3 mx-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-opacity"
                    aria-label="Next image"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>

            </div>
        </div>
    );
};
// --- END Full Screen Gallery Modal Component ---


// =========================================================================================
// MAIN COMPONENT
// =========================================================================================

export default function CenterDetailPage({ params }: { params: Promise<{ name: string }> }) {
    const [center, setCenter] = useState<CareCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [relatedCenters, setRelatedCenters] = useState<CareCenter[]>([]); // NEW STATE

    // ในส่วนของ State (ตรวจสอบว่ามีตัวนี้อยู่)
    const [initialModalIndex, setInitialModalIndex] = useState(0);
    const openGallery = (index: number, imageClicked: string) => {
        setActiveImage(imageClicked);
        setInitialModalIndex(index);
        setIsGalleryOpen(true);
    };

    // Helper to create slug (duplicated from home page)
    const createSlug = (name: string) => {
        return encodeURIComponent(name.replace(/\s+/g, '-'));
    };

    // Initial Form State
    const initialFormData: ConsultationFormData = {
        name: '', phone: '', lineId: '', email: '', roomType: '',
        branch: '', budget: '', convenientTime: '', message: ''
    };
    const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    // Function to handle form input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Function to handle form submission
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
                alert('ส่งข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด');
                // Reset form data, keeping the branch name
                setFormData({ ...initialFormData, branch: center?.name || '' });
                gtag.event({ action: 'submit_form_success', category: 'Conversion', label: center?.name || 'Unknown' });
            } else {
                setSubmitStatus('error');
                alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
                gtag.event({ action: 'submit_form_error', category: 'Error', label: center?.name || 'Unknown' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
            gtag.event({ action: 'submit_form_exception', category: 'Error', label: center?.name || 'Unknown' });
        } finally {
            setTimeout(() => setSubmitStatus('idle'), 2000);
        }
    };

    // Helper to extract map source URL
    const getMapSrc = (iframeString: string | undefined): string | null => {
        if (!iframeString) return null;
        const match = iframeString.match(/src="([^"]+)"/);
        return match ? match[1] : null;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async (slugName: string) => {
            try {
                const res = await fetch('/api/care-centers');
                const data: CareCenter[] = await res.json();

                if (!isMounted) return;

                const decodedName = decodeSlug(slugName);
                const targetName = decodedName.replace(/\s+/g, '');

                const foundCenter = data.find(c =>
                    c.name.replace(/\s+/g, '') === targetName ||
                    c.name === decodedName
                );

                if (foundCenter) {
                    setCenter(foundCenter);
                    // Set the first image as active, default to placeholder if none exists
                    const initialImage = foundCenter.imageUrls?.[0] || 'https://via.placeholder.com/800x600?text=No+Image';
                    setActiveImage(initialImage);
                    setFormData(prev => ({ ...prev, branch: foundCenter.name }));

                    // Set Related Centers (exclude current, take up to 3)
                    const others = data.filter(c => c.id !== foundCenter.id);
                    setRelatedCenters(others.slice(0, 3));

                    gtag.event({
                        action: 'view_item',
                        category: 'Engagement',
                        label: foundCenter.name,
                        value: foundCenter.price,
                        page_location: window.location.href,
                        center_id: foundCenter.id,
                        center_type: foundCenter.type,
                        slug: slugName
                    });
                } else {
                    gtag.event({
                        action: 'view_item_not_found',
                        category: 'Error',
                        label: slugName
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching center:", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        params.then(resolvedParams => {
            if (isMounted) {
                fetchData(resolvedParams.name);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [params]);

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
                    <p className="text-gray-500 mb-6">ข้อมูลที่คุณค้นหาอาจถูกลบ หรือ URL ไม่ถูกต้อง</p>
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium w-full">
                        <ArrowLeft className="w-5 h-5 mr-2" /> กลับหน้าค้นหา
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare images for display
    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x600?text=No+Image';
    const allImages = center.imageUrls && center.imageUrls.length > 0
        ? center.imageUrls
        : [PLACEHOLDER_IMAGE];
    const galleryImages = allImages.slice(0, 5);
    const mainImage = activeImage || galleryImages[0] || PLACEHOLDER_IMAGE;

    // --- Render Main Content ---

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-left pb-4">
                    <Link href="/" className="inline-flex items-center text-black-600 font-medium text-md hover:text-blue-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับหน้าค้นหาศูนย์ดูแล
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Gallery Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="relative h-[300px] md:h-[400px] bg-gray-100 cursor-pointer group" onClick={() => openGallery(0, mainImage)}>
                                <img src={mainImage} alt={center.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="bg-black/50 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center backdrop-blur-sm">
                                        <Share2 className="w-4 h-4 mr-2" /> ดูรูปภาพทั้งหมด
                                    </span>
                                </div>
                            </div>
                            {/* Thumbnails */}
                            {galleryImages.length > 1 && (
                                <div className="grid grid-cols-5 gap-1 p-1 bg-gray-50">
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} className="relative h-20 cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-blue-500 transition-all" onClick={() => openGallery(idx, img)}>
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Header Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{center.name}</h1>
                                    <p className="text-gray-500 flex items-center mb-3">
                                        <MapPin className="w-4 h-4 mr-1 text-red-500" />
                                        {center.address}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                                            <span className="font-bold text-gray-800">{center.rating.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500 ml-1">(รีวิว)</span>
                                        </div>
                                        {center.hasGovernmentCertificate && (
                                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg border border-green-100 text-green-700 text-xs font-medium">
                                                <ShieldCheck className="w-3 h-3 mr-1" />
                                                ขึ้นทะเบียนแล้ว
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">ราคาเริ่มต้น</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        ฿{center.price.toLocaleString()}
                                        <span className="text-sm text-gray-400 font-normal ml-1">/เดือน</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Brand Card */}
                        <BrandCard brandName={center.brandName} brandLogoUrl={center.brandLogoUrl} />

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-blue-500" />
                                รายละเอียด
                            </h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{center.description}</p>
                        </div>

                        {/* Services */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-pink-500" />
                                บริการของเรา
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {center.services.map((service, idx) => (
                                    <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        {center.mapUrl && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-red-500" />
                                    แผนที่
                                </h2>
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 relative">
                                    <iframe
                                        src={getMapSrc(center.mapUrl) || center.mapUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="absolute inset-0 w-full h-full"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <TrialOfferCard />

                            {/* Contact Form */}
                            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">สนใจสอบถามข้อมูล</h3>
                                <p className="text-sm text-gray-500 mb-6">กรอกข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ</p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            placeholder="ระบุชื่อของคุณ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            placeholder="0xx-xxx-xxxx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Line ID (ถ้ามี)</label>
                                        <input
                                            type="text"
                                            name="lineId"
                                            value={formData.lineId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            placeholder="ระบุ Line ID"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความเพิ่มเติม</label>
                                        <textarea
                                            name="message"
                                            rows={3}
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                                            placeholder="สอบถามรายละเอียดเพิ่มเติม..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'submitting' || submitStatus === 'success'}
                                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${submitStatus === 'success' ? 'bg-green-500 hover:bg-green-600' :
                                                submitStatus === 'error' ? 'bg-red-500 hover:bg-red-600' :
                                                    'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                            }`}
                                    >
                                        {submitStatus === 'submitting' ? 'กำลังส่งข้อมูล...' :
                                            submitStatus === 'success' ? 'ส่งข้อมูลสำเร็จ!' :
                                                submitStatus === 'error' ? 'ลองใหม่อีกครั้ง' :
                                                    'ส่งข้อมูลติดต่อ'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Centers */}
                {relatedCenters.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">ศูนย์ดูแลอื่นๆ ที่น่าสนใจ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedCenters.map((rc) => (
                                <Link key={rc.id} href={`/${createSlug(rc.name)}`} className="group block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
                                    <div className="relative h-48 bg-gray-100">
                                        <img
                                            src={rc.imageUrls?.[0] || PLACEHOLDER_IMAGE}
                                            alt={rc.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-600 shadow-sm">
                                            {rc.type === 'daily' ? 'รายวัน' : rc.type === 'monthly' ? 'รายเดือน' : 'รายวัน/เดือน'}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{rc.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-1 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" /> {rc.address}
                                        </p>

                                        <div className="flex items-center mb-4">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs text-gray-400 ml-2 font-medium">
                                                {rc.rating ? rc.rating.toFixed(1) : '0.0'} (รีวิว)
                                            </span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">ราคาเริ่มต้น</p>
                                                <p className="text-lg font-bold text-blue-600">
                                                    ฿{rc.price?.toLocaleString() ?? '0'}
                                                    <span className="text-xs text-gray-400 font-normal ml-1">/เดือน</span>
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-200 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Gallery Modal */}
            {isGalleryOpen && (
                <GalleryModal
                    images={allImages}
                    initialIndex={initialModalIndex}
                    onClose={() => setIsGalleryOpen(false)}
                />
            )}
        </div>
    );
}