/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';



import { useState, useEffect, useMemo, useRef } from 'react';

import { Search, MapPin, Star, XCircle, ChevronRight, ChevronLeft, ArrowRight, Navigation, Loader2, Phone, MessageCircle, CheckCircle2, ChevronDown, SlidersHorizontal, RotateCcw, HeartPulse, Wallet, X, Train, Hospital, Home, Sparkles } from 'lucide-react';

// Inline SVG data URI สำหรับ fallback image — ป้องกัน onError loop
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f3f4f6' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

// Safe onError handler — set fallback เพียงครั้งเดียว ป้องกัน loop
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (!img.dataset.fallback) {
    img.dataset.fallback = '1';
    img.src = FALLBACK_IMAGE;
  }
};

import Link from 'next/link';
import Image from 'next/image';

// *** สมมติว่า types.ts ถูกกำหนดไว้แล้ว ***

// import { CareCenter, Advertisement, Blog } from '../types';

type CareCenter = any;

type Advertisement = any;

type Blog = any;

import * as gtag from '../lib/gtag';
import { TRANSIT_LINES, TRANSIT_STATIONS, POPULAR_TRANSIT_STATIONS } from '../lib/transitStations';
import { INITIAL_HOSPITALS } from '../lib/hospitalProximity';
type TransitStation = (typeof TRANSIT_STATIONS)[number];
type Hospital = (typeof INITIAL_HOSPITALS)[number];
import { IconSearchCareCenter, IconSearchTransit, IconSearchHospital } from '../components/icons/CustomIcons';

const POPULAR_HOSPITALS = [
  { id: 'HOSP-BKK-001', nameTh: 'รพ.ศิริราช' },
  { id: 'HOSP-BKK-002', nameTh: 'รพ.จุฬาลงกรณ์' },
  { id: 'HOSP-BKK-003', nameTh: 'รพ.รามาธิบดี' },
  { id: 'HOSP-BKK-004', nameTh: 'รพ.ราชวิถี' },
  { id: 'HOSP-BKK-006', nameTh: 'รพ.กรุงเทพ' },
  { id: 'HOSP-BKK-008', nameTh: 'รพ.สมิติเวช สุขุมวิท' },
  { id: 'HOSP-BKK-012', nameTh: 'รพ.เกษมราษฎร์ ประชาชื่น' },
];




// --- Helper: คำนวณระยะทาง (Haversine Formula) ---

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {

  const R = 6371; // รัศมีโลก (km)

  const dLat = deg2rad(lat2 - lat1);

  const dLon = deg2rad(lon2 - lon1);

  const a =

    Math.sin(dLat / 2) * Math.sin(dLat / 2) +

    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *

    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // ระยะทาง (km)

}



function deg2rad(deg: number) {

  return deg * (Math.PI / 180);

}



// รายชื่อจังหวัดทั้งหมดในประเทศไทย

const THAI_PROVINCES = [

  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',

  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร',

  'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',

  'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี',

  'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',

  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง',

  'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต',

  'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด',

  'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน',

  'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',

  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',

  'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง',

  'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'

];



// --- Sub-Component for Blog Card Image with Next/Image and Smooth Fade-in ---
const BlogCardImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoading(true);
  }

  const effectiveSrc = hasError || !src ? FALLBACK_IMAGE : src;
  const isDataUri = typeof effectiveSrc === 'string' && effectiveSrc.startsWith('data:');

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}
      <Image
        key={src}
        src={effectiveSrc}
        alt={alt || 'ภาพประกอบบทความ'}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
        unoptimized={isDataUri}
        className={`object-cover transition-all duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

// --- Sub-Component for Center Card ---

interface CenterCardProps {
  center: CareCenter;
  userLocation?: { lat: number; lng: number } | null;
  locationLabel?: string;
}

const CenterCard: React.FC<CenterCardProps> = ({ center, userLocation, locationLabel }) => {
  const createSlug = (name: string) => encodeURIComponent(name.replace(/\s+/g, '-'));

  const distance = useMemo(() => {
    if (userLocation && center.lat && center.lng) {
      return getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, center.lat, center.lng).toFixed(1);
    }
    return null;
  }, [userLocation, center]);




  return (

    <Link

      href={`/${createSlug(center.name)}`}

      className="block group h-full"

      onClick={() => gtag.event({ action: 'view_item_list', category: 'Discovery', label: center.name, center_id: center.id })}

    >

      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden relative">

        {/* Image Section */}

        <div className="relative h-56 overflow-hidden">

          <img
            src={center.imageUrls?.[0] || FALLBACK_IMAGE}
            alt={center.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={handleImageError}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>


          {/* Starting Price Badge */}
          {center.price && Number(center.price) > 0 ? (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/40">
              <span className="text-gray-500 font-medium text-[11px]">เริ่มต้น</span>
              <span className="text-blue-600 font-bold">
                ฿{Number(center.price).toLocaleString()}
              </span>
            </div>
          ) : null}




          {distance && (

            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 max-w-[85%] border border-blue-100">

              <Navigation className="w-3 h-3 shrink-0" />

              <span className="truncate">
                {locationLabel ? `ห่างจาก ${locationLabel} ${distance} กม.` : `ห่าง ${distance} กม.`}
              </span>

            </div>

          )}

          {/* 

          {center.hasGovernmentCertificate && (

            <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">


              กรม สบส.

            </div>

          )} */}



          <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 ${center.isPartner ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>

            {center.isPartner ? (

              <>
                {/* <Image
                  src="/images/badges/badge-official-partner.png"
                  alt="Official Partner"
                  width={28}
                  height={28}
                  className="w-4 h-4"
                /> */}
                {/* <span className="w-2 h-2 rounded-full bg-gray-400"></span> */}
                ยืนยันตัวตนแล้ว
              </>

            ) : (

              <>ข้อมูลเบื้องต้น</>

            )}



            {/* 🔥🔥🔥 โค้ดที่ซ้ำซ้อนถูกลบออกแล้ว (Start) 🔥🔥🔥 */}

            {/* {recommendedBlogs.length > 0 && !isSearchActive && (

              <section className="mb-12 border-t border-gray-100 pt-8">

                ... (โค้ด Blog ซ้ำซ้อน) ...

              </section>

            )}

            */}

            {/* 🔥🔥🔥 โค้ดที่ซ้ำซ้อนถูกลบออกแล้ว (End) 🔥🔥🔥 */}



          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-grow flex flex-col">

          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{center.name}</h3>

          <p className="text-gray-500 text-sm flex items-center mb-3">

            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" /><span className="line-clamp-1">{center.address}</span>

          </p>

          <div className="flex items-center mb-4">

            <div className="flex text-yellow-400">

              {[...Array(5)].map((_, i) => (

                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(center.rating || 0) ? 'fill-current' : 'text-gray-200'}`} />

              ))}

            </div>

            <span className="text-xs text-gray-400 ml-2 font-medium">{center.rating ? center.rating.toFixed(1) : '0.0'} (รีวิว)</span>

          </div>

        </div>


      </div>

    </Link>

  );
};

// --- Sub-Component: Skeleton Card for Centers Loading State ---
const CenterCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
    {/* Image Skeleton */}
    <div className="relative h-56 w-full bg-gray-200">
      <div className="absolute top-3 left-3 h-5 w-16 bg-gray-300/80 rounded-md" />
      <div className="absolute bottom-3 right-3 h-5 w-20 bg-gray-300/80 rounded-md" />
    </div>

    {/* Content Skeleton */}
    <div className="p-5 flex-grow flex flex-col">
      <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2.5" />
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-3" />

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full bg-gray-200" />
          ))}
        </div>
        <div className="h-3 w-16 bg-gray-200 rounded ml-2" />
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded-md" />
        </div>
        <div className="h-8 w-24 bg-blue-100 rounded-xl" />
      </div>
    </div>
  </div>
);

