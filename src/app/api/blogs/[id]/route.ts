/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getBlogs, saveBlogs } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const blogId = parseInt(id);
    const blogs = await getBlogs();
    const blog = blogs.find((b: any) => b.id === blogId);

    if (blog) {
        return NextResponse.json(blog);
    } else {
        return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const blogId = parseInt(id);
            const body = await request.json();
            const blogs = await getBlogs();
            const index = blogs.findIndex((b: any) => b.id === blogId);

            if (index !== -1) {
                blogs[index] = {
                    ...blogs[index],
                    ...body,
                    id: blogId, // Ensure ID doesn't change
                    updatedAt: new Date().toISOString(),
                };
                await saveBlogs(blogs);
                return NextResponse.json({ success: true, data: blogs[index] });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบบทความนี้' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error updating blog:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตบทความ' },
                { status: 500 }
            );
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return requireAuth(request, async () => {
        try {
            const { id } = await params;
            const blogId = parseInt(id);
            const blogs = await getBlogs();
            const index = blogs.findIndex((b: any) => b.id === blogId);

            if (index !== -1) {
                blogs.splice(index, 1);
                await saveBlogs(blogs);
                return NextResponse.json({ success: true, message: 'ลบบทความสำเร็จ' });
            } else {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบบทความนี้' },
                    { status: 404 }
                );
            }
        } catch (err) {
            console.error('Error deleting blog:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการลบบทความ' },
                { status: 500 }
            );
        }
    });
}
