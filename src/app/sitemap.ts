/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from 'next';
import { getCareCenters, getBlogs } from '../lib/db';

const BASE_URL = 'https://thaicarecenter.com';

// ฟังก์ชันสร้าง sitemap.xml แบบ Dynamic เพื่อให้ Search Engine และ AI Search (เช่น Perplexity, Gemini, ChatGPT) 
// สามารถเข้ามาสแกนหาหน้าเว็บย่อยทั้งหมดในระบบได้อย่างถูกต้องครบถ้วน
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    
    // 1. Static Routes หลักของเว็บไซต์
    const staticRoutes = [
        '',
        '/about',
        '/services',
        '/contact',
        '/privacy',
        '/terms'
    ].map(route => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8
    }));

    try {
        // 2. ดึงรายชื่อศูนย์ดูแลผู้สูงอายุทั้งหมดมาสร้างหน้าย่อย
        const centers = await getCareCenters();
        const centerRoutes = centers
            .filter((center: any) => center.status === 'visible')
            .map((center: any) => ({
                url: `${BASE_URL}/${encodeURIComponent(center.name.replace(/\s+/g, '-'))}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9
            }));

        // 3. ดึงรายชื่อบทความทั้งหมดมาสร้างหน้าย่อย
        const blogs = await getBlogs();
        const blogRoutes = blogs
            .filter((blog: any) => {
                const val = blog.isPublished;
                return val === true || val === 'true' || val === 'TRUE' || val === 1 || val === '1';
            })
            .map((blog: any) => ({
                url: `${BASE_URL}/blogs/${blog.slug}`,
                lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.7
            }));

        return [...staticRoutes, ...centerRoutes, ...blogRoutes];
    } catch (error) {
        console.error('Error generating sitemap dynamically:', error);
        return staticRoutes;
    }
}
