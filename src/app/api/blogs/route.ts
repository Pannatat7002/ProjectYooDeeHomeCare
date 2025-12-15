/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getBlogs, addBlog } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-\u0E00-\u0E7F]+/g, '')       // Keep word chars, -, and Thai chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let blogs = await getBlogs();

    // Debug logging
    console.log(`API /blogs accessed. Total blogs found: ${blogs.length}`);
    if (blogs.length > 0) {
        console.log('Sample blog isPublished value:', blogs[0].isPublished, 'Type:', typeof blogs[0].isPublished);
    }

    // Filter by published status if needed (e.g. ?published=true)
    const published = searchParams.get('published');

    if (published === 'true') {
        const initialCount = blogs.length;
        blogs = blogs.filter((b: any) => {
            const val = b.isPublished;
            // Check for various truthy representations
            const isValid = val === true || val === 'true' || val === 'TRUE' || val === 1 || val === '1';

            // Log if a blog is being filtered out (optional, for debugging mostly)
            if (!isValid) {
                console.log(`Blog ID ${b.id} filtered out. isPublished: ${val} (Type: ${typeof val})`);
            }
            return isValid;
        });
        console.log(`API /blogs filtered (published=true). Result count: ${blogs.length} (from ${initialCount})`);
    }

    // Sort by date desc
    blogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(blogs);
}

export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const body = await request.json();
            const blogs = await getBlogs();

            const nextId = blogs.length > 0
                ? Math.max(...blogs.map((b: any) => b.id)) + 1
                : 1;

            const slug = body.slug || slugify(body.title);

            // Ensure slug is unique
            let uniqueSlug = slug;
            let counter = 1;
            while (blogs.some((b: any) => b.slug === uniqueSlug)) {
                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }

            const newBlog = {
                id: nextId,
                ...body,
                slug: uniqueSlug,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await addBlog(newBlog);

            return NextResponse.json({ success: true, data: newBlog }, { status: 201 });
        } catch (err) {
            console.error('Error creating blog:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการสร้างบทความ' },
                { status: 500 }
            );
        }
    });
}
