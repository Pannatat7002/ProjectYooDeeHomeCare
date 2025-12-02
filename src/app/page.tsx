'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Star, XCircle, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CareCenter, Advertisement } from '../types';
import * as gtag from '../lib/gtag';

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
}

const CenterCard: React.FC<CenterCardProps> = ({ center }) => {
  const createSlug = (name: string) => encodeURIComponent(name.replace(/\s+/g, '-'));

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
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
              </button>
              <button className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- Helper Component: Scrollable Container with Arrows & Hidden Scrollbar ---
const ScrollableContainer = ({ children, itemWidth = 320 }: { children: React.ReactNode, itemWidth?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = itemWidth; // เลื่อนทีละ 1 การ์ด
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative group/scroll">
      {/* Inline Style to force Hide Scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Left Button - Always visible, responsive sizing */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-5 z-20 w-9 h-9 md:w-11 md:h-11 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600 border border-gray-100 transition-transform active:scale-95"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
      >
        {children}
      </div>

      {/* Right Button - Always visible, responsive sizing */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-5 z-20 w-9 h-9 md:w-11 md:h-11 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600 border border-gray-100 transition-transform active:scale-95"
        aria-label="Scroll Right"
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [careType, setCareType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [province, setProvince] = useState('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    fetch('/api/care-centers?status=visible')
      .then(res => res.json())
      .then(data => {
        setCenters(data);
        setLoading(false);
        const loadTime = Math.round(performance.now() - startTime);
        gtag.event({ action: 'data_loaded', category: 'Performance', value: loadTime, label: `Loaded ${data.length} centers` });
      })
      .catch(err => {
        console.error("Fetch error:", err);
        gtag.event({ action: 'api_error', category: 'Error', label: err.message });
      });
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(err => console.error("Fetch ads error:", err));
  }, []);

  const filteredCenters = useMemo(() => {
    let result = centers;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(lower) || c.address.toLowerCase().includes(lower));
    }
    if (careType !== 'all') {
      result = result.filter(c => c.type === careType || c.type === 'both');
    }
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(c => c.price >= min && c.price <= max);
    }
    if (province !== 'all') {
      result = result.filter(c => c.province === province);
    }
    return result;
  }, [searchTerm, careType, priceRange, province, centers]);

  const recommendedCenters = useMemo(() => {
    return filteredCenters.filter(c => c.isPartner);
  }, [filteredCenters]);

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
    gtag.event({ action: 'filter_province', category: 'Engagement', label: e.target.value });
  };

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
        className="relative pt-16 pb-20 px-4 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/bg-home.jpg")',
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 container max-w-5xl mx-auto text-center">
          <div className="mb-10 flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
              ค้นหาสถานที่ดูแลผู้สูงอายุและผู้ป่วยพักฟื้น
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light drop-shadow-md max-w-2xl mx-auto">
              แหล่งรวมศูนย์ดูแลที่ได้มาตรฐาน ครบครัน และปลอดภัยสำหรับคนที่คุณรัก
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-gray-700 placeholder-gray-400 font-medium"
                  placeholder="ค้นหาชื่อศูนย์, จังหวัด, หรือบริการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && scrollToResults()}
                />
              </div>
              <div className="flex md:hidden gap-2">
                <select className="w-1/3 px-2 py-3 bg-gray-50/50 border-none rounded-2xl text-gray-700 focus:ring-2 focus:ring-blue-500/20 font-medium text-sm" value={province} onChange={handleProvinceChange}>
                  <option value="all">ทุกจังหวัด</option>{THAI_PROVINCES.map(prov => (<option key={prov} value={prov}>{prov}</option>))}</select>
                <select className="w-1/3 px-2 py-3 bg-gray-50/50 border-none rounded-2xl text-gray-700 focus:ring-2 focus:ring-blue-500/20 font-medium text-sm" value={careType} onChange={handleCareTypeChange}>
                  <option value="all">ทุกประเภท</option><option value="daily">รายวัน</option><option value="monthly">รายเดือน</option></select>
                <select className="w-1/3 px-2 py-3 bg-gray-50/50 border-none rounded-2xl text-gray-700 focus:ring-2 focus:ring-blue-500/20 font-medium text-sm" value={priceRange} onChange={handlePriceChange}>
                  <option value="all">ทุกราคา</option><option value="0-20000">&lt; 20k</option><option value="20001-25000">20k-25k</option><option value="25001-999999">&gt; 25k</option></select>
              </div>
              <div className="hidden md:flex gap-2">
                <select className="px-4 py-3 bg-gray-50/50 border-none rounded-2xl text-gray-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-gray-100 transition-colors font-medium" value={province} onChange={handleProvinceChange}>
                  <option value="all">ทุกจังหวัด</option>{THAI_PROVINCES.map(prov => (<option key={prov} value={prov}>{prov}</option>))}</select>
                <select className="px-4 py-3 bg-gray-50/50 border-none rounded-2xl text-gray-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-gray-100 transition-colors font-medium" value={careType} onChange={handleCareTypeChange}>
                  <option value="all">ทุกประเภท</option><option value="daily">รายวัน</option><option value="monthly">รายเดือน</option></select>
                <select className="px-4 py-3 bg-gray-50/50 border-none rounded-2xl text-gray-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-gray-100 transition-colors font-medium" value={priceRange} onChange={handlePriceChange}>
                  <option value="all">ทุกราคา</option><option value="0-20000">ต่ำกว่า 20k</option><option value="20001-25000">20k - 25k</option><option value="25001-999999">มากกว่า 25k</option></select>
              </div>
              <button
                onClick={scrollToResults}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95 whitespace-nowrap"
              >ค้นหา</button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-gray-500 text-sm font-medium mr-1">จังหวัดยอดนิยม:</span>
              {popularProvinces.length > 0 ? popularProvinces.map((prov) => (
                <button
                  key={prov}
                  onClick={() => { setProvince(prov); gtag.event({ action: 'quick_select_province', category: 'Engagement', label: prov }); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${province === prov ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
                >
                  <MapPin className="w-3 h-3" />{prov}</button>
              )) : (<span className="text-gray-400 text-sm italic">กำลังโหลด...</span>)}
              {province !== 'all' && (
                <button
                  onClick={() => { setProvince('all'); gtag.event({ action: 'clear_province_filter', category: 'Engagement' }); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium text-red-500 hover:bg-red-50 transition-all ml-1"
                >
                  <XCircle className="w-4 h-4" />ล้างตัวกรอง
                </button>
              )}
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
                    </div>
                  )}
                </a>
              ))}
            </ScrollableContainer>
          </div>
        </div>
      )}

      <div id="results-section" className=" container max-w-6xl mx-auto p-4 md:p-8 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* 1. ส่วน: ศูนย์ดูแลแนะนำ */}
            {recommendedCenters.length > 0 && (
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
                      <CenterCard center={center} />
                    </div>
                  ))}
                  {recommendedCenters.length > 3 && (
                    <div className="flex-shrink-0 w-32 flex items-center justify-center snap-center">
                      <button className="flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors whitespace-nowrap">
                        ดูทั้งหมด <ChevronRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  )}
                </ScrollableContainer>

              </section>
            )}

            {/* <div className="border-t border-gray-100 my-8"></div> */}


            {/* 2. ส่วน: ทั้งหมด */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    ผลลัพธ์การค้นหาทั้งหมด
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    ค้นพบ **{filteredCenters.length}** แห่งตามเงื่อนไข
                  </p>
                </div>
              </div>

              {/* Grid View */}
              {filteredCenters.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedCenters.map(center => (
                      <CenterCard key={center.id} center={center} />
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
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100 mt-8">
                  <div className="text-gray-300 mb-4"><Search className="h-16 w-16 mx-auto opacity-50" /></div>
                  <h3 className="text-xl font-semibold text-gray-700">ไม่พบข้อมูลศูนย์ดูแล</h3>
                  <p className="text-gray-500 mt-2">ไม่มีผลลัพธ์สำหรับ **{searchTerm || 'การค้นหาปัจจุบัน'}** <br />ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
                </div>
              )}

            </section>
          </>
        )}
      </div>
    </div>
  );
}