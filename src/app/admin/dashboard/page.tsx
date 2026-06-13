'use client';

import { useEffect, useState } from 'react';
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
import { Building2, Globe, Phone, MessageSquare, Eye, MousePointerClick, Calendar, ExternalLink } from 'lucide-react';
import { CareCenter } from '@/src/types';
import { fetchWithAuth } from '../../../lib/auth-client';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function DashboardPage() {
    const [centers, setCenters] = useState<CareCenter[]>([]);
    const [trafficLogs, setTrafficLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCenters: 0,
        totalViews: 0,
        totalWebClicks: 0,
        totalPhoneClicks: 0,
        totalLineClicks: 0
    });

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch('/api/care-centers').then((res: any) => res.json()),
            fetchWithAuth('/api/traffic').then((res: any) => res.json())
        ])
        .then(([centersData, trafficRes]) => {
            if (Array.isArray(centersData)) {
                setCenters(centersData);
            }
            
            const logs = trafficRes.success && Array.isArray(trafficRes.data) ? trafficRes.data : [];
            setTrafficLogs(logs);
            
            const totalCenters = Array.isArray(centersData) ? centersData.length : 0;
            const totalViews = logs.filter((l: any) => l.eventType === 'page_view').length;
            const totalWebClicks = logs.filter((l: any) => l.eventType === 'click_website').length;
            const totalPhoneClicks = logs.filter((l: any) => l.eventType === 'click_phone').length;
            const totalLineClicks = logs.filter((l: any) => l.eventType === 'click_line').length;
            
            setStats({
                totalCenters,
                totalViews,
                totalWebClicks,
                totalPhoneClicks,
                totalLineClicks
            });
        })
        .catch(err => console.error("Error loading dashboard data:", err))
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
            // Formulate YYYY-MM-DD matching user local dates
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
                l.eventType === 'page_view' && l.timestamp.startsWith(dateStr)
            ).length;
        });
        
        const clicks = dateStrings.map(dateStr => {
            return trafficLogs.filter((l: any) => 
                (l.eventType === 'click_website' || l.eventType === 'click_phone' || l.eventType === 'click_line') && 
                l.timestamp.startsWith(dateStr)
            ).length;
        });

        return {
            labels: getLast7DaysLabels(),
            datasets: [
                {
                    label: 'การเข้าชมหน้าเว็บ (Views)',
                    data: views,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                },
                {
                    label: 'การคลิกติดต่อตรง/เว็บไซต์ (Clicks)',
                    data: clicks,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                }
            ]
        };
    };

    const getClickDistributionData = () => {
        return {
            labels: ['เว็บไซต์ศูนย์', 'โทรศัพท์ตรง', 'LINE แพลตฟอร์ม'],
            datasets: [
                {
                    data: [stats.totalWebClicks, stats.totalPhoneClicks, stats.totalLineClicks],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)', // Indigo
                        'rgba(16, 185, 129, 0.8)', // Emerald
                        'rgba(6, 199, 85, 0.8)'    // Line green
                    ],
                    borderWidth: 1,
                }
            ]
        };
    };

    const formatEventType = (type: string) => {
        switch (type) {
            case 'page_view':
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Page View</span>;
            case 'click_website':
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">Visit Website</span>;
            case 'click_phone':
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">Call Center</span>;
            case 'click_line':
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">LINE click</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">{type}</span>;
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
            <div className="p-8 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">กำลังดาวน์โหลดข้อมูลการเข้าใช้งาน...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">ภาพรวมการเข้าใช้งานระบบ (B2B Dashboard)</h1>
                <p className="text-sm text-gray-500 mt-1">ติดตามประสิทธิภาพการใช้งานแพลตฟอร์มและการส่งต่อ Traffic ไปยังผู้ให้บริการต้นทาง</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">ศูนย์ทั้งหมด</p>
                        <p className="text-2xl font-black text-gray-800 mt-1">{stats.totalCenters}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-600"><Building2 className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">การเข้าชม (Views)</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Eye className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">คลิกเว็บศูนย์</p>
                        <p className="text-2xl font-black text-indigo-600 mt-1">{stats.totalWebClicks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Globe className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">โทรตรงศูนย์</p>
                        <p className="text-2xl font-black text-green-600 mt-1">{stats.totalPhoneClicks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-green-600"><Phone className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">คลิก LINE</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{stats.totalLineClicks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><MessageSquare className="w-6 h-6" /></div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        สถิติการใช้งานรายวัน (7 วันล่าสุด)
                    </h3>
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

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-green-500" />
                        สัดส่วนพฤติกรรมการคลิก
                    </h3>
                    <div className="h-64 relative flex items-center justify-center">
                        {stats.totalWebClicks === 0 && stats.totalPhoneClicks === 0 && stats.totalLineClicks === 0 ? (
                            <p className="text-sm text-gray-400 italic">ยังไม่มีข้อมูลการคลิก</p>
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

            {/* Recent Logs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-extrabold text-gray-800">ประวัติการเข้าใช้งานและจัดเก็บ Traffic ย้อนหลัง</h3>
                        <p className="text-xs text-gray-400 mt-0.5">บันทึกข้อมูลการดูหน้าและการเปลี่ยนเส้นทางเพื่อนำข้อมูลไปวิเคราะห์กลุ่มเป้าหมาย</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                <th className="py-4 px-6 w-56">วันเวลา (Time)</th>
                                <th className="py-4 px-6 w-36">ประเภท (Event)</th>
                                <th className="py-4 px-6">ศูนย์ดูแลที่เป็นเป้าหมาย (Care Center Target)</th>
                                <th className="py-4 px-6 w-52">แหล่งที่มา (UTM Source)</th>
                                <th className="py-4 px-6 w-44">ลิงก์ผู้แนะนำ (Referrer)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                            {trafficLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                                        ยังไม่มีข้อมูล Traffic จัดเก็บในระบบ
                                    </td>
                                </tr>
                            ) : (
                                trafficLogs.slice(0, 15).map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="py-3.5 px-6 font-medium text-gray-500 text-xs">
                                            {formatTime(log.timestamp)}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            {formatEventType(log.eventType)}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            {log.centerName ? (
                                                <div className="font-bold text-gray-850 flex items-center gap-1">
                                                    {log.centerName}
                                                    <span className="text-[10px] text-gray-400 font-normal">(ID: {log.centerId})</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-medium italic">หน้าหลัก (Homepage)</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            {log.utmSource ? (
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="bg-gray-150/60 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-bold border border-gray-200">
                                                        src: {log.utmSource}
                                                    </span>
                                                    {log.utmMedium && (
                                                        <span className="bg-gray-150/60 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-bold border border-gray-200">
                                                            med: {log.utmMedium}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 font-medium italic">direct / none</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6 max-w-xs truncate text-xs text-gray-400" title={log.referrer}>
                                            {log.referrer ? (
                                                <span className="flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                                    {log.referrer.replace(/https?:\/\//, '')}
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
                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center text-xs text-gray-400 font-semibold">
                        แสดง 15 รายการล่าสุดจากทั้งหมด {trafficLogs.length} รายการใน Google Sheets
                    </div>
                )}
            </div>
        </div>
    );
}