// --- Helper Component: Scrollable Container ---

const ScrollableContainer = ({ children, itemWidth = 320 }: { children: React.ReactNode, itemWidth?: number }) => {

  const scrollRef = useRef<HTMLDivElement>(null);



  const scroll = (direction: 'left' | 'right') => {

    if (scrollRef.current) {

      const { current } = scrollRef;

      const scrollAmount = itemWidth;

      if (direction === 'left') {

        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });

      } else {

        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      }

    }

  };



  return (

    <div className="relative group/scroll">

      <style jsx>{`

        .no-scrollbar::-webkit-scrollbar { display: none; }

        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      `}</style>



      <button

        onClick={() => scroll('left')}

        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-5 z-20 w-9 h-9 md:w-11 md:h-11 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600 border border-gray-100 transition-transform active:scale-95"

        aria-label="เลื่อนไปทางซ้าย" // แก้ไข: เพิ่ม Accessibility

      >

        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />

      </button>



      <div

        ref={scrollRef}

        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"

      >

        {children}

      </div>



      <button

        onClick={() => scroll('right')}

        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-5 z-20 w-9 h-9 md:w-11 md:h-11 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600 border border-gray-100 transition-transform active:scale-95"

        aria-label="เลื่อนไปทางขวา" // แก้ไข: เพิ่ม Accessibility

      >

        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />

      </button>

    </div>

  );

};



// -------------------------------------------------------------------



