/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getBlogs } from '../../../../lib/db';

/**
 * GET /api/blogs/featured
 * 
 * ดึงบทความแนะนำแบบ lightweight สำหรับหน้าแรก
 * ส่งเฉพาะ field ที่จำเป็น (ไม่ส่ง content ที่มี HTML ยาวๆ)
 * เพื่อลดขนาด JSON payload อย่างมาก
 * 
 * Query Params:
 *   - limit: จำนวนบทความที่ต้องการ (default: 5)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5', 10);

        const allBlogs = await getBlogs();

        // กรองเฉพาะ published
        const publishedBlogs = allBlogs.filter((b: any) => {
            const val = b.isPublished;
            return val === true || val === 'true' || val === 'TRUE' || val === 1 || val === '1';
        });

        // เรียงตามวันที่สร้าง (ใหม่สุดก่อน)
        publishedBlogs.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // แยก featured กับ non-featured
        const featured = publishedBlogs.filter((b: any) => b.isFeatured);
        const selected = featured.length > 0
            ? featured.slice(0, limit)
            : publishedBlogs.slice(0, limit);

        // ✅ ส่งเฉพาะ field ที่จำเป็นสำหรับแสดงใน Card — ไม่ส่ง content/body
        const lightweight = selected.map((b: any) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt || '',
            coverImage: b.coverImage || '',
            createdAt: b.createdAt,
            isFeatured: b.isFeatured || false,
        }));

        return NextResponse.json(lightweight);
    } catch (err) {
        console.error('Error fetching featured blogs:', err);
        return NextResponse.json([], { status: 500 });
    }
}
