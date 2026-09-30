/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Building2,
    Globe,
    Phone,
    MessageSquare,
    Eye,
    MousePointerClick,
    Calendar,
    ExternalLink,
    CalendarCheck,
    Mail,
    FileText,
    Megaphone,
    TrendingUp,
    Clock,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    UserCheck
} from 'lucide-react';
import { fetchWithAuth } from '../../../lib/auth-client';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function DashboardPage() {
    const [trafficLogs, setTrafficLogs] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [centers, setCenters] = useState<any[]>([]);
    const [blogsCount, setBlogsCount] = useState(0);
    const [adsCount, setAdsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        totalCenters: 0,
        partnerCenters: 0,
        certifiedCenters: 0,
        totalViews: 0,
        totalWebClicks: 0,
        totalPhoneClicks: 0,
        totalLineClicks: 0,
        totalConsultations: 0,
        pendingConsultations: 0,
        followedUpConsultations: 0,
        closedConsultations: 0,
        newContacts: 0
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/care-centers').then((res) => res.json()).catch(() => []),
            fetchWithAuth('/api/traffic').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
            fetchWithAuth('/api/care-centers/consultations').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
            fetchWithAuth('/api/contact').then((res) => res.json()).catch(() => ({ data: [] })),
            fetch('/api/blogs').then((res) => res.json()).catch(() => []),
            fetch('/api/ads').then((res) => res.json()).catch(() => [])
        ])
        .then(([centersData, trafficRes, consultRes, contactRes, blogsData, adsData]) => {
            const rawCenters = Array.isArray(centersData) ? centersData : [];
            const logs = trafficRes?.success && Array.isArray(trafficRes.data) ? trafficRes.data : [];
            const rawConsults = consultRes?.success && Array.isArray(consultRes.data) ? consultRes.data : [];
            const rawContacts = Array.isArray(contactRes?.data) ? contactRes.data : [];
            const rawBlogs = Array.isArray(blogsData) ? blogsData : [];
            const rawAds = Array.isArray(adsData) ? adsData : [];

            setCenters(rawCenters);
            setTrafficLogs(logs);
            setConsultations(rawConsults);
            setContacts(rawContacts);
            setBlogsCount(rawBlogs.length);
            setAdsCount(rawAds.filter((a: any) => a.isActive !== false).length);

            const totalCenters = rawCenters.length;
            const partnerCenters = rawCenters.filter((c: any) => c.isPartner).length;
            const certifiedCenters = rawCenters.filter((c: any) => c.hasGovernmentCertificate).length;

            const totalViews = logs.filter((l: any) => l.eventType === 'page_view').length;
            const totalWebClicks = logs.filter((l: any) => l.eventType === 'click_website').length;
            const totalPhoneClicks = logs.filter((l: any) => l.eventType === 'click_phone').length;
            const totalLineClicks = logs.filter((l: any) => l.eventType === 'click_line').length;

            const totalConsultations = rawConsults.length;
            const pendingConsultations = rawConsults.filter((c: any) => !c.status || c.status === 'pending').length;
            const followedUpConsultations = rawConsults.filter((c: any) => c.status === 'followed_up').length;
            const closedConsultations = rawConsults.filter((c: any) => c.status === 'closed').length;

            const newContacts = rawContacts.filter((c: any) => !c.status || c.status === 'new').length;

            setStats({
                totalCenters,
                partnerCenters,
                certifiedCenters,
                totalViews,
                totalWebClicks,
                totalPhoneClicks,
                totalLineClicks,
                totalConsultations,
                pendingConsultations,
                followedUpConsultations,
                closedConsultations,
                newContacts
            });
        })
        .catch((err) => console.error("Error loading dashboard data:", err))
        .finally(() => setIsLoading(false));
    }, []);

    // Get last 7 days dates in local format
    const getLast7DaysLabels = () => {
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }));
        }
        return labels;
    };

    // Get last 7 days date strings for matching
    const getLast7DaysDateStrings = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
        }
        return dates;
    };

    const getDailyTrafficData = () => {
        const dateStrings = getLast7DaysDateStrings();
        const views = dateStrings.map(dateStr => {
            return trafficLogs.filter((l: any) => 
                l.eventType === 'page_view' && l.timestamp?.startsWith(dateStr)
            ).length;
        });
        
        const clicks = dateStrings.map(dateStr => {
            return trafficLogs.filter((l: any) => 
                (l.eventType === 'click_website' || l.eventType === 'click_phone' || l.eventType === 'click_line') && 
                l.timestamp?.startsWith(dateStr)
            ).length;
        });

        return {
            labels: getLast7DaysLabels(),
            datasets: [
                {
                    label: 'ยอดการเข้าชม (Views)',
                    data: views,
                    backgroundColor: 'rgba(43, 100, 160, 0.85)',
                    borderRadius: 6,
                },
                {
                    label: 'การคลิกติดต่อ (Clicks)',
                    data: clicks,
                    backgroundColor: 'rgba(16, 185, 129, 0.85)',
                    borderRadius: 6,
                }
            ]
        };
    };

    const getClickDistributionData = () => {
        return {
            labels: ['เยี่ยมชมเว็บไซต์', 'โทรติดต่อศูนย์', 'แชทผ่าน LINE'],
            datasets: [
                {
                    data: [stats.totalWebClicks, stats.totalPhoneClicks, stats.totalLineClicks],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.85)',
                        'rgba(245, 158, 11, 0.85)',
                        'rgba(16, 185, 129, 0.85)'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }
            ]
        };
    };

    const formatEventType = (type: string) => {
        switch (type) {
            case 'page_view':
                return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">เข้าชมหน้าศูนย์</span>;
            case 'click_website':
                return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">เปิดเว็บไซต์</span>;
            case 'click_phone':
                return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">โทรออก</span>;
            case 'click_line':
                return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">แอด LINE</span>;
            default:
                return <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">{type}</span>;
        }
    };

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-slate-500">กำลังรวบรวมข้อมูลสถิติภาพรวมระบบ...</p>
                </div>
            </div>
        );
    }

    const conversionRate = stats.totalViews > 0 
        ? (((stats.totalConsultations + stats.newContacts) / stats.totalViews) * 100).toFixed(1)
        : '0.0';

    const recentPendingConsultations = consultations
        .filter((c: any) => !c.status || c.status === 'pending')
        .slice(0, 5);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* 1. Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                        ภาพรวมระบบ (Admin Dashboard)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        ติดตามผลลัพธ์ทางธุรกิจ, การนัดหมายของลูกค้า, สถิติการเข้าชม และคิวงานที่ต้องจัดการ
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/manage"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
                    >
                        <span>จัดการข้อมูลระบบ</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* 2. Priority Business Metrics: Leads & Inquiries */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        ตัวชี้วัดความสนใจและลูกค้าเป้าหมาย (Leads & Conversion)
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Consultations Lead Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ขอนัดเยี่ยมชมศูนย์</p>
                                <p className="text-3xl font-black text-slate-800 mt-1.5">{stats.totalConsultations.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 mt-2">
                                    ติดตามแล้ว <span className="font-semibold text-emerald-600">{stats.followedUpConsultations}</span> เคส
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Leads Alert Card */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 rounded-2xl shadow-xs border border-amber-200/80 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">รอนัดหมายด่วน</p>
                                </div>
                                <p className="text-3xl font-black text-amber-700 mt-1.5">{stats.pendingConsultations.toLocaleString()}</p>
                                <p className="text-xs text-amber-800/80 mt-2">
                                    ลูกค้าที่ Care Advisor ต้องโทรติดต่อ
                                </p>
                            </div>
                            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* New Messages Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ข้อความติดต่อใหม่</p>
                                <p className="text-3xl font-black text-slate-800 mt-1.5">{stats.newContacts.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 mt-2">
                                    จากแบบฟอร์มหน้าติดต่อเรา
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Mail className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Conversion Rate Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">อัตรา Conversion Rate</p>
                                <p className="text-3xl font-black text-emerald-600 mt-1.5">{conversionRate}%</p>
                                <p className="text-xs text-slate-500 mt-2">
                                    ผู้เข้าชมที่เปลี่ยนเป็น Lead ติดต่อ
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Traffic & Outbound Engagement */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        การส่งต่อ Traffic ไปยังศูนย์ดูแล (Engagement & Clicks)
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ยอดเข้าชมศูนย์</p>
                                <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{stats.totalViews.toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Eye className="w-5 h-5" /></div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">โทรตรงศูนย์</p>
                                <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.totalPhoneClicks.toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><Phone className="w-5 h-5" /></div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">แชท LINE</p>
                                <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.totalLineClicks.toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><MessageSquare className="w-5 h-5" /></div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">เปิดเว็บไซต์</p>
                                <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{stats.totalWebClicks.toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Globe className="w-5 h-5" /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            สถิติการใช้งานรายวัน (7 วันล่าสุด)
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">เปรียบเทียบ Views vs Clicks</span>
                    </div>
                    <div className="h-64 relative">
                        <Bar 
                            data={getDailyTrafficData()} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' as const }
                                }
                            }} 
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-emerald-600" />
                        สัดส่วนพฤติกรรมการติดต่อ
                    </h3>
                    <div className="h-64 relative flex items-center justify-center">
                        {stats.totalWebClicks === 0 && stats.totalPhoneClicks === 0 && stats.totalLineClicks === 0 ? (
                            <p className="text-sm text-slate-400 italic">ยังไม่มีข้อมูลการคลิก</p>
                        ) : (
                            <Doughnut 
                                data={getClickDistributionData()} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom' as const }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Action Required: Recent Pending Consultations Queue */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                คิวลูกค้ารอการติดต่อกลับ (Pending Consultations)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                ลูกค้าที่ส่งแบบฟอร์มขอนัดหมายเยี่ยมชมศูนย์ดูแลล่าสุด
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/manage"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
                    >
                        <span>ดูรายการทั้งหมด</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                                <th className="py-3.5 px-4 sm:px-6">ผู้ติดต่อ</th>
                                <th className="py-3.5 px-4 sm:px-6">เบอร์โทรศัพท์</th>
                                <th className="py-3.5 px-4 sm:px-6">ศูนย์ที่สนใจ</th>
                                <th className="py-3.5 px-4 sm:px-6">งบประมาณ</th>
                                <th className="py-3.5 px-4 sm:px-6">วันเวลาที่ส่ง</th>
                                <th className="py-3.5 px-4 sm:px-6 text-right">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {recentPendingConsultations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                                        ✓ ยอดเยี่ยม! ไม่มีคำขอนัดหมายที่ค้างอยู่
                                    </td>
                                </tr>
                            ) : (
                                recentPendingConsultations.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800">
                                            {item.name || item.contactName || 'ผู้สนใจบริการ'}
                                            {item.relationshipToRecipient && (
                                                <span className="block text-[11px] text-slate-400 font-normal">
                                                    ({item.relationshipToRecipient})
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 font-mono text-xs">
                                            <a href={`tel:${item.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {item.phone}
                                            </a>
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 text-xs text-slate-600">
                                            {item.branch || item.centerName || 'ศูนย์ทั่วไป'}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 text-xs font-medium text-slate-700">
                                            {item.budget || 'ไม่ระบุ'}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 text-xs text-slate-400">
                                            {item.submittedAt ? formatTime(item.submittedAt) : '-'}
                                        </td>
                                        <td className="py-3 px-4 sm:px-6 text-right">
                                            <Link
                                                href="/admin/manage"
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                <span>ติดต่อกลับ</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 6. System & Content Assets Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ฐานข้อมูลศูนย์ดูแล</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalCenters} แห่ง</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <span className="font-semibold text-emerald-600">{stats.certifiedCenters} สบส.</span>
                            <span>•</span>
                            <span className="font-semibold text-blue-600">{stats.partnerCenters} พาร์ทเนอร์</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Building2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">บทความความรู้ (Blogs)</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{blogsCount} เรื่อง</p>
                        <p className="text-xs text-slate-500 mt-2">
                            เผยแพร่บนระบบ SEO
                        </p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">สื่อโฆษณา (Active Ads)</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{adsCount} แคมเปญ</p>
                        <p className="text-xs text-slate-500 mt-2">
                            กำลังแสดงผลบนหน้าเว็บ
                        </p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Megaphone className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* 7. Recent Visitor Traffic Log Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">ประวัติการเข้าชมและการส่งต่อ Traffic ล่าสุด</h3>
                        <p className="text-xs text-slate-400 mt-0.5">บันทึกข้อมูลการเยี่ยมชมศูนย์และการส่งต่อ Traffic เพื่อติดตามแหล่งที่มา (UTM Source / Referrer)</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                                <th className="py-3.5 px-4 sm:px-6 w-48">วันเวลา (Time)</th>
                                <th className="py-3.5 px-4 sm:px-6 w-36">ประเภท (Event)</th>
                                <th className="py-3.5 px-4 sm:px-6">ศูนย์ดูแลที่เป็นเป้าหมาย (Care Center Target)</th>
                                <th className="py-3.5 px-4 sm:px-6 w-48">แหล่งที่มา (UTM Source)</th>
                                <th className="py-3.5 px-4 sm:px-6 w-40">ผู้แนะนำ (Referrer)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {trafficLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                                        ยังไม่มีข้อมูล Traffic จัดเก็บในระบบ
                                    </td>
                                </tr>
                            ) : (
                                trafficLogs.slice(0, 15).map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-500 text-xs">
                                            {formatTime(log.timestamp)}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            {formatEventType(log.eventType)}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            {log.centerName ? (
                                                <div className="font-semibold text-slate-800 flex items-center gap-1">
                                                    {log.centerName}
                                                    <span className="text-[10px] text-slate-400 font-normal">(ID: {log.centerId})</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-medium italic">หน้าหลัก (Homepage)</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            {log.utmSource ? (
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold border border-slate-200">
                                                        src: {log.utmSource}
                                                    </span>
                                                    {log.utmMedium && (
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold border border-slate-200">
                                                            med: {log.utmMedium}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 font-medium italic">direct / none</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 max-w-xs truncate text-xs text-slate-400" title={log.referrer}>
                                            {log.referrer ? (
                                                <span className="flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">{log.referrer.replace(/https?:\/\//, '')}</span>
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {trafficLogs.length > 15 && (
                    <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
                        แสดง 15 รายการล่าสุดจากทั้งหมด {trafficLogs.length} รายการ
                    </div>
                )}
            </div>
        </div>
    );
}