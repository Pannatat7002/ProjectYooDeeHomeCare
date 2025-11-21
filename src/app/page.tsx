
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
  const handleCareTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => { /* ... */ setCareType(e.target.value); };
  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => { /* ... */ setPriceRange(e.target.value); };
  const createSlug = (name: string) => { return encodeURIComponent(name.replace(/\s+/g, '-')); };


  // --- Render ---
  return (
    <>
      <Header />
      <div className="container max-w-6xl mx-auto p-4 md:p-8 flex-grow">
        {/* Filter Section (Simplified for clean look) */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ค้นหาสถานที่ดูแลที่ดีที่สุด</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 relative">
              <label className="text-sm font-medium text-gray-700">ค้นหา</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50"
                  placeholder="ชื่อศูนย์, จังหวัด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ประเภท</label>
              <select
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={careType}
                onChange={handleCareTypeChange}
              >
                <option value="all">ทั้งหมด</option>
                <option value="daily">รายวัน</option>
                <option value="monthly">รายเดือน</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ราคา (บาท)</label>
              <select
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map(center => (
              <div key={center.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100">
                <Link
                  href={`/${createSlug(center.name)}`}
                  className="block h-48 overflow-hidden relative group cursor-pointer"
                  onClick={() => gtag.event({ action: 'view_item_list', category: 'Discovery', label: center.name, center_id: center.id })}
                >
                  <img
                    src={center.imageUrls?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                    alt={center.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Error')}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm border border-gray-100">
                    {center.type === 'both' ? 'รายวัน/เดือน' : center.type === 'daily' ? 'รายวัน' : 'รายเดือน'}
                  </div>
                </Link>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/${createSlug(center.name)}`} className="text-lg font-bold text-gray-900 leading-tight hover:text-indigo-600 cursor-pointer">
                        {center.name}
                      </Link>
                      <div className="flex items-center bg-gray-50 text-gray-700 px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 border border-gray-100 ml-2">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {center.rating.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm flex items-start mb-4">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{center.address}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500">เริ่มต้น</p>
                      <p className="text-xl font-extrabold text-indigo-700">
                        ฿{center.price.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/${createSlug(center.name)}`}
                      className="px-5 py-2 bg-indigo-600 text-white text-base rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-300/50"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
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