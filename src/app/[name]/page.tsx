'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    MapPin, Star, Phone, Globe, CheckCircle2, ArrowLeft,
    Share2, Heart, ShieldCheck, Info, DollarSign, Calendar, Mail, Facebook, X, Menu,
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
        {/* Deep Blue/Indigo for 'YooDee' */}
        <span className={`text-[#0E1B4F] ${dark ? 'dark:text-indigo-400' : ''}`}>
            YooDee
        </span>
        {/* Dark Gray/White for 'HomeCare' */}
        <span className={`text-gray-900 font-semibold ml-0.5 ${dark ? 'dark:text-gray-200' : ''}`}>
            HomeCare
        </span>
    </div>
);
// --- END LOGO Text Component ---

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
                <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                บรรยากาศเหมือนบ้าน อบอุ่น ปลอดภัย
            </li>
            <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
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
                className="text-base font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
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
    // ในส่วนของ State (ตรวจสอบว่ามีตัวนี้อยู่)
    const [initialModalIndex, setInitialModalIndex] = useState(0);
    const openGallery = (index: number, imageClicked: string) => {
        setActiveImage(imageClicked);
        setInitialModalIndex(index);
        setIsGalleryOpen(true);
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
            // Wait a moment before resetting status for user feedback
            setTimeout(() => setSubmitStatus('idle'), 2000);
        }
    };

    // Helper to extract map source URL
    const getMapSrc = (iframeString: string | undefined): string | null => {
        if (!iframeString) return null;
        const srcMatch = iframeString.match(/src="([^"]*)"/);
        return srcMatch ? srcMatch[1] : null;
    };


    // Combined useEffect for parameter decoding, data fetching, and state initialization
    useEffect(() => {
        let isMounted = true;

        const fetchData = async (slugName: string) => {
            if (!slugName) return;

            try {
                const res = await fetch('/api/care-centers');
                const data: CareCenter[] = await res.json();

                const targetName = decodeSlug(slugName).replace(/\s+/g, '');
                const foundCenter = data.find(c =>
                    c.name.replace(/\s+/g, '') === targetName ||
                    c.name === decodeSlug(slugName)
                );

                if (isMounted) {
                    if (foundCenter) {
                        setCenter(foundCenter);
                        // Set the first image as active, default to placeholder if none exists
                        const initialImage = foundCenter.imageUrls?.[0] || 'https://via.placeholder.com/800x600?text=No+Image';
                        setActiveImage(initialImage);
                        setFormData(prev => ({ ...prev, branch: foundCenter.name }));

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
                }
            } catch (error) {
                console.error("Error fetching center:", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        params.then(resolvedParams => {
            fetchData(resolvedParams.name);
        });

        return () => {
            isMounted = false;
        };
    }, [params]); // Depend on params only

    // --- Loading & Not Found States ---

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm animate-pulse">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (!center) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <Info className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลศูนย์ดูแล</h1>
                    <p className="text-gray-500 mb-6">ข้อมูลที่คุณค้นหาอาจถูกลบ หรือ URL ไม่ถูกต้อง</p>
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium w-full">
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
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">

            {/* ========================================================================================= */}
            {/* 1. HEADER & NAVBAR */}
            {/* ========================================================================================= */}
            <header className="sticky top-0 z-20">
                <div className="bg-white shadow-sm border-b border-gray-100">
                    <div className="container max-w-6xl mx-auto px-4 py-3 flex justify-between items-center h-20">
                        {/* Logo/Brand (Left) */}
                        <div className="flex items-center gap-2">
                            <img src="/YooDeeHomeCare.png" alt="YoodeeHomeCare Logo" className="h-8 w-auto" />
                            {/* <YoodeeHomeCareLogoText size="xl" /> */}
                        </div>

                        {/* Navigation Links (Center) - Simplified Nav for Detail Page */}
                        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
                            <Link href="/" className="text-gray-900 hover:text-indigo-600 font-semibold">หน้าแรก</Link>
                            <Link href="/about" className="text-gray-900 hover:text-indigo-600">เกี่ยวกับเรา</Link>
                            <Link href="/services" className="text-gray-900 hover:text-indigo-600">บริการของเรา</Link>
                            <Link href="/contact" className="text-gray-900 hover:text-indigo-600">ติดต่อเรา</Link>
                        </nav>

                        {/* Contact/CTA (Right) */}
                        <div className="flex items-center space-x-4">
                            {/* TH/EN Switcher */}
                            <div className="flex items-center space-x-1 text-sm font-bold hidden sm:flex">
                                <span className="text-gray-900">TH</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-400 hover:text-gray-700">EN</span>
                            </div>
                            {/* CTA Button */}
                            <Link
                                href="/consultation"
                                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-300/50"
                                onClick={() => gtag.event({ action: 'click_header_cta', category: 'Conversion', label: 'Contact_Consultation' })}
                            >
                                ติดต่อสอบถาม
                            </Link>
                            {/* Mobile Menu Icon (Placeholder) */}
                            <button className="lg:hidden text-gray-700 cursor-pointer p-2">
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-left pb-4">
                    <Link href="/" className="inline-flex items-center text-black-600 font-medium text-md hover:text-indigo-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับหน้าค้นหาศูนย์ดูแล
                    </Link>
                </div>

                {/* 1. Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-snug">{center.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <p className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {center.address}
                        </p>
                        <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-800 mr-1">{center.rating.toFixed(1)}</span>
                            <span className="text-gray-500">(รีวิว)</span>
                        </div>
                    </div>
                </div>

                {/* 2. Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[280px] md:h-[400px] rounded-2xl overflow-hidden mb-12 relative group shadow-lg">
                    {/* รูปใหญ่ซ้ายมือ */}
                    <div className="md:col-span-2 h-full">
                        <img
                            src={mainImage}
                            alt="Main center image"
                            className="w-full h-full object-cover transition-transform duration-300 cursor-pointer hover:opacity-90"
                            onClick={() => setIsGalleryOpen(true)}
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                        />
                    </div>
                    {/* Grid ขวามือ */}
                    <div className="hidden md:grid grid-cols-2 gap-2 md:col-span-2 h-full">
                        {galleryImages.slice(1).map((url, idx) => (
                            <div key={idx} className="h-full overflow-hidden">
                                <img
                                    src={url}
                                    alt={`Gallery thumbnail ${idx + 2}`}
                                    className="w-full h-full object-cover transition-transform duration-300 cursor-pointer hover:opacity-90"
                                    onClick={() => { setActiveImage(url); setIsGalleryOpen(true); }}
                                    onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsGalleryOpen(true)}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold shadow-md hover:bg-white transition-all border border-gray-200"
                    >
                        ดูรูปทั้งหมด ({allImages.length})
                    </button>
                    {/* Optional: Wishlist/Share Button */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 transition-colors shadow-md">
                            <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-indigo-500 transition-colors shadow-md">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 3. Content Layout: Main (Left) + Sidebar (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">เกี่ยวกับศูนย์ดูแล</h2>
                            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                                {center.description}
                            </p>
                        </section>
                        {/* Facilities */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">สิ่งอำนวยความสะดวกและบริการ</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {center.services?.map((s, i) => (
                                    <div key={i} className="flex items-start p-3 rounded-lg bg-indigo-50 text-indigo-700 transition-colors">
                                        <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{s}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {/* Packages */}
                        {center.packages && center.packages.length > 0 && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">แพ็กเกจราคา</h2>
                                <div className="space-y-4">
                                    {center.packages.map((pkg, idx) => (
                                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-lg text-gray-800 group-hover:text-green-700 transition-colors">{pkg.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {pkg.details || `เหมาะสำหรับผู้ที่ต้องการการดูแลระดับ ${idx + 1}`}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-4">
                                                    <span className="block text-2xl font-extrabold text-green-600">฿{pkg.price.toLocaleString()}</span>
                                                    <span className="text-xs text-gray-400">ต่อเดือน</span>
                                                </div>
                                            </div>
                                            {pkg.details && pkg.details.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {pkg.details.map((d, i) => (
                                                            <li key={i} className="text-sm text-gray-600 flex items-start">
                                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 mt-1 flex-shrink-0"></div> {d}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {/* Map */}
                        {center.mapUrl && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">สถานที่ตั้ง</h2>
                                <div className="rounded-xl overflow-hidden shadow-inner border h-[350px] bg-gray-100 relative">
                                    {getMapSrc(center.mapUrl) ? (
                                        <iframe
                                            src={getMapSrc(center.mapUrl)!}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
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
                        {/* Consultation Form - Separated into its own function for clarity or kept here as is */}
                        <section className="bg-white rounded-2xl shadow-xl border border-teal-200 p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-green-500"></div>
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                                <span className="text-teal-600">นัดปรึกษา ดูสถานที่</span> ทดลองอยู่ **ฟรี**
                            </h2>
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                                        <input
                                            id="name" type="text" name="name" value={formData.name} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800"
                                            placeholder="ระบุชื่อ-นามสกุล" required
                                        />
                                    </div>
                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">หมายเลขโทรศัพท์ <span className="text-red-500">*</span></label>
                                        <input
                                            id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800"
                                            placeholder="ระบุเบอร์โทรศัพท์" required
                                        />
                                    </div>
                                    {/* LINE ID */}
                                    <div>
                                        <label htmlFor="lineId" className="block text-sm font-medium text-gray-700 mb-1">LINE ID (ถ้ามี)</label>
                                        <input
                                            id="lineId" type="text" name="lineId" value={formData.lineId} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800"
                                            placeholder="ระบุ LINE ID"
                                        />
                                    </div>
                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล (ถ้ามี)</label>
                                        <input
                                            id="email" type="email" name="email" value={formData.email} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800"
                                            placeholder="ระบุอีเมล"
                                        />
                                    </div>
                                    {/* Room Type */}
                                    <div>
                                        <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">ประเภทห้องพักที่สนใจ <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                id="roomType" name="roomType" value={formData.roomType} onChange={handleInputChange} required
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none"
                                            >
                                                <option value="" disabled>เลือกประเภทห้อง</option>
                                                <option value="ห้องเดี่ยว">ห้องเดี่ยว</option>
                                                <option value="ห้องพักรวม">ห้องรวม</option>
                                                <option value="V.I.P">V.I.P</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Budget */}
                                    <div>
                                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">อัตราค่าบริการที่สนใจ <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                id="budget" name="budget" value={formData.budget} onChange={handleInputChange} required
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none"
                                            >
                                                <option value="" disabled>เลือกช่วงราคา</option>
                                                <option value="ต่ำกว่า 20,000">ต่ำกว่า 20,000</option>
                                                <option value="20,000 - 30,000">20,000 - 30,000</option>
                                                <option value="มากกว่า 30,000">มากกว่า 30,000</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Convenient Time */}
                                    <div>
                                        <label htmlFor="convenientTime" className="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลาที่สะดวกให้ติดต่อกลับ <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                id="convenientTime" name="convenientTime" value={formData.convenientTime} onChange={handleInputChange} required
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800 appearance-none"
                                            >
                                                <option value="" disabled>เลือกช่วงเวลา</option>
                                                <option value="ช่วงเช้า (9:00 - 12:00)">09:00 - 12:00</option>
                                                <option value="ช่วงบ่าย (13:00 - 17:00)">13:00 - 17:00</option>
                                                <option value="ช่วงเย็น (17:00 - 20:00)">17:00 - 20:00</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Hidden Branch field */}
                                    <input type="hidden" name="branch" value={formData.branch} />
                                </div>
                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">ฝากข้อความถึง (ถ้ามี)</label>
                                    <textarea
                                        id="message" name="message" value={formData.message} onChange={handleInputChange} rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all bg-gray-50 text-gray-800"
                                        placeholder="รายละเอียดเพิ่มเติม เช่น อาการของผู้ป่วย"
                                    ></textarea>
                                </div>
                                {/* Submit Button */}
                                <div className="flex justify-center pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'submitting'}
                                        className={`w-full md:w-auto bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-3 px-12 rounded-full shadow-lg shadow-teal-300/50 transition-all transform hover:scale-[1.01] flex items-center justify-center text-lg ${submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {submitStatus === 'submitting' ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรับคำปรึกษาฟรี'}
                                    </button>
                                </div>
                                {submitStatus === 'success' && (
                                    <p className="text-center text-sm font-medium text-green-600 mt-3 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> ส่งข้อมูลสำเร็จ!
                                    </p>
                                )}
                                {submitStatus === 'error' && (
                                    <p className="text-center text-sm font-medium text-red-600 mt-3 flex items-center justify-center">
                                        <Info className="w-4 h-4 mr-1.5" /> เกิดข้อผิดพลาด! กรุณาลองใหม่อีกครั้ง
                                    </p>
                                )}
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Sticky Sidebar (Booking Card) */}
                    <div className="lg:col-span-1">
                        {/* Option: Include Trial Offer Card here */}
                        {/* <TrialOfferCard /> */}

                        {/* Existing Price/Contact Card (Sticky) */}
                        <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-10">

                            <div className="mb-6 pb-4 border-b border-gray-100">
                                <span className="text-gray-500 text-sm font-medium block mb-1">ราคาเริ่มต้น</span>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-extrabold text-indigo-600">฿{center.price.toLocaleString()}</span>
                                    <span className="text-gray-500 ml-1 text-base font-semibold">
                                        /{center.type === 'daily' ? 'วัน' : 'เดือน'}
                                    </span>
                                </div>
                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    <DollarSign className='w-3 h-3 mr-1' /> คุ้มค่าและแนะนำ
                                </div>
                            </div>

                            <div className="space-y-4">
                                <a
                                    href={`tel:${center.phone}`}
                                    onClick={() => gtag.event({ action: 'click_call_sticky', category: 'Conversion', label: center.name })}
                                    className="w-full flex items-center justify-center px-4 py-3.5 bg-indigo-500 text-white text-base font-extrabold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-300/50 active:scale-[0.99] transform"
                                >
                                    <Phone className="w-5 h-5 mr-2" /> โทรปรึกษาทันที : {center.phone}
                                </a>

                                {center.website && (
                                    <a
                                        href={center.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => gtag.event({ action: 'click_website_sticky', category: 'Conversion', label: center.name })}
                                        className="w-full flex items-center justify-center px-4 py-3.5 bg-white text-indigo-600 border-2 border-indigo-200 text-base font-extrabold rounded-xl hover:border-indigo-500 hover:text-indigo-700 transition-all active:scale-[0.99] transform"
                                    >
                                        <Globe className="w-5 h-5 mr-2" /> เข้าชมเว็บไซต์
                                    </a>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400">
                                    ติดต่อผ่าน YoodeeHomeCare ไม่มีค่าใช้จ่ายเพิ่มเติม
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 4. FOOTER (Minor cleanup for Logo component usage and icon import) */}
            <footer className="bg-gray-900 text-white mt-12">
                <div className="container max-w-6xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

                        {/* 1. Logo/Address Column */}
                        <div className="col-span-2 lg:col-span-1 space-y-4">
                            <YoodeeHomeCareLogoText size="2xl" dark={false} />
                            <p className="text-sm text-gray-400">
                                แพลตฟอร์มค้นหาและเปรียบเทียบศูนย์ดูแลผู้สูงอายุ และผู้ป่วยพักฟื้น ที่ครบถ้วนและน่าเชื่อถือที่สุด
                            </p>
                            <div className="flex space-x-3 pt-2">
                                <a href="#" aria-label="Facebook" className="p-2 bg-gray-700 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors">
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a href="#" aria-label="Line" className="p-2 bg-gray-700 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-code h-4 w-4"><path d="M7.9 20A9 9 0 0 1 12 12V8" /><path d="M12 2a10 10 0 0 0-9.25 13c-.1 1 .5 2 1.25 2.75L2 22l3.5-1.5c.75.75 1.75 1.25 2.75 1.25A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z" /><path d="m10 10-2 2 2 2" /><path d="m14 10 2 2-2 2" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* 2. เกี่ยวกับเรา (Quick Links) */}
                        <div className="space-y-3">
                            <h4 className="text-base font-bold text-white mb-3">เกี่ยวกับเรา</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/concept" className="hover:text-indigo-400 transition-colors">แนวคิดโครงการ</Link></li>
                                <li><Link href="/whyus" className="hover:text-indigo-400 transition-colors">ทำไมเราเลือกเรา</Link></li>
                                <li><Link href="/testimonials" className="hover:text-indigo-400 transition-colors">คำรับรองจากลูกค้า</Link></li>
                                <li><Link href="/articles" className="hover:text-indigo-400 transition-colors">สาระน่ารู้</Link></li>
                            </ul>
                        </div>

                        {/* 3. บริการของเรา (Services) */}
                        <div className="space-y-3">
                            <h4 className="text-base font-bold text-white mb-3">บริการของเรา</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/service/monthly" className="hover:text-indigo-400 transition-colors">ศูนย์ดูแลรายเดือน</Link></li>
                                <li><Link href="/service/daily" className="hover:text-indigo-400 transition-colors">ศูนย์ดูแลรายวัน</Link></li>
                                <li><Link href="/service/rehab" className="hover:text-indigo-400 transition-colors">ดูแลฟื้นฟู/กลับบ้าน</Link></li>
                                <li><Link href="/service/aquatic" className="hover:text-indigo-400 transition-colors">คลินิกกายภาพบำบัด</Link></li>
                                <li><Link href="/service/tms" className="hover:text-indigo-400 transition-colors">คลินิก TMS</Link></li>
                            </ul>
                        </div>

                        {/* 4. โปรแกรมของเรา (Programs) */}
                        <div className="space-y-3">
                            <h4 className="text-base font-bold text-white mb-3">โปรแกรมของเรา</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/program/elderly" className="hover:text-indigo-400 transition-colors">ดูแลผู้สูงอายุ</Link></li>
                                <li><Link href="/program/stroke" className="hover:text-indigo-400 transition-colors">ดูแลผู้ป่วยระยะพักฟื้น</Link></li>
                                <li><Link href="/program/bedridden" className="hover:text-indigo-400 transition-colors">ดูแลผู้ป่วยติดเตียง</Link></li>
                                <li><Link href="/program/alzheimer" className="hover:text-indigo-400 transition-colors">ดูแลผู้ป่วยอัลไซเมอร์</Link></li>
                                <li><Link href="/program/parkinson" className="hover:text-indigo-400 transition-colors">ดูแลผู้ป่วยพาร์กินสัน</Link></li>
                                <li><Link href="/program/cancer" className="hover:text-indigo-400 transition-colors">ดูแลผู้ป่วยมะเร็ง/เคมีบำบัด</Link></li>
                                <li><Link href="/program/palliative" className="hover:text-indigo-400 transition-colors">ดูแลผู้ป่วยระยะสุดท้าย</Link></li>
                            </ul>
                        </div>

                        {/* 5. โครงการอื่นๆ (Projects) */}
                        <div className="space-y-3">
                            <h4 className="text-base font-bold text-white mb-3">โครงการอื่นๆ</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/project/wellness" className="hover:text-indigo-400 transition-colors">โครงการ Wellness Center</Link></li>
                                <li><Link href="/project/homecare" className="hover:text-indigo-400 transition-colors">โครงการ Home Care</Link></li>
                                <li><Link href="/project/academy" className="hover:text-indigo-400 transition-colors">โครงการ Healthcare Academy</Link></li>
                                <li><Link href="/project/foundation" className="hover:text-indigo-400 transition-colors">โครงการ Foundation</Link></li>
                                <li><Link href="/investment" className="hover:text-indigo-400 transition-colors">การลงทุน</Link></li>
                            </ul>
                        </div>

                    </div>

                    {/* Copyright & Disclaimer */}
                    <div className="mt-10 pt-4 border-t border-gray-800 text-sm text-gray-400 flex justify-between items-end flex-wrap">
                        <p>
                            ©{new Date().getFullYear()} YoodeeHomeCare. All rights reserved. |
                            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-500 ml-1">นโยบายความเป็นส่วนตัว</Link>
                        </p>
                        <a href="tel:098-193-8856" className="bg-green-600 rounded-full p-3 shadow-lg hover:bg-green-700 transition-colors mt-4 md:mt-0 cursor-pointer"
                            onClick={() => gtag.event({ action: 'click_footer_cta', category: 'Conversion', label: '098-193-8856' })}>
                            <span className="text-white text-xs font-semibold">ปรึกษาเรื่องที่พักกับเจ้าหน้าที่</span>
                        </a>
                    </div>
                </div>

                {/* Bottom Cookie/Privacy Bar */}
                {/* <div className="bg-gray-800 text-xs text-gray-300 py-3">
                    <div className="container max-w-6xl mx-auto px-4 flex justify-between items-center flex-wrap gap-2">
                        <p className="flex-grow">
                            เว็บไซต์นี้มีการใช้คุกกี้เพื่อประสบการณ์ใช้งานเว็บไซต์ที่ดีขึ้น รายละเอียดและข้อมูลคุกกี้เพิ่มเติม
                            <Link href="/cookie-policy" className="underline hover:text-white ml-1">นโยบายคุกกี้</Link>
                        </p>
                        <div className="flex space-x-3 flex-shrink-0">
                            <button className="text-white hover:text-indigo-400 transition-colors">ฉันเข้าใจ</button>
                            <button className="px-3 py-1 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">ยอมรับทั้งหมด</button>
                        </div>
                    </div>
                </div> */}
            </footer>

            {/* Gallery Modal */}
            {/* // การเรียกใช้ในไฟล์หลัก (เวอร์ชันล่าสุดที่ถูกแก้ไขให้เป็น Slideshow/Grid mode) */}
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