/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Activity,
    Search,
    Filter,
    RotateCcw,
    Download,
    Eye,
    Phone,
    MessageSquare,
    Globe,
    Calendar,
    ExternalLink,
    Building2,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Smartphone,
    Monitor,
    Compass
} from 'lucide-react';
import { fetchWithAuth, isAuthenticated } from '../../../lib/auth-client';

export default function TrafficAnalyticsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [centers, setCenters] = useState<any[]>([]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEventType, setSelectedEventType] = useState('all');
    const [selectedCenterId, setSelectedCenterId] = useState('all');
    const [selectedSource, setSelectedSource] = useState('all');
    const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // 1. Check Auth & Load Data
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        Promise.all([
            fetchWithAuth('/api/traffic').then((res) => res.json()).catch(() => ({ data: [] })),
            fetch('/api/care-centers').then((res) => res.json()).catch(() => [])
        ])
        .then(([trafficRes, centersData]) => {
            const rawLogs = trafficRes?.success && Array.isArray(trafficRes.data) ? trafficRes.data : [];
            const rawCenters = Array.isArray(centersData) ? centersData : [];
            setLogs(rawLogs);
            setCenters(rawCenters);
        })
        .catch((err) => console.error('Error fetching traffic analytics:', err))
        .finally(() => setIsLoading(false));
    }, [router]);

    // 2. Extract Available Sources from Logs
    const availableSources = useMemo(() => {
        const sources = new Set<string>();
        logs.forEach((log) => {
            if (log.utmSource) {
                sources.add(log.utmSource.toLowerCase().trim());
            }
        });
        return Array.from(sources).sort();
    }, [logs]);

    // 3. Filtered Logs Processing
    const filteredLogs = useMemo(() => {
        const now = new Date();

        return logs.filter((log) => {
            // Event Type Filter
            if (selectedEventType !== 'all' && log.eventType !== selectedEventType) {
                return false;
            }

            // Center Filter
            if (selectedCenterId !== 'all') {
                if (String(log.centerId) !== String(selectedCenterId)) return false;
            }

            // UTM Source Filter
            if (selectedSource !== 'all') {
                if (selectedSource === 'direct') {
                    if (log.utmSource) return false;
                } else if ((log.utmSource || '').toLowerCase() !== selectedSource.toLowerCase()) {
                    return false;
                }
            }

            // Date Range Filter
            if (dateRange !== 'all') {
                const logDate = new Date(log.timestamp);
                const diffTime = now.getTime() - logDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);

                if (dateRange === 'today') {
                    const todayStr = now.toISOString().slice(0, 10);
                    if (!log.timestamp?.startsWith(todayStr)) return false;
                } else if (dateRange === '7days' && diffDays > 7) {
                    return false;
                } else if (dateRange === '30days' && diffDays > 30) {
                    return false;
                }
            }

            // Search Query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchCenter = (log.centerName || '').toLowerCase().includes(query);
                const matchId = String(log.centerId || '').includes(query);
                const matchSource = (log.utmSource || '').toLowerCase().includes(query);
                const matchMedium = (log.utmMedium || '').toLowerCase().includes(query);
                const matchReferrer = (log.referrer || '').toLowerCase().includes(query);
                const matchIp = (log.ip || '').toLowerCase().includes(query);

                if (!matchCenter && !matchId && !matchSource && !matchMedium && !matchReferrer && !matchIp) {
                    return false;
                }
            }

            return true;
        });
    }, [logs, selectedEventType, selectedCenterId, selectedSource, dateRange, searchQuery]);

    // 4. Analytics Summary based on Filtered Logs
    const analytics = useMemo(() => {
        const total = filteredLogs.length;
        const views = filteredLogs.filter((l) => l.eventType === 'page_view').length;
        const phone = filteredLogs.filter((l) => l.eventType === 'click_phone').length;
        const line = filteredLogs.filter((l) => l.eventType === 'click_line').length;
        const web = filteredLogs.filter((l) => l.eventType === 'click_website').length;
        const totalClicks = phone + line + web;

        const uniqueCenters = new Set(filteredLogs.filter((l) => l.centerId).map((l) => l.centerId)).size;
        const ctr = views > 0 ? ((totalClicks / views) * 100).toFixed(1) : '0.0';

        // Top Centers Ranking
        const centerCounts: Record<string, { id: number | null; name: string; views: number; clicks: number }> = {};
        filteredLogs.forEach((l) => {
            if (!l.centerName) return;
            const key = l.centerName;
            if (!centerCounts[key]) {
                centerCounts[key] = { id: l.centerId, name: l.centerName, views: 0, clicks: 0 };
            }
            if (l.eventType === 'page_view') centerCounts[key].views++;
            else centerCounts[key].clicks++;
        });

        const topCenters = Object.values(centerCounts)
            .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
            .slice(0, 5);

        // Sources Breakdown
        const sourceCounts: Record<string, number> = {};
        filteredLogs.forEach((l) => {
            const src = l.utmSource ? l.utmSource.toLowerCase() : 'direct / none';
            sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        });

        const topSources = Object.entries(sourceCounts)
            .map(([src, count]) => ({ source: src, count, percent: total > 0 ? ((count / total) * 100).toFixed(0) : '0' }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            total,
            views,
            phone,
            line,
            web,
            totalClicks,
            uniqueCenters,
            ctr,
            topCenters,
            topSources
        };
    }, [filteredLogs]);

    // 5. Pagination calculation
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(start, start + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedEventType('all');
        setSelectedCenterId('all');
        setSelectedSource('all');
        setDateRange('all');
        setCurrentPage(1);
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (filteredLogs.length === 0) {
            alert('ไม่มีข้อมูลที่ตรงตามตัวกรองสำหรับดาวน์โหลด');
            return;
        }

        const headers = ['วันเวลา', 'ประเภท Event', 'ศูนย์ดูแล', 'รหัสศูนย์', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Referrer', 'IP Address'];
        const rows = filteredLogs.map((l) => [
            `"${new Date(l.timestamp).toLocaleString('th-TH')}"`,
            `"${l.eventType || ''}"`,
            `"${(l.centerName || 'หน้าหลัก').replace(/"/g, '""')}"`,
            `"${l.centerId || ''}"`,
            `"${l.utmSource || ''}"`,
            `"${l.utmMedium || ''}"`,
            `"${l.utmCampaign || ''}"`,
            `"${(l.referrer || '').replace(/"/g, '""')}"`,
            `"${l.ip || ''}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `traffic-report-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatEventType = (type: string) => {
        switch (type) {
            case 'page_view':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">เข้าชมหน้าศูนย์</span>;
            case 'click_website':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">เปิดเว็บไซต์</span>;
            case 'click_phone':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">โทรออก</span>;
            case 'click_line':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">แอด LINE</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">{type}</span>;
        }
    };

    const getDeviceIcon = (ua: string = '') => {
        const lowerUa = ua.toLowerCase();
        if (lowerUa.includes('mobile') || lowerUa.includes('android') || lowerUa.includes('iphone')) {
            return (
                <span title="อุปกรณ์มือถือ" className="inline-flex items-center">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                </span>
            );
        }
        return (
            <span title="คอมพิวเตอร์ / เดสก์ท็อป" className="inline-flex items-center">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="p-8 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-slate-500">กำลังโหลดประวัติการเข้าใช้งาน (Traffic Logs)...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
                        <Activity className="w-6 h-6 text-blue-600" />
                        วิเคราะห์และประวัติ Traffic (Traffic Analytics)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        ติดตามพฤติกรรมผู้เข้าชม, การส่งต่อการติดต่อรายศูนย์, และประสิทธิภาพของช่องทาง UTM
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                        title="ดาวน์โหลดรายงานเป็น CSV"
                    >
                        <Download className="w-4 h-4 text-slate-500" />
                        <span>ส่งออก CSV</span>
                    </button>
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                    >
                        <span>ไป Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* 2. Interactive Filter Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        <Filter className="w-4 h-4 text-blue-600" />
                        ตัวกรองข้อมูลเชิงวิเคราะห์
                    </div>

                    {(searchQuery || selectedEventType !== 'all' || selectedCenterId !== 'all' || selectedSource !== 'all' || dateRange !== 'all') && (
                        <button
                            onClick={handleResetFilters}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            ล้างตัวกรองทั้งหมด
                        </button>
                    )}
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อศูนย์, UTM, Referrer..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    {/* Event Type */}
                    <div>
                        <select
                            value={selectedEventType}
                            onChange={(e) => { setSelectedEventType(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">ประเภทเหตุการณ์ทั้งหมด</option>
                            <option value="page_view">👁️ เข้าชมหน้าศูนย์ (Page View)</option>
                            <option value="click_phone">📞 โทรติดต่อ (Click Phone)</option>
                            <option value="click_line">💬 แอด LINE (Click LINE)</option>
                            <option value="click_website">🌐 เปิดเว็บไซต์ (Click Website)</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <select
                            value={dateRange}
                            onChange={(e) => { setDateRange(e.target.value as any); setCurrentPage(1); }}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">ช่วงเวลาทั้งหมด</option>
                            <option value="today">วันนี้ (Today)</option>
                            <option value="7days">7 วันล่าสุด</option>
                            <option value="30days">30 วันล่าสุด</option>
                        </select>
                    </div>

                    {/* Center Filter */}
                    <div>
                        <select
                            value={selectedCenterId}
                            onChange={(e) => { setSelectedCenterId(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">ศูนย์ดูแลทั้งหมด ({centers.length})</option>
                            {centers.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* UTM Source */}
                    <div>
                        <select
                            value={selectedSource}
                            onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">แหล่งที่มาทั้งหมด (UTM)</option>
                            <option value="direct">Direct / Organic (ไม่มี UTM)</option>
                            {availableSources.map((src) => (
                                <option key={src} value={src}>
                                    {src}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. Real-time KPI Cards based on Filters */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">บันทึกที่พบ (Total)</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{analytics.total.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-1">จากตัวกรองปัจจุบัน</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ยอดเข้าชม (Views)</p>
                    <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{analytics.views.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-1">เข้าดูโปรไฟล์ศูนย์</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">โทรออก (Calls)</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{analytics.phone.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-1">คลิกเบอร์โทรศัพท์</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">แอด LINE (Chat)</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{analytics.line.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-1">คลิกคุยผ่าน LINE</p>
                </div>

                <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">อัตรา CTR ส่งต่อ</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">{analytics.ctr}%</p>
                    <p className="text-[11px] text-slate-400 mt-1">{analytics.totalClicks} คลิกจาก {analytics.views} วิว</p>
                </div>
            </div>

            {/* 4. Deep Analytical Breakdown (Top Centers & Sources) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top Performing Centers */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            ศูนย์ที่มียอดความสนใจสูงสุด (Top Centers)
                        </h3>
                        <span className="text-xs text-slate-400">เรียงตาม Views + Clicks</span>
                    </div>

                    {analytics.topCenters.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">ไม่มีข้อมูลศูนย์ในตัวกรองนี้</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.topCenters.map((item, idx) => {
                                const totalEngagement = item.views + item.clicks;
                                const maxEngagement = analytics.topCenters[0].views + analytics.topCenters[0].clicks;
                                const pct = maxEngagement > 0 ? (totalEngagement / maxEngagement) * 100 : 0;

                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                                                {idx + 1}. {item.name}
                                            </span>
                                            <span className="font-medium text-slate-500">
                                                {item.views} วิว • <span className="text-emerald-600 font-semibold">{item.clicks} คลิก</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Traffic Sources */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-emerald-600" />
                            ช่องทางที่มาของผู้เข้าชม (Top UTM Sources)
                        </h3>
                        <span className="text-xs text-slate-400">สัดส่วนช่องทาง</span>
                    </div>

                    {analytics.topSources.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">ไม่มีข้อมูลแหล่งที่มาในตัวกรองนี้</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.topSources.map((item) => (
                                <div key={item.source} className="flex items-center justify-between text-xs p-2.5 bg-slate-50/70 rounded-xl">
                                    <span className="font-semibold text-slate-700 font-mono">
                                        {item.source}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500">{item.count.toLocaleString()} ครั้ง</span>
                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                            {item.percent}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Detailed Traffic Log Table with Pagination */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">
                            ตารางบันทึกกิจกรรม Traffic ({filteredLogs.length.toLocaleString()} รายการ)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            แสดงกิจกรรมการเข้าชมและการคลิกติดต่อพร้อมพารามิเตอร์เพื่อการวิเคราะห์
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
                        <span>แสดงต่อหน้า:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                                <th className="py-3.5 px-4 sm:px-6 w-44">วันเวลา (Time)</th>
                                <th className="py-3.5 px-4 sm:px-6 w-36">ประเภท (Event)</th>
                                <th className="py-3.5 px-4 sm:px-6">ศูนย์ดูแลเป้าหมาย</th>
                                <th className="py-3.5 px-4 sm:px-6 w-44">แหล่งที่มา (UTM Source)</th>
                                <th className="py-3.5 px-4 sm:px-6 w-48">Referrer</th>
                                <th className="py-3.5 px-4 sm:px-6 w-20 text-center">อุปกรณ์</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                                        ไม่พบข้อมูลที่ตรงตามเงื่อนไขตัวกรอง
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 sm:px-6 text-xs text-slate-500 font-mono whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6">
                                            {formatEventType(log.eventType)}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6">
                                            {log.centerName ? (
                                                <div>
                                                    <span className="font-semibold text-slate-800 text-xs">
                                                        {log.centerName}
                                                    </span>
                                                    {log.centerId && (
                                                        <span className="text-[10px] text-slate-400 ml-1">
                                                            (ID: {log.centerId})
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">
                                                    หน้าหลัก / ระบบค้นหา
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6">
                                            {log.utmSource ? (
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-bold border border-slate-200">
                                                        {log.utmSource}
                                                    </span>
                                                    {log.utmMedium && (
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-medium border border-slate-200">
                                                            {log.utmMedium}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">direct</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 max-w-xs truncate text-xs text-slate-400" title={log.referrer}>
                                            {log.referrer ? (
                                                <span className="flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">{log.referrer.replace(/https?:\/\//, '')}</span>
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 text-center">
                                            {getDeviceIcon(log.userAgent)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            หน้า {currentPage} จากทั้งหมด {totalPages} หน้า (ข้อมูล {filteredLogs.length} รายการ)
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
