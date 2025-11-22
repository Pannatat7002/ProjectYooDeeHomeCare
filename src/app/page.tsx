'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { CareCenter } from '../types';
import * as gtag from '../lib/gtag';
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomePage() {
  // --- State and Logic (UNCHANGED) ---
  const [centers, setCenters] = useState<CareCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [careType, setCareType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Fetch Data ---
  useEffect(() => {
    const startTime = performance.now();
    fetch('/api/care-centers')
      .then(res => res.json())
      .then(data => {
        setCenters(data);
        setLoading(false);
        const loadTime = Math.round(performance.now() - startTime);
        gtag.event({
          action: 'data_loaded',
          category: 'Performance',
          value: loadTime,
          label: `Loaded ${data.length} centers`
        });
      })
      .catch(err => {
        console.error("Fetch error:", err);
        gtag.event({ action: 'api_error', category: 'Error', label: err.message });
      });
  }, []);

  // --- Advanced Filtering Logic ---
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
    return result;
  }, [searchTerm, careType, priceRange, centers]);

  // --- Utility Functions ---
  const handleCareTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCareType(e.target.value);
    gtag.event({ action: 'filter_care_type', category: 'Engagement', label: e.target.value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriceRange(e.target.value);
    gtag.event({ action: 'filter_price', category: 'Engagement', label: e.target.value });
  };

  const createSlug = (name: string) => {
    return encodeURIComponent(name.replace(/\s+/g, '-'));
  };

  // --- Render ---
  return (
    <>
      <Header />

      {/* 💡 ส่วนใหม่: Hero Section พร้อม Background Image และ Search Bar */}
      <div
        className="relative h-[450px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/hero-background.jpg")', // 💡 เปลี่ยน path รูปภาพตามจริง
          backgroundPosition: 'center 40%', // ปรับตำแหน่งรูป
        }}
      >
        {/* Overlay สีดำจางๆ เพื่อให้อ่านตัวหนังสือได้ชัดเจน */}
        <div className="absolute inset-0 bg-black opacity-10"></div>

        <div className="z-10 container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            ค้นหาสถานที่ดูแลที่ดีที่สุด
          </h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow">
            ศูนย์ดูแลผู้สูงอายุและผู้ป่วยพักฟื้นทั่วประเทศ
          </p>

          {/* Search Bar ภายใต้ Hero */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl mx-auto max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 relative">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                    placeholder="ชื่อศูนย์, จังหวัด, หรือบริการ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                </div>
              </div>
              <div>
                <select
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white"
                  value={careType}
                  onChange={handleCareTypeChange}
                >
                  <option value="all">ทุกประเภท</option>
                  <option value="daily">รายวัน</option>
                  <option value="monthly">รายเดือน</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white"
                  value={priceRange}
                  onChange={handlePriceChange}
                >
                  <option value="all">ทุกราคา</option>
                  <option value="0-20000">ต่ำกว่า 20,000</option>
                  <option value="20001-25000">20,001 - 25,000</option>
                  <option value="25001-999999">มากกว่า 25,000</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="container max-w-6xl mx-auto p-4 md:p-8 flex-grow">
        {/* 🛑 ส่วน Filter Section เดิมถูกลบออกไป เพื่อย้าย Filter ไปไว้ใน Hero แล้ว */}

        {/* แสดงจำนวนผลลัพธ์ */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ผลลัพธ์การค้นหา ({loading ? '...' : filteredCenters.length})
          </h2>
        </div>


        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map(center => (
              // 💡 ทำให้ Card ทั้งหมดสามารถคลิกได้ โดยใช้ Link ห่อ Div หลัก
              <Link
                key={center.id}
                href={`/${createSlug(center.name)}`}
                className="block" // ต้องเป็น block เพื่อให้ Link คลุมทั้ง Card
                onClick={() => gtag.event({ action: 'view_item_list', category: 'Discovery', label: center.name, center_id: center.id })}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100 cursor-pointer">
                  {/* 1. ส่วนรูปภาพ */}
                  <div className="block h-48 overflow-hidden relative group">
                    <img
                      src={center.imageUrls?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                      alt={center.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}
                    />

                    {/* Badge: Exclusive (ถ้ามี) */}
                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg shadow-md">
                      {center.type === 'both' ? 'รายวัน/เดือน' : center.type === 'daily' ? 'รายวัน' : 'รายเดือน'}
                    </div>

                    {/* Badge: ประเภท (ย้ายจากมุมขวาบน มาเป็นป้ายบอกประเภทบริการ) */}
                    {/* ไม่ได้ใช้แล้วตามภาพตัวอย่าง */}

                    {/* Badge: Certified (ถ้ามี) - ย้ายไปอยู่ด้านล่างแทน */}
                    {center.hasGovernmentCertificate && (
                      <div className="absolute bottom-2 left-2 bg-green-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
                        รับรองจาก สปสช
                      </div>
                    )}

                    {/* Icon กล้อง/แผนที่ Placeholder (จำลองจากภาพ) */}
                    <div className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-1.94l-2.432-2.432a1.5 1.5 0 00-2.12 0L11.75 14.25l-.78-.78a.75.75 0 00-1.06 0L4.5 18.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* 2. ส่วนเนื้อหา */}
                  <div className="p-4 md:p-5 flex-grow flex flex-col">

                    {/* ชื่อ */}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                      {center.name}
                    </h3>

                    {/* ที่อยู่ */}
                    <p className="text-gray-600 text-sm flex items-start mb-4 line-clamp-2">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      {center.address}
                    </p>

                    {/* 3. ส่วนราคาและรายละเอียด */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      {/* ราคาหลัก (รายเดือน) */}
                      <div className="text-lg font-medium text-blue-800 mb-1">
                        {/* จำลองการแสดงช่วงราคา ถ้ามี */}
                        <span className="text-2xl">{center.price.toLocaleString()}</span> -
                        <span className="text-2xl">{(center.price + 5000).toLocaleString()}</span> บาท/เดือน
                      </div>

                      {/* ราคาเสริม (รายวัน) */}
                      <div className="text-gray-700 text-md font-bold">
                        <span className="text-red-500">{Math.floor(center.price / 30).toLocaleString()}</span> บาท/วัน
                      </div>
                    </div>

                    {/* <div className="flex justify-between items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-gray-400">
                          <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6v-1.5A.75.75 0 016.75 2.25zm13.5 9a.75.75 0 00-1.5 0v5.25a.75.75 0 001.5 0v-5.25z" clipRule="evenodd" />
                        </svg>
                        <span> เข้าวร่วมเมื่อ: 22/11/2025 8:58</span> 
                      </div>
                    </div> */}

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredCenters.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100 mt-8">
            <div className="text-gray-300 mb-4">
              <Search className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">ไม่พบข้อมูลศูนย์ดูแล</h3>
            <p className="text-gray-500 mt-2">
              ไม่มีผลลัพธ์สำหรับ **{searchTerm || 'การค้นหาปัจจุบัน'}** <br />ลองปรับเปลี่ยนเงื่อนไขการค้นหา
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}