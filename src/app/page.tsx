/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';



import { useState, useEffect, useMemo, useRef } from 'react';

import { Search, MapPin, Star, XCircle, ChevronRight, ChevronLeft, ArrowRight, Navigation, Loader2 } from 'lucide-react';

import Link from 'next/link';

// *** สมมติว่า types.ts ถูกกำหนดไว้แล้ว ***

// import { CareCenter, Advertisement, Blog } from '../types';

type CareCenter = any;

type Advertisement = any;

type Blog = any;

import * as gtag from '../lib/gtag';



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



// --- Sub-Component for Center Card ---

interface CenterCardProps {

  center: CareCenter;

  userLocation?: { lat: number; lng: number } | null;

}



const CenterCard: React.FC<CenterCardProps> = ({ center, userLocation }) => {

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

            src={center.imageUrls?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}

            alt={center.name}

            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"

            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}

          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>



          <div className="absolute top-3 left-3 flex gap-2">

            {center.type === 'daily' && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">รายวัน</span>}

            {center.type === 'monthly' && <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">รายเดือน</span>}

            {center.type === 'both' && <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">รายวัน/เดือน</span>}

          </div>



          {distance && (

            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-blue-700 text-[11px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">

              <Navigation className="w-3 h-3" />

              ห่าง {distance} กม.

            </div>

          )}



          {center.hasGovernmentCertificate && (

            <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>

              กรม สบส.

            </div>

          )}



          <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 ${center.isPartner ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>

            {center.isPartner ? (

              <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 11.82a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>ผ่านการยืนยัน</>

            ) : (

              <><span className="w-2 h-2 rounded-full bg-gray-400"></span>ข้อมูลเบื้องต้น</>

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



          {/* Footer Section */}

          <div className="mt-auto pt-1 border-t border-gray-50 flex items-center justify-between">

            <div>

              <p className="text-xs text-gray-400 mb-0.5">ราคาเริ่มต้น</p>

              <p className="text-lg font-bold text-blue-600">

                ฿{center.price?.toLocaleString() ?? '0'}<span className="text-xs text-gray-400 font-normal ml-1">/เดือน</span>

              </p>

            </div>

          </div>

        </div>

      </div>

    </Link>

  );

};



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



export default function HomePage() {

  const [centers, setCenters] = useState<CareCenter[]>([]);

  const [ads, setAds] = useState<Advertisement[]>([]);

  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [loading, setLoading] = useState(true);



  // Search & Filter State

  const [searchTerm, setSearchTerm] = useState('');

  const [careType, setCareType] = useState('all');

  const [priceRange, setPriceRange] = useState('all');

  const [province, setProvince] = useState('all');

  const [showAll, setShowAll] = useState(false);



  // Location State

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [sortByDistance, setSortByDistance] = useState(false);

  const [isLocating, setIsLocating] = useState(false);



  useEffect(() => {

    const controller = new AbortController(); // แก้ไข: เพิ่ม AbortController

    const signal = controller.signal;



    const startTime = performance.now();

    fetch('/api/care-centers?status=visible', { signal })

      .then(res => res.json())

      .then(data => {

        setCenters(data);

        setLoading(false);

        const loadTime = Math.round(performance.now() - startTime);

        gtag.event({ action: 'data_loaded', category: 'Performance', value: loadTime, label: `Loaded ${data.length} centers` });

      })

      .catch(err => {

        if (err.name === 'AbortError') return; // จัดการ AbortError

        console.error("Fetch error:", err);

        gtag.event({ action: 'api_error', category: 'Error', label: err.message });

      });



    fetch('/api/ads', { signal })

      .then(res => res.json())

      .then(data => setAds(data))

      .catch(err => { if (err.name !== 'AbortError') console.error("Fetch ads error:", err); });



    fetch('/api/blogs?published=true', { signal })

      .then(res => res.json())

      .then(data => setBlogs(data))

      .catch(err => { if (err.name !== 'AbortError') console.error("Fetch blogs error:", err); });



    // Cleanup function

    return () => {

      controller.abort();

    };

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



  // ✅ ฟังก์ชันสำหรับล้างค่าทั้งหมด (Reset All)

  const handleClearFilters = () => {

    setSearchTerm('');

    setProvince('all');

    setCareType('all');

    setPriceRange('all');

    setUserLocation(null);

    setSortByDistance(false);

    gtag.event({ action: 'clear_all_filters', category: 'Engagement' });

  };



  // ✅ ตัวแปรเช็คว่ากำลังค้นหา/กรองข้อมูลอยู่หรือไม่

  const isSearchActive = searchTerm !== '' || careType !== 'all' || priceRange !== 'all' || province !== 'all' || sortByDistance;



  const filteredCenters = useMemo(() => {

    let result = [...centers];



    // 1. กรองตามเงื่อนไขปกติ

    if (searchTerm) {

      const lower = searchTerm.toLowerCase();

      result = result.filter(c => c.name.toLowerCase().includes(lower) || c.address.toLowerCase().includes(lower));

    }

    if (careType !== 'all') {

      result = result.filter(c => c.type === careType || c.type === 'both');

    }

    if (priceRange !== 'all') {

      const [min, max] = priceRange.split('-').map(Number);

      // ✅ แก้ไข: ตรวจสอบ c.price ก่อนใช้

      result = result.filter(c => c.price !== undefined && c.price >= min && c.price <= max);

    }

    if (province !== 'all') {

      result = result.filter(c => c.province === province);

    }



    // 2. เรียงลำดับตามระยะทาง (ถ้ามี Location)

    if (sortByDistance && userLocation) {

      result.sort((a, b) => {

        // ✅ แก้ไข: จัดการศูนย์ที่ไม่มีพิกัด (ควรไปอยู่ท้ายสุด)

        if (!a.lat || !a.lng) return 1;

        if (!b.lat || !b.lng) return -1;



        const distA = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, a.lat, a.lng);

        const distB = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng);



        return distA - distB;

      });

    }



    return result;

  }, [searchTerm, careType, priceRange, province, centers, sortByDistance, userLocation]);



  const recommendedCenters = useMemo(() => {

    // ใช้ partner filter

    return filteredCenters.filter(c => c.isPartner);

  }, [filteredCenters]);



  const recommendedBlogs = useMemo(() => {

    const featured = blogs.filter(b => (b as any).isFeatured); // ใช้ as any ชั่วคราวหากยังไม่ได้กำหนด isFeatured ใน Blog type

    if (featured.length > 0) return featured;

    return blogs.slice(0, 5);

  }, [blogs]);



  const displayedCenters = useMemo(() => {

    if (showAll) {

      return filteredCenters;

    }

    return filteredCenters.slice(0, 9);

  }, [filteredCenters, showAll]);



  const popularProvinces = useMemo(() => {

    if (centers.length === 0) return [];

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

  }, [centers]);



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

        className="relative pt-24 pb-20 px-4 bg-cover bg-center min-h-[600px] flex items-center"

        style={{

          backgroundImage: 'url("/images/bg-home.jpg")',

          backgroundPosition: 'center 30%'

        }}

      >

        <div className="absolute inset-0 bg-black/50"></div>



        <div className="relative z-10 container max-w-5xl mx-auto text-center">



          <div className="mb-8 md:mb-10 flex flex-col items-center justify-center">

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-xl tracking-tight leading-tight">

              ค้นหาสถานที่ดูแล<br className="md:hidden" />ผู้สูงอายุและผู้ป่วยพักฟื้น

            </h1>

            <p className="text-white/90 text-base md:text-xl font-light drop-shadow-lg max-w-2xl mx-auto px-4">

              แหล่งรวมศูนย์ดูแลที่ได้มาตรฐาน ครบครัน และปลอดภัยสำหรับคนที่คุณรัก

            </p>

          </div>



          {/* Search Box Container */}

          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-white/40">



            {/* Layout Wrapper: ใช้ flex-col เพื่อให้ Input อยู่บรรทัดบนเสมอ */}

            <div className="flex flex-col gap-4">



              {/* === ROW 1: Search Input (Full Width) === */}

              <div className="relative w-full">

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">

                  <Search className="h-6 w-6" />

                </div>

                <input

                  type="text"

                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium text-lg outline-none shadow-sm"

                  placeholder="ค้นหาชื่อศูนย์, จังหวัด, หรือบริการ..."

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                  onKeyDown={(e) => e.key === 'Enter' && scrollToResults()}

                />



                {/* ปุ่มใกล้ฉัน (Mobile Only) */}

                <button

                  onClick={handleNearMe}

                  disabled={isLocating}

                  className="lg:hidden absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"

                >

                  {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}

                </button>

              </div>



              {/* === ROW 2: Filters & Actions === */}

              <div className="flex flex-col lg:flex-row gap-3 justify-between lg:items-center">



                {/* Filters Group */}

                <div className="grid grid-cols-2 lg:flex gap-2 w-full lg:w-auto">



                  {/* ปุ่มใกล้ฉัน (Desktop Only - ย้ายมาอยู่แถวล่าง) */}

                  <button

                    onClick={handleNearMe}

                    disabled={isLocating}

                    className="hidden lg:flex px-5 py-3 border rounded-xl items-center gap-2 font-medium transition-all whitespace-nowrap bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"

                  >

                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className={`w-4 h-4 ${sortByDistance ? 'fill-current text-blue-600' : ''}`} />}

                    ใกล้ฉัน

                  </button>



                  {/* Select Filters */}

                  <select

                    className="col-span-2 lg:col-span-1 px-4 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-sm lg:text-base lg:min-w-[160px] cursor-pointer"

                    value={province}

                    onChange={handleProvinceChange}

                  >

                    <option value="all">📍 ทุกจังหวัด</option>

                    {THAI_PROVINCES.map(prov => (<option key={prov} value={prov}>{prov}</option>))}

                  </select>



                  <select

                    className="px-4 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-sm lg:text-base cursor-pointer"

                    value={careType}

                    onChange={handleCareTypeChange}

                  >

                    <option value="all">ทุกประเภท</option>

                    <option value="daily">รายวัน</option>

                    <option value="monthly">รายเดือน</option>

                  </select>



                  <select

                    className="px-4 py-3 bg-white lg:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-sm lg:text-base cursor-pointer"

                    value={priceRange}

                    onChange={handlePriceChange}

                  >

                    <option value="all">ทุกราคา</option>

                    <option value="0-20000">&lt; 20k</option>

                    <option value="20001-25000">20k-25k</option>

                    <option value="25001-999999">&gt; 25k</option>

                  </select>

                </div>



                {/* Search Button */}

                <button

                  onClick={scrollToResults}

                  className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 lg:ml-auto"

                >

                  <Search className="w-5 h-5 lg:hidden" />

                  ค้นหาข้อมูล

                </button>

              </div>

            </div>



            {/* Popular Tags */}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 px-1">

              <span className="text-gray-500 text-sm font-medium mr-1 hidden md:inline">จังหวัดยอดนิยม:</span>

              {popularProvinces.length > 0 ? popularProvinces.map((prov) => (

                <button

                  key={prov}

                  onClick={() => { setProvince(prov); setSortByDistance(false); gtag.event({ action: 'quick_select_province', category: 'Engagement', label: prov }); }}

                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all border ${province === prov ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}

                >

                  {prov}

                </button>

              )) : (<span className="text-gray-400 text-sm italic">กำลังโหลด...</span>)}



              {/* ปุ่มล้างค่า แสดงเมื่อมีการค้นหา */}

              {isSearchActive && (

                <button

                  onClick={handleClearFilters}

                  className="text-red-500 text-xs md:text-sm font-medium hover:underline ml-2 flex items-center gap-1"

                >

                  <XCircle className="w-4 h-4" /> ล้างค่าทั้งหมด

                </button>

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



          </div>

        </div>

      </div>



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

                      src={ad.imageUrl}

                      alt={ad.title || 'Advertisement'}

                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"

                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x300?text=No+Image')}

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

        {loading ? (

          <div className="flex flex-col items-center justify-center py-16">

            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>

          </div>

        ) : (

          <>

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

                      <CenterCard center={center} userLocation={userLocation} />

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

                  <p className="text-gray-500 text-sm mt-1">

                    {isSearchActive

                      ? `พบข้อมูลจำนวน ${filteredCenters.length} แห่ง ตามเงื่อนไขที่คุณเลือก`

                      : `รวบรวมศูนย์ดูแลคุณภาพกว่า ${centers.length} แห่งทั่วประเทศ`

                    }

                  </p>

                </div>

              </div>



              {/* Grid View */}

              {filteredCenters.length > 0 ? (

                <>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {displayedCenters.map(center => (

                      <CenterCard key={center.id} center={center} userLocation={userLocation} />

                    ))}

                  </div>



                  {filteredCenters.length > 9 && !showAll && (

                    <div className="text-center mt-8">

                      <button

                        onClick={() => {

                          setShowAll(true);

                          gtag.event({ action: 'load_more_centers', category: 'Engagement' });

                        }}

                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"

                      >

                        ดูศูนย์ดูแลเพิ่มเติมอีก {filteredCenters.length - 9} แห่ง <ArrowRight className="w-5 h-5 ml-2" />

                      </button>

                    </div>

                  )}



                  {showAll && (

                    <div className="text-center mt-8">

                      <button

                        onClick={() => {

                          setShowAll(false);

                          scrollToResults();

                        }}

                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"

                      >

                        ย่อการแสดงผล

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

                </>

              ) : (

                <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100 mt-8">

                  <div className="text-gray-300 mb-4"><Search className="h-16 w-16 mx-auto opacity-50" /></div>

                  <h3 className="text-xl font-semibold text-gray-700">ไม่พบข้อมูลศูนย์ดูแล</h3>

                  <p className="text-gray-500 mt-2">ไม่มีผลลัพธ์สำหรับเงื่อนไขนี้ <br />ลองปรับเปลี่ยนเงื่อนไขการค้นหา หรือปิดโหมดใกล้ฉัน</p>

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

                          <img

                            src={(blog as any).coverImage || 'https://via.placeholder.com/600x400?text=No+Image'}

                            alt={(blog as any).title}

                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"

                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}

                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

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

          </>

        )}

      </div>

    </div>

  );

}