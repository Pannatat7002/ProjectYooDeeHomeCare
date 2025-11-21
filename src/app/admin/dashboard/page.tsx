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
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Building2, Wallet, Star, Clock } from 'lucide-react';
import { CareCenter } from '@/src/types';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
    const [centers, setCenters] = useState<CareCenter[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        avgPrice: 0,
        avgRating: 0,
        typeRatio: '0/0/0'
    });

    useEffect(() => {
        fetch('http://localhost:3001/api/care-centers')
            .then(res => res.json())
            .then((data: CareCenter[]) => {
                setCenters(data);
                // Calculate Stats (Simplified for brevity)
                const total = data.length;
                const avgP = data.reduce((acc, c) => acc + c.price, 0) / total;
                const avgR = data.reduce((acc, c) => acc + c.rating, 0) / total;
                setStats({
                    total,
                    avgPrice: Math.round(avgP),
                    avgRating: avgR,
                    typeRatio: `${data.filter(c => c.type === 'daily').length}/${data.filter(c => c.type === 'monthly').length}`
                });
            });
    }, []);

    // เตรียมข้อมูลกราฟ (ตัวอย่าง Chart Data)
    const chartData = {
        labels: centers.slice(0, 5).map(c => c.name.substring(0, 10) + '...'),
        datasets: [{
            label: 'ราคา (บาท)',
            data: centers.slice(0, 5).map(c => c.price),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
        }]
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">ภาพรวมระบบ (Dashboard)</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                    <div><p className="text-gray-500 text-sm">ทั้งหมด</p><p className="text-3xl font-bold text-indigo-600">{stats.total}</p></div>
                    <div className="p-3 bg-indigo-100 rounded-full"><Building2 className="text-indigo-600" /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                    <div><p className="text-gray-500 text-sm">ราคาเฉลี่ย</p><p className="text-3xl font-bold text-green-600">฿{stats.avgPrice.toLocaleString()}</p></div>
                    <div className="p-3 bg-green-100 rounded-full"><Wallet className="text-green-600" /></div>
                </div>
                {/* ... เพิ่มการ์ดอื่นๆ ตามต้องการ ... */}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="font-semibold mb-4">ราคา 5 ศูนย์แรก</h3>
                    <Bar data={chartData} />
                </div>
                {/* เพิ่ม Doughnut Chart ตรงนี้ */}
            </div>
        </div>
    );
}