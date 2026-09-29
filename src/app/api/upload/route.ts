import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, BUCKET_NAME, isSupabaseConfigured } from '@/src/lib/supabase';
import { requireAuth } from '@/src/lib/middleware';

export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            if (!isSupabaseConfigured()) {
                return NextResponse.json(
                    { success: false, message: 'Supabase ยังไม่ได้ตั้งค่าใน .env.local (CONFIG_NEXT_PUBLIC_SUPABASE_URL, CONFIG_SUPABASE_SERVICE_ROLE_KEY)' },
                    { status: 500 }
                );
            }

            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            const folder = (formData.get('folder') as string) || 'uploads';

            if (!file) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' },
                    { status: 400 }
                );
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { success: false, message: 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF, SVG)' },
                    { status: 400 }
                );
            }

            // Check file size (e.g. 10MB limit)
            const MAX_SIZE = 10 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                return NextResponse.json(
                    { success: false, message: 'ขนาดไฟล์ต้องไม่เกิน 10MB' },
                    { status: 400 }
                );
            }

            // Format unique filename
            const timestamp = Date.now();
            const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${folder}/${timestamp}-${safeFileName}`;

            // Convert file to arrayBuffer / buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload to Supabase Storage with 1-year immutable cache control (unique timestamp filename)
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET_NAME)
                .upload(filePath, buffer, {
                    contentType: file.type,
                    cacheControl: '31536000, public, immutable',
                    upsert: false,
                });

            if (uploadError) {
                console.error('[Upload Error] Supabase storage upload failed:', uploadError);
                return NextResponse.json(
                    { success: false, message: `อัปโหลดรูปภาพล้มเหลว: ${uploadError.message}` },
                    { status: 500 }
                );
            }

            // Get public URL
            const { data: publicUrlData } = supabaseAdmin.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return NextResponse.json({
                success: true,
                url: publicUrlData.publicUrl,
                path: filePath,
            });

        } catch (error: any) {
            console.error('[Upload Error] Unexpected error during upload:', error);
            return NextResponse.json(
                { success: false, message: error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' },
                { status: 500 }
            );
        }
    });
}
