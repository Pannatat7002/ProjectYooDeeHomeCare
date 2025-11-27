/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getBlogs, saveBlogs } from '../../../../lib/db';

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
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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
            return NextResponse.json(blogs[index]);
        } else {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { message: 'Error updating blog' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const blogId = parseInt(id);
    const blogs = await getBlogs();
    const index = blogs.findIndex((b: any) => b.id === blogId);

    if (index !== -1) {
        blogs.splice(index, 1);
        await saveBlogs(blogs);
        return new NextResponse(null, { status: 204 });
    } else {
        return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
}
