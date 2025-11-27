/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getBlogs, saveBlogs } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let blogs = await getBlogs();

    // Filter by published status if needed (e.g. ?published=true)
    const published = searchParams.get('published');
    if (published === 'true') {
        blogs = blogs.filter((b: any) => b.isPublished === true);
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

            blogs.push(newBlog);
            await saveBlogs(blogs);

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
