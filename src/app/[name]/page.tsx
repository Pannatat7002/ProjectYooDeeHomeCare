/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCareCenters } from '../../lib/db';
import CenterDetailClient from './CenterDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// กำหนดการ revalidate หน้าเว็บแบบ Incremental Static Regeneration (ISR) ทุกๆ 5 นาที
export const revalidate = 300; 

// สร้าง path สำหรับทุกศูนย์ดูแลที่มีสถานะ visible ตอน build time
export async function generateStaticParams() {
    try {
        const careCenters = await getCareCenters();
        return careCenters
            .filter((c: any) => c.status === 'visible')
            .map((c: any) => ({
                name: c.name.replace(/\s+/g, '-'),
            }));
    } catch (error) {
        console.error('Error generating static params for care centers:', error);
        return [];
    }
}

// 1. สร้าง Metadata สำหรับ SEO รายหน้าแบบ Dynamic
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).replace(/-/g, ' ');
    const careCenters = await getCareCenters();
    
    const targetName = decodedName.replace(/\s+/g, '');
    const center = careCenters.find((c: any) =>
        c.name.replace(/\s+/g, '') === targetName || c.name === decodedName
    );

    if (!center) {
        return {
            title: 'ไม่พบศูนย์ดูแล | ThaiCareCenter',
        };
    }

    const title = `${center.name} | รวมศูนย์ดูแลผู้สูงอายุ`;
    const description = `${center.name} - ${center.description || center.address || 'ค้นหารายละเอียด แพ็คเกจ ราคา สิ่งอำนวยความสะดวก และการเดินทางสู่ศูนย์ได้ที่นี่'}`;
    const mainImage = center.imageUrls?.[0] || '/ThaiCareCenter.png';

    return {
        title: title,
        description: description.slice(0, 160), // ย่อเนื้อหาให้อยู่ในกรอบ 160 ตัวอักษร
        openGraph: {
            title: title,
            description: description.slice(0, 160),
            images: [{ url: mainImage }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description.slice(0, 160),
            images: [mainImage],
        }
    };
}

// 2. Server Component หลัก
export default async function Page({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).replace(/-/g, ' ');
    
    // ดึงข้อมูลผ่าน Cache Layer บน Server
    const careCenters = await getCareCenters();
    
    const targetName = decodedName.replace(/\s+/g, '');
    const center = careCenters.find((c: any) =>
        c.name.replace(/\s+/g, '') === targetName || c.name === decodedName
    );

    // หากไม่พบข้อมูลศูนย์ดูแลใน Google Sheets ให้ส่งกลับหน้า 404 ของ Next.js ทันที
    if (!center) {
        notFound();
    }

    // ทำการ Normalize ข้อมูลตั้งต้นเพื่อป้องกันปัญหา Props เป็น Null / undefined ที่ Client
    const normalizedCenter = {
        ...center,
        services: Array.isArray(center.services) ? center.services : [],
        packages: Array.isArray(center.packages) ? center.packages : [],
        imageUrls: Array.isArray(center.imageUrls) ? center.imageUrls : [],
        roomTypes: Array.isArray(center.roomTypes) ? center.roomTypes : [],
    };

    // ดึงศูนย์ดูแลอื่นๆ ที่ไม่ใช่ตัวเองจำนวน 3 แห่งมาแสดงในกล่อง แนะนำเพิ่มเติม
    const relatedCenters = careCenters
        .filter((c: any) => c.id !== normalizedCenter.id && c.status === 'visible')
        .slice(0, 3);

    // 3. สร้าง Schema.org JSON-LD สำหรับให้ AI Search Engine (เช่น Perplexity, ChatGPT) อ่านข้อมูลโครงสร้าง
    const BASE_URL = 'https://thaicarecenter.com';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NursingHome',
        '@id': `${BASE_URL}/${encodeURIComponent(center.name.replace(/\s+/g, '-'))}`,
        name: center.name,
        description: center.description || 'ศูนย์ดูแลผู้สูงอายุและผู้ป่วยพักฟื้น',
        image: normalizedCenter.imageUrls,
        address: {
            '@type': 'PostalAddress',
            streetAddress: center.address || '',
            addressLocality: center.province || 'กรุงเทพมหานคร',
            addressCountry: 'TH'
        },
        telephone: center.phone || '',
        priceRange: center.price ? `฿${center.price}/month` : '',
        aggregateRating: center.rating ? {
            '@type': 'AggregateRating',
            ratingValue: center.rating,
            reviewCount: 1
        } : undefined,
        geo: center.lat && center.lng ? {
            '@type': 'GeoCoordinates',
            latitude: Number(center.lat),
            longitude: Number(center.lng)
        } : undefined
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CenterDetailClient 
                center={normalizedCenter} 
                relatedCenters={relatedCenters} 
            />
        </>
    );
}