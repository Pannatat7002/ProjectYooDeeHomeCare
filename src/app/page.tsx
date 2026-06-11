/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCareCenters, getAds, getBlogs } from '../lib/db';
import HomePageClient from './HomePageClient';

// กำหนดให้หน้าเว็บถูกทำ Incremental Static Regeneration (ISR) ทุกๆ 5 นาที
export const revalidate = 300; 

export default async function Page() {
    // 1. ดึงข้อมูลทั้งหมดบนฝั่ง Server แบบคู่ขนานผ่าน Promise.all
    const [allCenters, allAds, allBlogs] = await Promise.all([
        getCareCenters(),
        getAds(),
        getBlogs()
    ]);

    // 2. คัดกรองข้อมูลก่อนส่งให้ Client เพื่อลดขนาดของ JSON payload
    // กรองเอาเฉพาะศูนย์ที่มีสถานะพร้อมแสดงผล (visible)
    const centers = allCenters.filter((c: any) => c.status === 'visible');

    // กรองเอาเฉพาะบทความที่เผยแพร่แล้ว (isPublished)
    const blogs = allBlogs.filter((b: any) => {
        const val = b.isPublished;
        return val === true || val === 'true' || val === 'TRUE' || val === 1 || val === '1';
    });

    // 3. ส่งข้อมูลตั้งต้นผ่าน Props ไปให้ Client Component ทำงานต่อ
    return (
        <HomePageClient 
            initialCenters={centers} 
            initialAds={allAds} 
            initialBlogs={blogs} 
        />
    );
}