export default function HomePageClient({
  initialCenters = [],
  initialPartnerCenters = [],
  totalCentersCount = 0,
  popularProvinces: serverPopularProvinces = [],
  initialAds = [],
  initialBlogs = [],
}: {
  initialCenters?: CareCenter[];
  initialPartnerCenters?: CareCenter[];
  totalCentersCount?: number;
  popularProvinces?: string[];
  initialAds?: Advertisement[];
  initialBlogs?: Blog[];
}) {
  const [centers, setCenters] = useState<CareCenter[]>(initialCenters);
  const [partnerCenters] = useState<CareCenter[]>(initialPartnerCenters);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialCenters.length < totalCentersCount);
  const [totalCount, setTotalCount] = useState<number>(totalCentersCount || initialCenters.length);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const ads = initialAds;
  const blogs = initialBlogs;

  // Search & Filter State
  const [activeTab, setActiveTab] = useState<'general' | 'transit' | 'hospital'>('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [careType, setCareType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [province, setProvince] = useState('all');

  // Transit Filter State
  const [selectedTransitLine, setSelectedTransitLine] = useState<string>('all');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [transitRadius, setTransitRadius] = useState<string>('all');

  // Hospital Filter State
  const [hospitalProvince, setHospitalProvince] = useState<string>('all');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [hospitalRadius, setHospitalRadius] = useState<string>('all');

  // Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [isLocating, setIsLocating] = useState(false);




  useEffect(() => {
    // โหลดข้อมูลเริ่มต้นเรียบร้อยแล้วจาก Server Side Props
    // ไม่จำเป็นต้องทำการ Fetch API บน Client อีกครั้งตอนหน้าเว็บเปิดขึ้นมา

    // ตั้งค่า Log เมื่อรันบนบราวเซอร์ เพื่อส่ง Event การเข้าชมหน้า
    gtag.event({ action: 'view_item_list', category: 'Discovery', label: 'Home Page Loaded' });

    // ส่ง Traffic Log ไปยัง Backend API
    fetch('/api/traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'page_view',
        pagePath: '/',
        utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || '',
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
        referrer: document.referrer || ''
      })
    }).catch(err => console.error('Error logging traffic:', err));
  }, []);



  const handleNearMe = () => {

    if (!navigator.geolocation) {

      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');

      return;

    }



    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setUserLocation({

          lat: position.coords.latitude,

          lng: position.coords.longitude

        });

        setSortByDistance(true); // เปิดโหมดเรียงตามระยะทาง

        setProvince('all');      // ล้างตัวกรองจังหวัดเพื่อให้เห็นศูนย์ที่ใกล้ที่สุดข้ามจังหวัดได้

        setIsLocating(false);

        gtag.event({ action: 'search_near_me', category: 'Engagement' });

        scrollToResults();

      },

      (error) => {

        console.error('Error getting location:', error);

        setIsLocating(false);

        alert('ไม่สามารถระบุตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง หรือลองใหม่อีกครั้ง');

      }

    );

  };



  const handleCareTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    setCareType(e.target.value);

    gtag.event({ action: 'filter_care_type', category: 'Engagement', label: e.target.value });

  };



  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    setPriceRange(e.target.value);

    gtag.event({ action: 'filter_price', category: 'Engagement', label: e.target.value });

  };



  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    setProvince(e.target.value);

    // ถ้าเลือกจังหวัดเอง ให้ปิดโหมดเรียงตามระยะทาง เพื่อไม่ให้สับสน

    if (e.target.value !== 'all') setSortByDistance(false);

    gtag.event({ action: 'filter_province', category: 'Engagement', label: e.target.value });

  };



  // Tab change handler
  const handleTabChange = (tab: 'general' | 'transit' | 'hospital') => {
    setActiveTab(tab);
    setShowSuggestions(false);
    gtag.event({ action: 'switch_search_tab', category: 'Engagement', label: tab });
  };

  // Auto-suggestions State & Ref
  const searchInputRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suggestions for Transit Tab (BTS / MRT)
  const transitSuggestions = useMemo(() => {
    if (activeTab !== 'transit' || !searchTerm.trim()) return [];
    const raw = searchTerm.trim().toLowerCase();
    // Normalize common typos (e.g., อนุเสาวร -> อนุสาวร)
    const q = raw.replace(/อนุเสาวร/g, 'อนุสาวร').replace(/เสาวร/g, 'สาวร');

    return TRANSIT_STATIONS.filter(st => {
      const nameTh = st.nameTh.toLowerCase();
      const nameEn = (st.nameEn || '').toLowerCase();
      const line = (st.line || '').toLowerCase();
      if (nameTh.includes(q) || nameEn.includes(raw) || line.includes(q)) return true;
      if (nameTh.includes('อนุสาวรีย์') && (raw.includes('อนุ') || raw.includes('เสาวร'))) return true;
      return false;
    }).slice(0, 8);
  }, [activeTab, searchTerm]);

  // Suggestions for Hospital Tab
  const hospitalSuggestions = useMemo(() => {
    if (activeTab !== 'hospital' || !searchTerm.trim()) return [];
    const raw = searchTerm.trim().toLowerCase();
    // Normalize common typos
    const q = raw.replace(/อนุเสาวร/g, 'อนุสาวร').replace(/เสาวร/g, 'สาวร');

    return INITIAL_HOSPITALS.filter(h => {
      const nameTh = h.nameTh.toLowerCase();
      const nameEn = (h.nameEn || '').toLowerCase();
      const district = (h.district || '').toLowerCase();
      const province = (h.province || '').toLowerCase();

      if (nameTh.includes(q) || nameEn.includes(raw) || district.includes(q) || province.includes(q)) {
        return true;
      }
      // If user typed "อนุ" or "อนุสาวรีย์" -> show hospitals near Victory Monument
      if (q.includes('อนุ') || q.includes('เสาวร') || raw.includes('อนุ')) {
        if (nameTh.includes('ราชวิถี') || nameTh.includes('พระมงกุฎ') || district.includes('ราชเทวี')) {
          return true;
        }
      }
      return false;
    }).slice(0, 8);
  }, [activeTab, searchTerm]);

  const handleSelectTransitSuggestion = (st: TransitStation) => {
    setSelectedTransitLine(st.lineCode);
    setSelectedStationId(st.id);
    setSearchTerm(st.nameTh);
    setShowSuggestions(false);
    gtag.event({ action: 'select_transit_suggestion', category: 'Search', label: st.nameTh });
    scrollToResults();
  };

  const handleSelectHospitalSuggestion = (hosp: Hospital) => {
    if (hosp.province) setHospitalProvince(hosp.province);
    setSelectedHospitalId(hosp.id);
    setSearchTerm(hosp.nameTh);
    setShowSuggestions(false);
    gtag.event({ action: 'select_hospital_suggestion', category: 'Search', label: hosp.nameTh });
    scrollToResults();
  };

  const handleSelectPopularStation = (stationId: string) => {
    const station = TRANSIT_STATIONS.find(s => s.id === stationId);
    if (station) {
      setSelectedTransitLine(station.lineCode);
      setSelectedStationId(station.id);
      gtag.event({ action: 'quick_select_station', category: 'Engagement', label: station.nameTh });
    }
  };

  const handleSelectPopularHospital = (hospitalId: string) => {
    const hosp = INITIAL_HOSPITALS.find(h => h.id === hospitalId);
    if (hosp) {
      setHospitalProvince(hosp.province || 'all');
      setSelectedHospitalId(hosp.id);
      gtag.event({ action: 'quick_select_hospital', category: 'Engagement', label: hosp.nameTh });
    }
  };

  const selectedStation = useMemo(() => {
    return TRANSIT_STATIONS.find(s => s.id === selectedStationId);
  }, [selectedStationId]);

  const selectedHospital = useMemo(() => {
    return INITIAL_HOSPITALS.find(h => h.id === selectedHospitalId);
  }, [selectedHospitalId]);

  const effectiveLocation = useMemo(() => {
    if (activeTab === 'transit' && selectedStation) {
      return { lat: selectedStation.lat, lng: selectedStation.lng };
    }
    if (activeTab === 'hospital' && selectedHospital) {
      return { lat: selectedHospital.latitude, lng: selectedHospital.longitude };
    }
    if (activeTab === 'general' && sortByDistance && userLocation) {
      return userLocation;
    }
    return null;
  }, [activeTab, selectedStation, selectedHospital, sortByDistance, userLocation]);

  const effectiveLocationLabel = useMemo(() => {
    if (activeTab === 'transit' && selectedStation) {
      return selectedStation.nameTh;
    }
    if (activeTab === 'hospital' && selectedHospital) {
      return selectedHospital.nameTh;
    }
    return undefined;
  }, [activeTab, selectedStation, selectedHospital]);

  const filteredTransitStations = useMemo(() => {
    if (selectedTransitLine === 'all') {
      return TRANSIT_STATIONS;
    }
    return TRANSIT_STATIONS.filter(s => s.lineCode === selectedTransitLine);
  }, [selectedTransitLine]);

  const hospitalProvinces = useMemo(() => {
    const set = new Set<string>();
    INITIAL_HOSPITALS.forEach(h => {
      if (h.province) set.add(h.province);
    });
    return Array.from(set).sort();
  }, []);

  const filteredHospitals = useMemo(() => {
    if (hospitalProvince === 'all') {
      return INITIAL_HOSPITALS;
    }
    return INITIAL_HOSPITALS.filter(h => h.province === hospitalProvince);
  }, [hospitalProvince]);

  // ✅ ฟังก์ชันสำหรับล้างค่าทั้งหมด (Reset All)
  const handleClearFilters = () => {
    setSearchTerm('');
    setProvince('all');
    setCareType('all');
    setPriceRange('all');
    setUserLocation(null);
    setSortByDistance(false);
    setSelectedTransitLine('all');
    setSelectedStationId('');
    setTransitRadius('all');
    setHospitalProvince('all');
    setSelectedHospitalId('');
    setHospitalRadius('all');
    gtag.event({ action: 'clear_all_filters', category: 'Engagement' });
  };

  // ✅ ตัวแปรเช็คว่ากำลังค้นหา/กรองข้อมูลอยู่หรือไม่
  const isSearchActive =
    (activeTab === 'general' && (searchTerm !== '' || careType !== 'all' || priceRange !== 'all' || province !== 'all' || sortByDistance)) ||
    (activeTab === 'transit' && (searchTerm !== '' || selectedTransitLine !== 'all' || selectedStationId !== '' || transitRadius !== 'all')) ||
    (activeTab === 'hospital' && (searchTerm !== '' || hospitalProvince !== 'all' || selectedHospitalId !== '' || hospitalRadius !== 'all'));

  // Progressive API fetch
  const fetchCenters = async (pageToFetch: number, isNewFilter: boolean = false) => {
    if (isNewFilter) {
      setIsFiltering(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', '12');
      params.set('status', 'visible');

      if (searchTerm.trim()) {
        const isSelectedStationName = activeTab === 'transit' && selectedStation && searchTerm.trim() === selectedStation.nameTh;
        const isSelectedHospitalName = activeTab === 'hospital' && selectedHospital && searchTerm.trim() === selectedHospital.nameTh;
        if (!isSelectedStationName && !isSelectedHospitalName) {
          params.set('search', searchTerm.trim());
        }
      }

      if (activeTab === 'general') {
        if (province !== 'all') {
          params.set('province', province);
        }
        if (careType !== 'all') {
          params.set('type', careType);
        }
        if (priceRange !== 'all') {
          params.set('priceRange', priceRange);
        }
        if (sortByDistance && userLocation) {
          params.set('sortByDistance', 'true');
          params.set('lat', userLocation.lat.toString());
          params.set('lng', userLocation.lng.toString());
        }
      } else if (activeTab === 'transit') {
        if (selectedStation) {
          params.set('sortByDistance', 'true');
          params.set('lat', selectedStation.lat.toString());
          params.set('lng', selectedStation.lng.toString());
          if (transitRadius !== 'all') {
            params.set('maxRadius', transitRadius);
          }
        }
        if (careType !== 'all') {
          params.set('type', careType);
        }
      } else if (activeTab === 'hospital') {
        if (selectedHospital) {
          params.set('sortByDistance', 'true');
          params.set('lat', selectedHospital.latitude.toString());
          params.set('lng', selectedHospital.longitude.toString());
          if (hospitalRadius !== 'all') {
            params.set('maxRadius', hospitalRadius);
          }
        } else if (hospitalProvince !== 'all') {
          params.set('province', hospitalProvince);
        }
        if (careType !== 'all') {
          params.set('type', careType);
        }
      }

      const res = await fetch(`/api/care-centers?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const newItems: CareCenter[] = json.data || (Array.isArray(json) ? json : []);
        const newTotal: number = typeof json.total === 'number' ? json.total : newItems.length;
        const newHasMore: boolean = typeof json.hasMore === 'boolean' ? json.hasMore : false;

        if (isNewFilter) {
          setCenters(newItems);
          setPage(1);
        } else {
          setCenters(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const uniqueNew = newItems.filter((c: CareCenter) => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
          setPage(pageToFetch);
        }

        setTotalCount(newTotal);
        setHasMore(newHasMore);
      }
    } catch (err) {
      console.error('Error fetching care centers:', err);
    } finally {
      setIsLoadingMore(false);
      setIsFiltering(false);
    }
  };

  // ดึงข้อมูลเมื่อผู้ใช้เปลี่ยน Filter หรือ Search
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchCenters(1, true);
    }, 350);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    province,
    careType,
    priceRange,
    sortByDistance,
    userLocation,
    activeTab,
    selectedTransitLine,
    selectedStationId,
    transitRadius,
    hospitalProvince,
    selectedHospitalId,
    hospitalRadius,
  ]);


  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    gtag.event({ action: 'load_more_centers', category: 'Engagement', label: `Page ${page + 1}` });
    fetchCenters(page + 1, false);
  };

  const recommendedCenters = useMemo(() => {
    let list = partnerCenters.length > 0 ? partnerCenters : centers.filter(c => c.isPartner);
    if (activeTab === 'general' && province !== 'all') {
      list = list.filter(c => c.province === province);
    }
    if (activeTab === 'hospital' && hospitalProvince !== 'all') {
      list = list.filter(c => c.province === hospitalProvince);
    }
    if (careType !== 'all') {
      list = list.filter(c => c.type === careType || c.type === 'both');
    }
    return list;
  }, [partnerCenters, centers, activeTab, province, hospitalProvince, careType]);

  const recommendedBlogs = useMemo(() => {
    const featured = blogs.filter(b => (b as any).isFeatured);
    if (featured.length > 0) return featured;
    return blogs.slice(0, 5);
  }, [blogs]);

  const popularProvinces = useMemo(() => {
    if (serverPopularProvinces && serverPopularProvinces.length > 0) {
      return serverPopularProvinces;
    }
    const counts: Record<string, number> = {};
    centers.forEach(c => {
      if (c.province) {
        counts[c.province] = (counts[c.province] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([prov]) => prov);
  }, [serverPopularProvinces, centers]);



  const scrollToResults = () => {

    const element = document.getElementById('results-section');

    if (element) {

      element.scrollIntoView({ behavior: 'smooth' });

    }

  };



  return (

    <div className="min-h-screen bg-gray-50/50">

      {/* Hero Section */}

      <div

        className="relative pt-24 pb-20 px-4 bg-cover bg-center min-h-[620px] flex items-center overflow-hidden"

        style={{

          backgroundImage: 'url("/images/hero-care-home-bg.jpg")',

          backgroundPosition: 'center 38%'

        }}

      >

        {/* Sophisticated Dark Gradient & Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/55 to-slate-950/85"></div>
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.14),transparent_65%)] pointer-events-none"></div>

        <div className="relative z-10 container max-w-5xl mx-auto text-center">

          <div className="mb-8 md:mb-10 flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-xl tracking-tight leading-normal">
              ค้นหาสถานที่ดูแล<br className="md:hidden" /><span className="inline-block">ผู้สูงอายุ</span>และ<span className="inline-block">ผู้ป่วยพักฟื้น</span>
            </h1>
            <p className="text-white/90 text-base md:text-xl font-light drop-shadow-lg max-w-2xl mx-auto px-4">
              แหล่งรวมศูนย์ดูแลที่ได้มาตรฐาน ครบครัน และปลอดภัยสำหรับคนที่คุณรัก
            </p>
          </div>

          {/* Tabs Navigation: Clean Unified Segmented Bar (Zero Gap) */}
          <div className="max-w-4xl lg:max-w-5xl mx-auto px-1 sm:px-0 mb-3 sm:mb-3.5">
            <div className="bg-[#142640]/90 backdrop-blur-md border border-white/20 p-1 sm:p-1.5 rounded-2xl grid grid-cols-3 gap-0 shadow-2xl">
              {/* TAB 1: ค้นหาศูนย์ดูแล */}
              <button
                type="button"
                onClick={() => handleTabChange('general')}
                className={`group w-full py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 cursor-pointer ${activeTab === 'general'
                  ? 'bg-white text-[#2B5897] shadow-lg ring-1 ring-black/5'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className={`w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${activeTab === 'general'
                  ? 'bg-[#2B5897]/10 ring-1 ring-[#2B5897]/25 shadow-xs'
                  : 'bg-white/90 ring-1 ring-white/50 shadow-xs group-hover:bg-white group-hover:scale-105'
                  }`}>
                  <IconSearchCareCenter className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" size={36} />
                </span>
                <span className="truncate">
                  <span className="hidden sm:inline">ค้นหา</span>ศูนย์ดูแล
                </span>
              </button>

              {/* TAB 2: BTS / MRT */}
              <button
                type="button"
                onClick={() => handleTabChange('transit')}
                className={`group w-full py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 cursor-pointer ${activeTab === 'transit'
                  ? 'bg-white text-[#2B5897] shadow-lg ring-1 ring-black/5'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className={`w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${activeTab === 'transit'
                  ? 'bg-[#65A85A]/15 ring-1 ring-[#65A85A]/30 shadow-xs'
                  : 'bg-white/90 ring-1 ring-white/50 shadow-xs group-hover:bg-white group-hover:scale-105'
                  }`}>
                  <IconSearchTransit className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" size={36} />
                </span>
                <span className="truncate">BTS / MRT</span>
              </button>

              {/* TAB 3: โรงพยาบาล */}
              <button
                type="button"
                onClick={() => handleTabChange('hospital')}
                className={`group w-full py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 cursor-pointer ${activeTab === 'hospital'
                  ? 'bg-white text-[#2B5897] shadow-lg ring-1 ring-black/5'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className={`w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${activeTab === 'hospital'
                  ? 'bg-[#2B5897]/10 ring-1 ring-[#2B5897]/25 shadow-xs'
                  : 'bg-white/90 ring-1 ring-white/50 shadow-xs group-hover:bg-white group-hover:scale-105'
                  }`}>
                  <IconSearchHospital className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" size={36} />
                </span>
                <span className="truncate">
                  <span className="hidden sm:inline">ใกล้</span>โรงพยาบาล
                </span>
              </button>
            </div>
          </div>


          {/* Search Box Container */}
          <div className="relative max-w-4xl lg:max-w-5xl mx-auto bg-white/95 backdrop-blur-md p-4 md:p-6 pb-6 md:pb-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-white/40 text-left mb-12 sm:mb-14">
            {/* === TAB 1: ค้นหาศูนย์ดูแล (แบบเดิม) === */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-4">
                {/* ROW 1: Search Input */}
                <div className="relative w-full">
                  <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Search className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-11 md:pl-14 pr-24 md:pr-14 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium text-base md:text-lg outline-none shadow-sm"
                    placeholder="ค้นหาชื่อศูนย์, เขต/อำเภอ, หรือจังหวัด..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && scrollToResults()}
                  />

                  {/* ปุ่มใกล้ฉัน (Mobile Only) */}
                  <button
                    onClick={handleNearMe}
                    disabled={isLocating}
                    className={`lg:hidden absolute right-2 top-2 bottom-2 px-3 flex items-center justify-center gap-1 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${sortByDistance
                      ? 'bg-blue-700 ring-2 ring-blue-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-3.5 h-3.5 fill-current" />}
                    <span>ใกล้ฉัน</span>
                  </button>
                </div>

                {/* ROW 2: Filters & Actions */}
                <div className="flex flex-col lg:flex-row gap-2.5 justify-between lg:items-center">
                  <div className="grid grid-cols-2 lg:flex gap-2 w-full lg:flex-1 min-w-0">
                    {/* ปุ่มใกล้ฉัน (Desktop) */}
                    <button
                      onClick={handleNearMe}
                      disabled={isLocating}
                      className={`hidden lg:flex px-4 py-3 rounded-xl items-center gap-2 font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer shrink-0 text-sm ${sortByDistance
                        ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-500/20'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                        }`}
                      title="ค้นหาศูนย์ดูแลที่ใกล้พิกัดของคุณมากที่สุดผ่าน GPS"
                    >
                      {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                          <Navigation className={`relative w-3.5 h-3.5 ${sortByDistance ? 'fill-current' : ''}`} />
                        </span>
                      )}
                      <span>ใกล้ฉัน</span>
                    </button>

                    <select
                      className="col-span-2 lg:col-span-1 lg:flex-1 min-w-0 px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={province}
                      onChange={handleProvinceChange}
                    >
                      <option value="all">📍 ทุกจังหวัด</option>
                      {THAI_PROVINCES.map(prov => (<option key={prov} value={prov}>{prov}</option>))}
                    </select>

                    <select
                      className="col-span-1 lg:flex-1 min-w-0 px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={careType}
                      onChange={handleCareTypeChange}
                    >
                      <option value="all">ทุกประเภท</option>
                      <option value="daily">รายวัน (Day Care)</option>
                      <option value="monthly">รายเดือน (พักค้างคืน)</option>
                    </select>

                    <select
                      className="col-span-1 lg:flex-1 min-w-0 px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={priceRange}
                      onChange={handlePriceChange}
                    >
                      <option value="all">ทุกช่วงราคา</option>
                      <option value="0-20000">ต่ำกว่า 20,000 บาท</option>
                      <option value="20001-25000">20,000 - 25,000 บาท</option>
                      <option value="25001-999999">มากกว่า 25,000 บาท</option>
                    </select>
                  </div>

                  <button
                    onClick={scrollToResults}
                    className="w-full lg:w-auto bg-[#2B5897] hover:bg-[#204373] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm md:text-base lg:ml-1"
                  >
                    <Search className="w-5 h-5 lg:hidden" />
                    ค้นหาข้อมูล
                  </button>
                </div>
              </div>
            )}

            {/* === TAB 2: BTS / MRT === */}
            {activeTab === 'transit' && (
              <div className="flex flex-col gap-4">
                {/* ROW 1: Search Input with Auto-Suggestions */}
                <div ref={searchInputRef} className="relative w-full">
                  <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-[#65A85A] pointer-events-none">
                    <IconSearchTransit size={24} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-11 md:pl-14 pr-10 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#65A85A]/30 focus:border-[#65A85A] focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium text-base md:text-lg outline-none shadow-sm"
                    placeholder="พิมพ์ชื่อสถานี เช่น อนุสาวรีย์, หมอชิต, อารีย์, อโศก..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSuggestions(false);
                      if (e.key === 'Enter') {
                        setShowSuggestions(false);
                        scrollToResults();
                      }
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStationId('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Auto-Suggestions Dropdown: Transit Stations */}
                  {showSuggestions && transitSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold flex items-center gap-1.5 text-[#2B5897]">
                          <IconSearchTransit size={15} /> สถานีรถไฟฟ้าที่แนะนำ ({transitSuggestions.length})
                        </span>
                        <span className="text-gray-400 text-[11px]">คลิกเพื่อเลือก</span>
                      </div>
                      <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {transitSuggestions.map((st) => (
                          <li
                            key={st.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectTransitSuggestion(st);
                            }}
                            className="px-4 py-3 hover:bg-[#65A85A]/10 cursor-pointer flex items-center justify-between gap-3 transition-colors group text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-[#65A85A]/15 text-[#65A85A] flex items-center justify-center shrink-0">
                                <IconSearchTransit size={18} />
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 group-hover:text-[#2B5897] text-sm sm:text-base truncate">
                                  {st.nameTh}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {st.line} {st.nameEn ? `• ${st.nameEn}` : ''}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium group-hover:bg-[#2B5897] group-hover:text-white transition-colors shrink-0">
                              เลือกสถานีนี้
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ROW 2: Filters & Actions */}
                <div className="flex flex-col lg:flex-row gap-2.5 justify-between lg:items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:flex-1 min-w-0">
                    {/* Line Select */}
                    <select
                      className="px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#65A85A]/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={selectedTransitLine}
                      onChange={(e) => {
                        setSelectedTransitLine(e.target.value);
                        setSelectedStationId('');
                      }}
                    >
                      {TRANSIT_LINES.map(line => (
                        <option key={line.code} value={line.code}>🚊 {line.name}</option>
                      ))}
                    </select>

                    {/* Station Select */}
                    <select
                      className="px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#65A85A]/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={selectedStationId}
                      onChange={(e) => setSelectedStationId(e.target.value)}
                    >
                      <option value="">📍 เลือกสถานีรถไฟฟ้า</option>
                      {filteredTransitStations.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.nameTh} ({st.line})
                        </option>
                      ))}
                    </select>

                    {/* Radius Select */}
                    <select
                      className="px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#65A85A]/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={transitRadius}
                      onChange={(e) => setTransitRadius(e.target.value)}
                    >
                      <option value="all">📏 ทุกระยะทาง (ใกล้สุดก่อน)</option>
                      <option value="3">รัศมีไม่เกิน 3 กม.</option>
                      <option value="5">รัศมีไม่เกิน 5 กม.</option>
                      <option value="10">รัศมีไม่เกิน 10 กม.</option>
                    </select>
                  </div>

                  <button
                    onClick={scrollToResults}
                    className="w-full lg:w-auto bg-[#65A85A] hover:bg-[#538e4a] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm md:text-base lg:ml-1"
                  >
                    <IconSearchTransit size={18} />
                    ค้นหาตามแนวรถไฟฟ้า
                  </button>
                </div>
              </div>
            )}

            {/* === TAB 3: โรงพยาบาล === */}
            {activeTab === 'hospital' && (
              <div className="flex flex-col gap-4">
                {/* ROW 1: Search Input with Auto-Suggestions */}
                <div ref={searchInputRef} className="relative w-full">
                  <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-[#2B5897] pointer-events-none">
                    <IconSearchHospital size={24} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-11 md:pl-14 pr-10 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2B5897]/30 focus:border-[#2B5897] focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium text-base md:text-lg outline-none shadow-sm"
                    placeholder="พิมพ์ชื่อโรงพยาบาล เช่น ราชวิถี, ศิริราช, จุฬาฯ, รามา..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSuggestions(false);
                      if (e.key === 'Enter') {
                        setShowSuggestions(false);
                        scrollToResults();
                      }
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedHospitalId('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Auto-Suggestions Dropdown: Hospitals */}
                  {showSuggestions && hospitalSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold flex items-center gap-1.5 text-[#2B5897]">
                          <IconSearchHospital size={15} /> โรงพยาบาลที่แนะนำ ({hospitalSuggestions.length})
                        </span>
                        <span className="text-gray-400 text-[11px]">คลิกเพื่อเลือก</span>
                      </div>
                      <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {hospitalSuggestions.map((hosp) => (
                          <li
                            key={hosp.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectHospitalSuggestion(hosp);
                            }}
                            className="px-4 py-3 hover:bg-[#2B5897]/10 cursor-pointer flex items-center justify-between gap-3 transition-colors group text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-[#2B5897]/15 text-[#2B5897] flex items-center justify-center shrink-0">
                                <IconSearchHospital size={18} />
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 group-hover:text-[#2B5897] text-sm sm:text-base truncate">
                                  {hosp.nameTh}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {hosp.district ? `${hosp.district}, ` : ''}{hosp.province} {hosp.hospitalType ? `• ${hosp.hospitalType}` : ''}
                                  {/* If matches Victory Monument hub */}
                                  {(hosp.nameTh.includes('ราชวิถี') || hosp.nameTh.includes('พระมงกุฎ')) && (
                                    <span className="ml-1.5 text-[#65A85A] font-semibold">• ย่านอนุสาวรีย์ชัยฯ</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium group-hover:bg-[#2B5897] group-hover:text-white transition-colors shrink-0">
                              เลือกรพ.นี้
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ROW 2: Filters & Actions */}
                <div className="flex flex-col lg:flex-row gap-2.5 justify-between lg:items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:flex-1 min-w-0">
                    {/* Province Select */}
                    <select
                      className="px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#2B5897]/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={hospitalProvince}
                      onChange={(e) => {
                        setHospitalProvince(e.target.value);
                        setSelectedHospitalId('');
                      }}
                    >
                      <option value="all">📍 จังหวัดของ รพ. (ทุกจังหวัด)</option>
                      {hospitalProvinces.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>

                    {/* Hospital Select */}
                    <select
                      className="px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#2B5897]/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                    >
                      <option value="">🏥 เลือกโรงพยาบาล</option>
                      {filteredHospitals.map(hosp => (
                        <option key={hosp.id} value={hosp.id}>
                          {hosp.nameTh} ({hosp.district ? `${hosp.district}, ` : ''}{hosp.province})
                        </option>
                      ))}
                    </select>

                    {/* Radius Select */}
                    <select
                      className="px-3 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#2B5897]/30 outline-none font-medium text-sm cursor-pointer truncate"
                      value={hospitalRadius}
                      onChange={(e) => setHospitalRadius(e.target.value)}
                    >
                      <option value="all">📏 ทุกระยะทาง (ใกล้สุดก่อน)</option>
                      <option value="3">รัศมีไม่เกิน 3 กม.</option>
                      <option value="5">รัศมีไม่เกิน 5 กม.</option>
                      <option value="10">รัศมีไม่เกิน 10 กม.</option>
                    </select>
                  </div>

                  <button
                    onClick={scrollToResults}
                    className="w-full lg:w-auto bg-[#2B5897] hover:bg-[#204373] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm md:text-base lg:ml-1"
                  >
                    <IconSearchHospital size={18} />
                    ค้นหาใกล้โรงพยาบาล
                  </button>
                </div>
              </div>
            )}

            {/* === FLOATING POPULAR CHIPS (CSS Absolute Positioned Capsule) === */}
            <div className="absolute top-full mt-3 sm:mt-3.5 left-1/2 -translate-x-1/2 z-20 flex justify-center w-full max-w-4xl px-2 pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl sm:rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-gray-200/90 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs max-w-full">
                <span className="text-gray-500 font-semibold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#65A85A]" />
                  <span className="hidden sm:inline">
                    {activeTab === 'general' ? 'จังหวัดยอดนิยม:' : activeTab === 'transit' ? 'สถานียอดนิยม:' : 'รพ. ยอดนิยม:'}
                  </span>
                  <span className="sm:hidden">ยอดนิยม:</span>
                </span>

                {/* Tab 1: General Popular Provinces (Max 2 rows on mobile) */}
                {activeTab === 'general' && popularProvinces.slice(0, 5).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => { setProvince(prov); setSortByDistance(false); gtag.event({ action: 'quick_select_province', category: 'Engagement', label: prov }); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border shrink-0 cursor-pointer ${province === prov
                      ? 'bg-[#2B5897] text-white border-[#2B5897] shadow-xs'
                      : 'bg-gray-50 hover:bg-[#2B5897]/5 text-gray-700 border-gray-200 hover:border-[#2B5897]/30 hover:text-[#2B5897]'
                      }`}
                  >
                    {prov}
                  </button>
                ))}

                {/* Tab 2: BTS / MRT Popular Stations (Max 2 rows on mobile: 6 stations) */}
                {activeTab === 'transit' && POPULAR_TRANSIT_STATIONS.slice(0, 6).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectPopularStation(st.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border shrink-0 cursor-pointer ${selectedStationId === st.id
                      ? 'bg-[#65A85A] text-white border-[#65A85A] shadow-xs'
                      : 'bg-gray-50 hover:bg-[#65A85A]/10 text-gray-700 border-gray-200 hover:border-[#65A85A]/40 hover:text-[#2B5897]'
                      }`}
                  >
                    {st.nameTh}
                  </button>
                ))}

                {/* Tab 3: Hospital Popular Hospitals (Max 2 rows on mobile: 5 hospitals) */}
                {activeTab === 'hospital' && POPULAR_HOSPITALS.slice(0, 5).map((hosp) => (
                  <button
                    key={hosp.id}
                    type="button"
                    onClick={() => handleSelectPopularHospital(hosp.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border shrink-0 cursor-pointer ${selectedHospitalId === hosp.id
                      ? 'bg-[#2B5897] text-white border-[#2B5897] shadow-xs'
                      : 'bg-gray-50 hover:bg-[#2B5897]/10 text-gray-700 border-gray-200 hover:border-[#2B5897]/40 hover:text-[#2B5897]'
                      }`}
                  >
                    {hosp.nameTh}
                  </button>
                ))}

                {/* Clear Filter Button */}
                {isSearchActive && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-slate-600 hover:text-[#2B5897] font-semibold ml-1 flex items-center gap-1 cursor-pointer shrink-0 hover:underline pl-2 border-l border-gray-200"
                  >
                    <XCircle className="w-3.5 h-3.5" /> ล้างค่า
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 🌟 Trust & Feature Hub Section (ใช้พื้นที่ให้คุ้มค่า มีประโยชน์ และสามารถกดใช้งานได้จริง) */}
      <section className="bg-gradient-to-b from-white to-slate-50/70 py-6 sm:py-8 shadow-xs">
        <div className="container max-w-6xl mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">

            {/* Card 1: 950+ ศูนย์ดูแลทั่วไทย */}
            <div
              // onClick={scrollToResults}
              className="group transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 sm:p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <Image src="/images/badges/badge-carecenter.png" alt="950+ ศูนย์ดูแลทั่วไทย" width={80} height={80} className="w-12 h-12 sm:w-13 sm:h-13 object-contain" priority />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#2b64a0] tracking-tight">950+</span>
                    <span className="text-sm sm:text-base font-bold text-gray-900">ศูนย์ดูแลทั่วไทย</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    ศูนย์พักฟื้น เนอร์สซิ่งโฮม และดูแลผู้สูงอายุ คัดสรรข้อมูลครบถ้วน พร้อมราคาจริง
                  </p>
                </div>
              </div>
              {/* <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center text-xs sm:text-sm font-semibold text-[#2b64a0] group-hover:text-blue-700">
                <span>เลือกดูศูนย์ทั้งหมด</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div> */}
            </div>

            {/* Card 2: ครอบคลุม 77 จังหวัด */}
            <div className="group transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2 sm:p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <Image src="/images/badges/badge-thailand-map.png" alt="ครอบคลุม 77 จังหวัด" width={80} height={80} className="w-12 h-12 sm:w-13 sm:h-13 object-contain" priority />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#2b64a0] tracking-tight">77</span>
                    <span className="text-sm sm:text-base font-bold text-gray-900">จังหวัดทั่วไทย</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    ครอบคลุมทั้งกรุงเทพฯ ปริมณฑล และทุกภูมิภาค ค้นหาได้ใกล้บ้านคนที่คุณรัก
                  </p>
                </div>
              </div>
              {/* <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-gray-400 font-medium">ยอดนิยม:</span>
                {['กรุงเทพมหานคร', 'นนทบุรี', 'เชียงใหม่', 'ชลบุรี'].map((p) => (
                  <button
                    key={p}
                    onClick={() => { setProvince(p); setSortByDistance(false); scrollToResults(); }}
                    className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div> */}
            </div>

            {/* Card 3: คำนวณพิกัด ใกล้บ้านคุณ */}
            <div className="group transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2 sm:p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <Image src="/images/badges/badge-proximity-pin.png" alt="คำนวณพิกัด ใกล้บ้านคุณ" width={80} height={80} className="w-12 h-12 sm:w-13 sm:h-13 object-contain" priority />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-gray-900">คำนวณพิกัด</span>
                    {/* <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">GPS แม่นยำ</span> */}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    ค้นหาศูนย์ดูแลที่ใกล้พิกัดปัจจุบันของคุณมากที่สุด คำนวณระยะทางจริงอัตโนมัติ
                  </p>
                </div>
              </div>
              {/* <div className="mt-3.5 pt-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleNearMe}
                  disabled={isLocating}
                  className="w-full py-2 px-3 bg-[#2b64a0] hover:bg-[#1e4a77] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>{isLocating ? 'กำลังค้นหาพิกัด...' : 'กดค้นหาศูนย์ใกล้ฉันทันที'}</span>
                </button>
              </div> */}
            </div>

          </div>

          {/* Value Props Strip ด้านล่าง เสริมความน่าเชื่อถือ */}
          {/* <div className="mt-5 pt-4 border-t border-gray-200/60 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-2 text-xs sm:text-sm text-gray-600 font-medium">
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ฐานข้อมูลอัปเดตมาตรฐานต่อเนื่อง
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              ตรวจสอบสถานพยาบาลใกล้เคียงได้ในตัว
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              นัดหมายเยี่ยมชมฟรี ไม่มีค่าธรรมเนียม
            </span>
          </div> */}

        </div>
      </section>

      {/* 🌟 Ads Section (ประชาสัมพันธ์) */}

      {ads.length > 0 && (

        <div className="border-b border-gray-100 py-8">

          <div className="container max-w-6xl mx-auto px-4">

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">

              <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-3"></span>ประชาสัมพันธ์

            </h2>

            <ScrollableContainer itemWidth={350}>

              {ads.map((ad) => (

                <a

                  key={ad.id}

                  href={ad.linkUrl || '#'}

                  target="_blank"

                  rel="noreferrer"

                  className="group relative flex-shrink-0 w-[85vw] md:w-[350px] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 snap-center h-full"

                >

                  <div className="aspect-[21/9] overflow-hidden relative">

                    <img
                      src={ad.imageUrl || FALLBACK_IMAGE}
                      alt={ad.title || 'Advertisement'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={handleImageError}
                    />

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>

                  </div>

                  {(ad.title || ad.description) && (

                    <div className="p-4">

                      {ad.title && (

                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1 truncate">

                          {ad.title}

                        </h3>

                      )}

                      {ad.description && (

                        <p className="text-sm text-gray-500 line-clamp-2">

                          {ad.description}

                        </p>

                      )}

                      {/* 🔥🔥🔥 โค้ดที่ซ้ำซ้อนถูกลบออกแล้ว (Start) 🔥🔥🔥 */}

                      {/*

                      {recommendedBlogs.length > 0 && !isSearchActive && (

                        <section className="mb-12 border-t border-gray-100 pt-8">

                          ... (โค้ด Blog ซ้ำซ้อน) ...

                        </section>

                      )}

                      */}

                      {/* 🔥🔥🔥 โค้ดที่ซ้ำซ้อนถูกลบออกแล้ว (End) 🔥🔥🔥 */}

                    </div>

                  )}

                </a>

              ))}

            </ScrollableContainer>

          </div>

        </div>

      )}



      <div id="results-section" className="container max-w-6xl mx-auto p-4 md:p-8 flex-grow">

        {/* 1. ส่วน: ศูนย์ดูแลแนะนำ (ซ่อนเมื่อมีการค้นหา) */}

        {recommendedCenters.length > 0 && !isSearchActive && (

          <section className="mb-12">

            <div className="flex justify-between items-end mb-6">

              <div>

                <h2 className="text-2xl font-bold text-blue-600 flex items-center">

                  <Star className="w-6 h-6 mr-2 text-yellow-400 fill-yellow-400" />

                  ศูนย์ดูแลแนะนำ

                </h2>

                <p className="text-gray-500 text-sm mt-1">

                  ศูนย์ที่ผ่านการยืนยันและได้รับการคัดเลือก <span className="text-blue-600 font-semibold">({recommendedCenters.length} แห่ง)</span>

                </p>

              </div>

            </div>



            <ScrollableContainer itemWidth={336}>

              {recommendedCenters.map(center => (

                <div key={center.id} className="flex-shrink-0 w-80 snap-center h-auto">
                  <CenterCard
                    center={center}
                    userLocation={effectiveLocation}
                    locationLabel={effectiveLocationLabel}
                  />
                </div>


              ))}

              {recommendedCenters.length > 3 && (

                <div className="flex-shrink-0 w-32 flex items-center justify-center snap-center">

                  <button

                    // ✅ แก้ไข: เพิ่ม onClick ให้ไปที่หน้าทั้งหมดหรือค้นหาด้วยเงื่อนไขที่กำหนด

                    onClick={() => { /* ตรรกะสำหรับการดูทั้งหมด */ }}

                    className="flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors whitespace-nowrap"

                  >

                    ดูทั้งหมด <ChevronRight className="w-5 h-5 ml-1" />

                  </button>

                </div>

              )}

              {/* 🔥🔥🔥 โค้ดที่ซ้ำซ้อนถูกลบออกแล้ว (Start) 🔥🔥🔥 */}

              {/*

                  {recommendedBlogs.length > 0 && !isSearchActive && (

                    <section className="mb-12 border-t border-gray-100 pt-8">

                      ... (โค้ด Blog ซ้ำซ้อน) ...

                    </section>

                  )}

                  */}

              {/* 🔥🔥🔥 โค้ดที่ซ้ำซ้อนถูกลบออกแล้ว (End) 🔥🔥🔥 */}

            </ScrollableContainer>

          </section>

        )}





        {/* 4. ส่วน: ผลลัพธ์การค้นหาทั้งหมด */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isSearchActive ? 'ผลลัพธ์จากการค้นหา' : 'ศูนย์ดูแลทั้งหมด'}
              </h2>
              {activeTab === 'transit' && selectedStation && (
                <p className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <Train className="w-4 h-4 shrink-0" />
                  ศูนย์ดูแลใกล้สถานี <span className="underline">{selectedStation.nameTh}</span>
                  {transitRadius !== 'all' ? ` (รัศมีไม่เกิน ${transitRadius} กม.)` : ' (เรียงตามระยะทางใกล้ที่สุด)'}
                </p>
              )}
              {activeTab === 'hospital' && selectedHospital && (
                <p className="text-sm font-semibold text-rose-700 mt-1 flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 shrink-0" />
                  ศูนย์ดูแลใกล้ <span className="underline">{selectedHospital.nameTh}</span>
                  {hospitalRadius !== 'all' ? ` (รัศมีไม่เกิน ${hospitalRadius} กม.)` : ' (เรียงตามระยะทางใกล้ที่สุด)'}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {isSearchActive
                  ? `พบข้อมูลจำนวน ${totalCount} แห่ง ตามเงื่อนไขที่คุณเลือก (แสดงแล้ว ${centers.length} แห่ง)`
                  : `รวบรวมศูนย์ดูแลคุณภาพกว่า ${totalCount} แห่งทั่วประเทศ (แสดงแล้ว ${centers.length} แห่ง)`
                }
              </p>
            </div>
          </div>

          {/* สถานะกำลังค้นหาข้อมูล: แสดง Skeleton Cards สวยงามแทน Spinner ทั่วไป */}
          {isFiltering ? (
            <div>
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-blue-600 font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังค้นหาศูนย์ดูแลตามเงื่อนไขของคุณ...</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CenterCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : centers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centers.map(center => (
                  <CenterCard
                    key={center.id}
                    center={center}
                    userLocation={effectiveLocation}
                    locationLabel={effectiveLocationLabel}
                  />
                ))}

                {/* แสดง Skeleton 3 การ์ดขณะกำลังโหลดศูนย์เพิ่มเติม */}
                {isLoadingMore && (
                  <>
                    <CenterCardSkeleton />
                    <CenterCardSkeleton />
                    <CenterCardSkeleton />
                  </>
                )}
              </div>

              {/* ปุ่มทยอยโหลดเพิ่มเติมจาก API (Load More) */}
              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-full shadow-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        กำลังทยอยโหลดศูนย์ดูแลเพิ่มเติม...
                      </>
                    ) : (
                      <>
                        ดูศูนย์ดูแลเพิ่มเติม (เหลืออีก {Math.max(0, totalCount - centers.length)} แห่ง)
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    กำลังแสดง {centers.length} จากทั้งหมด {totalCount} แห่ง
                  </p>
                </div>
              )}

              {!hasMore && centers.length > 0 && (
                <div className="text-center mt-12 py-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400">
                    แสดงศูนย์ดูแลครบทั้งหมด {centers.length} แห่งแล้ว
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-4 bg-white rounded-3xl shadow-lg border border-blue-50 mt-8 max-w-2xl mx-auto">
              <div className="relative w-36 h-52 mx-auto mb-3">
                <img
                  src="/images/mascot/mascot-welcoming.png"
                  alt="ThaiCareCenter Care Advisor Mascot"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3 border border-blue-100">
                💡 ทีมที่ปรึกษายินดีช่วยเหลือครับ
              </div>
              <h3 className="text-xl font-bold text-gray-800">ไม่พบศูนย์ดูแลตามเงื่อนไขที่เลือก</h3>
              <p className="text-gray-500 text-sm mt-2 mb-6 max-w-md mx-auto leading-relaxed">
                ไม่ต้องกังวลนะครับ! หากยังหาศูนย์ที่ถูกใจไม่เจอ คุณสามารถล้างค่าการค้นหา หรือให้ทีม Care Advisor ช่วยคัดกรองศูนย์ที่เหมาะสมกับอาการและงบประมาณของคุณได้ฟรี
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                >
                  <XCircle className="w-4 h-4 mr-1.5 text-red-500" /> ล้างค่าการค้นหา
                </button>
                <a
                  href="tel:095-805-7052"
                  className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4 mr-2" /> โทรปรึกษาฟรี
                </a>
              </div>
            </div>
          )}

        </section>

        {/* Banner: ปรึกษา Care Advisor ฟรี */}
        <section className="my-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-2xl border border-blue-700/50">
            {/* Background decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 md:p-12">
              <div className="lg:col-span-7 space-y-5">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  บริการฟรี · ไม่มีค่าใช้จ่ายแอบแฝง
                </p>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                  ยังไม่แน่ใจว่าจะเลือกศูนย์ดูแลที่ไหนดี?
                </h2>

                <p className="text-blue-100 text-sm md:text-base leading-relaxed font-light">
                  ให้ทีม <span className="font-semibold text-white">Care Advisor</span> ผู้เชี่ยวชาญของ ThaiCareCenter ช่วยคัดกรองศูนย์ดูแลที่ได้มาตรฐาน ปลอดภัย ตรงตามงบประมาณและทำเลที่คุณสะดวกที่สุด
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>แนะนำศูนย์ตรงงบประมาณ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>ประสานงานนัดหมายเข้าชม</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>ตรวจสอบมาตรฐานและรีวิว</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>พร้อมดูแลและให้คำแนะนำฟรี</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <a
                    href="tel:095-805-7052"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    โทรปรึกษา: 095-805-7052
                  </a>
                  <a
                    href="https://line.me/R/ti/p/%40256zihiv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-[#06C755] hover:bg-[#05b04b] text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    คุยผ่าน LINE ทันที
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src="/images/mascot/home-advisor-banner.jpg"
                    alt="ThaiCareCenter Care Advisor"
                    className="w-full h-full object-cover object-top"
                    onError={handleImageError}
                  />
                  {/* <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl text-center">
                        <p className="text-xs text-white font-medium">ทีมที่ปรึกษา • ThaiCareCenter Care Advisor</p>
                      </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ส่วน: บทความแนะนำ (แสดงแยกออกมาในส่วนนี้) */}
        {recommendedBlogs.length > 0 && !isSearchActive && (

          <section className="mb-12 border-t border-gray-100 pt-8">

            <div className="flex justify-between items-end mb-6">

              <div>

                <h2 className="text-2xl font-bold text-gray-800 flex items-center">

                  <span className="bg-green-500 w-1.5 h-6 rounded-full mr-3"></span>

                  บทความแนะนำ

                </h2>

                <p className="text-gray-500 text-sm mt-1">

                  สาระน่ารู้และเคล็ดลับการดูแลสุขภาพสำหรับผู้สูงอายุ

                </p>

              </div>

              <Link href="/blogs" className="text-blue-600 text-sm font-bold hover:underline flex items-center">

                ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />

              </Link>

            </div>



            <ScrollableContainer itemWidth={320}>

              {recommendedBlogs.map(blog => (

                <Link

                  key={blog.id}

                  href={`/blogs/${(blog as any).slug}`} // ใช้ as any ชั่วคราว

                  className="block group h-full flex-shrink-0 w-80 snap-center"

                >

                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden">

                    <div className="relative h-48 overflow-hidden">

                      <BlogCardImage
                        src={(blog as any).coverImage}
                        alt={(blog as any).title}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none"></div>

                      <div className="absolute bottom-3 left-3 right-3">

                        <span className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">

                          {new Date((blog as any).createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}

                        </span>

                      </div>

                    </div>

                    <div className="p-4 flex-grow flex flex-col">

                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">

                        {(blog as any).title}

                      </h3>

                      <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-grow">

                        {(blog as any).excerpt}

                      </p>

                      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">

                        อ่านเพิ่มเติม <ArrowRight className="w-4 h-4 ml-1" />

                      </div>

                    </div>

                  </div>

                </Link>

              ))}

            </ScrollableContainer>

          </section>

        )}

      </div>

    </div>

  );

}