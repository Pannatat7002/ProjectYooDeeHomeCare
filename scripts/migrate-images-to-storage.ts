import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

interface RoomTypeRecord {
    name?: string;
    imageUrls?: string[];
    status?: string;
    [key: string]: unknown;
}

interface CareCenterImageRow {
    id: number;
    name: string;
    brand_logo_url?: string | null;
    image_urls?: string[] | null;
    room_types?: RoomTypeRecord[] | null;
}

// 1. Load environment variables from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        });
    }
} catch (e) {
    console.warn('Could not read .env.local:', e);
}

// In-memory cache to avoid downloading/uploading identical URLs repeatedly
const uploadedUrlCache = new Map<string, string>();

/**
 * Normalizes Google Drive links to direct download / CDN links if applicable
 */
function normalizeImageUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';

    // Match Google Drive file ID
    const driveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
        // lh3.googleusercontent.com/d/ID directly serves the image file
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }

    return trimmed;
}

/**
 * Infers file extension and content-type
 */
function getExtensionAndMime(contentType: string | null, url: string): { ext: string; mime: string } {
    const ct = (contentType || '').toLowerCase();
    if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return { ext: 'jpg', mime: 'image/jpeg' };
    if (ct.includes('image/png')) return { ext: 'png', mime: 'image/png' };
    if (ct.includes('image/webp')) return { ext: 'webp', mime: 'image/webp' };
    if (ct.includes('image/gif')) return { ext: 'gif', mime: 'image/gif' };
    if (ct.includes('image/svg')) return { ext: 'svg', mime: 'image/svg+xml' };

    // Fallback: check file extension from URL
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.png')) return { ext: 'png', mime: 'image/png' };
    if (urlLower.includes('.webp')) return { ext: 'webp', mime: 'image/webp' };
    if (urlLower.includes('.gif')) return { ext: 'gif', mime: 'image/gif' };
    if (urlLower.includes('.svg')) return { ext: 'svg', mime: 'image/svg+xml' };

    // Default to jpg
    return { ext: 'jpg', mime: 'image/jpeg' };
}

/**
 * Downloads an image from external URL and uploads it to Supabase Storage
 */
async function uploadUrlToStorage(
    supabaseAdmin: SupabaseClient,
    bucketName: string,
    rawUrl: string,
    folder: string
): Promise<string> {
    const url = normalizeImageUrl(rawUrl);
    if (!url || !url.startsWith('http')) {
        return rawUrl;
    }

    // If it's already in Supabase Storage, return as-is
    if (url.includes('.supabase.co/storage/v1/object/public/') || url.includes(`/${bucketName}/`)) {
        return url;
    }

    // Check cache
    if (uploadedUrlCache.has(url)) {
        return uploadedUrlCache.get(url)!;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        clearTimeout(timeout);

        if (!response.ok) {
            console.warn(`      ⚠️ Download failed [${response.status}] for: ${url.slice(0, 80)}...`);
            return rawUrl; // Return original URL if download fails
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sanity check: must have at least 100 bytes to be an image
        if (buffer.length < 100) {
            console.warn(`      ⚠️ File too small (${buffer.length} bytes), skipping: ${url.slice(0, 80)}...`);
            return rawUrl;
        }

        const { ext, mime } = getExtensionAndMime(response.headers.get('content-type'), url);
        const uniqueId = crypto.randomUUID().slice(0, 8);
        const filename = `${Date.now()}-${uniqueId}.${ext}`;
        const filePath = `${folder}/${filename}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: mime,
                cacheControl: '31536000',
                upsert: false
            });

        if (uploadError) {
            console.error(`      ❌ Storage upload error (${filePath}):`, uploadError.message);
            return rawUrl;
        }

        // Get public URL
        const { data: publicData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        const newPublicUrl = publicData.publicUrl;
        uploadedUrlCache.set(url, newPublicUrl);
        return newPublicUrl;

    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`      ⚠️ Exception uploading ${url.slice(0, 80)}...: ${errorMsg}`);
        return rawUrl;
    }
}

/**
 * Helper to process an array of image URLs
 */
async function processImageUrlArray(
    supabaseAdmin: SupabaseClient,
    bucketName: string,
    urls: unknown[],
    folder: string
): Promise<{ updatedUrls: string[]; changed: boolean }> {
    if (!Array.isArray(urls)) return { updatedUrls: [], changed: false };

    let changed = false;
    const updatedUrls: string[] = [];

    for (const item of urls) {
        if (!item || typeof item !== 'string' || !item.trim()) continue;
        const original = item.trim();
        const newUrl = await uploadUrlToStorage(supabaseAdmin, bucketName, original, folder);
        if (newUrl !== original) {
            changed = true;
        }
        updatedUrls.push(newUrl);
    }

    return { updatedUrls, changed };
}

// Concurrency helper
async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let index = 0;

    const workers = new Array(limit).fill(0).map(async () => {
        while (index < items.length) {
            const currentIdx = index++;
            results[currentIdx] = await fn(items[currentIdx], currentIdx);
        }
    });

    await Promise.all(workers);
    return results;
}

async function main() {
    console.log('===========================================================');
    console.log('🖼️  MIGRATE EXTERNAL IMAGE URLS -> SUPABASE STORAGE');
    console.log('===========================================================');

    const { supabaseAdmin, BUCKET_NAME, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured. Check .env.local');
    }

    // Ensure storage bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b: { name: string }) => b.name === BUCKET_NAME);
    if (!bucketExists) {
        console.log(`📦 Creating Supabase storage bucket "${BUCKET_NAME}"...`);
        const { error: createBucketError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 10485760 // 10MB
        });
        if (createBucketError && !createBucketError.message.includes('already exists')) {
            console.error('Failed to create bucket:', createBucketError.message);
        } else {
            console.log(`✅ Bucket "${BUCKET_NAME}" is ready.`);
        }
    } else {
        console.log(`✅ Supabase storage bucket "${BUCKET_NAME}" found.`);
    }

    // -------------------------------------------------------------
    // 1. ADS (table: ads)
    // -------------------------------------------------------------
    console.log('\n--- 1. Processing Advertisements (ads) ---');
    const { data: ads, error: adsError } = await supabaseAdmin
        .from('ads')
        .select('id, image_url, title');

    if (adsError) {
        console.error('Error fetching ads:', adsError.message);
    } else if (ads && ads.length > 0) {
        console.log(`Found ${ads.length} ads. Checking image URLs...`);
        let updatedCount = 0;
        for (const ad of ads) {
            if (ad.image_url && !ad.image_url.includes(BUCKET_NAME)) {
                console.log(`   Uploading ad image [ID: ${ad.id}] "${ad.title || ''}"...`);
                const newUrl = await uploadUrlToStorage(supabaseAdmin, BUCKET_NAME, ad.image_url, 'ads');
                if (newUrl !== ad.image_url) {
                    await supabaseAdmin
                        .from('ads')
                        .update({ image_url: newUrl })
                        .eq('id', ad.id);
                    updatedCount++;
                    console.log(`   ✓ Updated ad ID ${ad.id} -> ${newUrl}`);
                }
            }
        }
        console.log(`✅ Ads processed: ${updatedCount} updated.`);
    } else {
        console.log('No ads found.');
    }

    // -------------------------------------------------------------
    // 2. BLOGS (table: blogs)
    // -------------------------------------------------------------
    console.log('\n--- 2. Processing Blogs (blogs) ---');
    const { data: blogs, error: blogsError } = await supabaseAdmin
        .from('blogs')
        .select('id, cover_image, title');

    if (blogsError) {
        console.error('Error fetching blogs:', blogsError.message);
    } else if (blogs && blogs.length > 0) {
        console.log(`Found ${blogs.length} blogs. Checking cover images...`);
        let updatedCount = 0;
        for (const blog of blogs) {
            if (blog.cover_image && !blog.cover_image.includes(BUCKET_NAME)) {
                console.log(`   Uploading blog cover [ID: ${blog.id}] "${blog.title || ''}"...`);
                const newUrl = await uploadUrlToStorage(supabaseAdmin, BUCKET_NAME, blog.cover_image, 'blogs');
                if (newUrl !== blog.cover_image) {
                    await supabaseAdmin
                        .from('blogs')
                        .update({ cover_image: newUrl })
                        .eq('id', blog.id);
                    updatedCount++;
                    console.log(`   ✓ Updated blog ID ${blog.id} -> ${newUrl}`);
                }
            }
        }
        console.log(`✅ Blogs processed: ${updatedCount} updated.`);
    } else {
        console.log('No blogs found.');
    }

    // -------------------------------------------------------------
    // 3. CARE CENTERS (table: care_centers)
    // -------------------------------------------------------------
    console.log('\n--- 3. Processing Care Centers (care_centers) ---');
    console.log('Fetching all care centers from Supabase...');
    let centers: CareCenterImageRow[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;
    while (true) {
        const { data, error: pageError } = await supabaseAdmin
            .from('care_centers')
            .select('id, name, brand_logo_url, image_urls, room_types')
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (pageError) {
            console.error('Error fetching care_centers page:', pageError.message);
            break;
        }
        if (!data || data.length === 0) break;
        centers = centers.concat(data as unknown as CareCenterImageRow[]);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    if (centers && centers.length > 0) {
        console.log(`Found ${centers.length} care centers. Scanning images for upload...`);

        let updatedCentersCount = 0;
        let totalUploadedImages = 0;

        // Process centers with concurrency of 3 to avoid throttling
        await mapConcurrent(centers, 3, async (center: CareCenterImageRow, idx: number) => {
            let rowChanged = false;
            let newLogoUrl = center.brand_logo_url;
            let newImageUrls = center.image_urls;
            let newRoomTypes = center.room_types;

            // A. Brand logo
            if (center.brand_logo_url && !center.brand_logo_url.includes(BUCKET_NAME)) {
                newLogoUrl = await uploadUrlToStorage(supabaseAdmin, BUCKET_NAME, center.brand_logo_url, 'centers/logos');
                if (newLogoUrl !== center.brand_logo_url) {
                    rowChanged = true;
                    totalUploadedImages++;
                }
            }

            // B. Center Photos (image_urls)
            if (Array.isArray(center.image_urls) && center.image_urls.length > 0) {
                const { updatedUrls, changed } = await processImageUrlArray(
                    supabaseAdmin,
                    BUCKET_NAME,
                    center.image_urls,
                    'centers/photos'
                );
                if (changed) {
                    newImageUrls = updatedUrls;
                    rowChanged = true;
                    totalUploadedImages += updatedUrls.filter((u, i) => u !== (center.image_urls as string[])[i]).length;
                }
            }

            // C. Room Types Photos
            if (Array.isArray(center.room_types) && center.room_types.length > 0) {
                let roomTypesChanged = false;
                const processedRoomTypes = await Promise.all(
                    center.room_types.map(async (rt) => {
                        if (Array.isArray(rt.imageUrls) && rt.imageUrls.length > 0) {
                            const { updatedUrls, changed } = await processImageUrlArray(
                                supabaseAdmin,
                                BUCKET_NAME,
                                rt.imageUrls,
                                'centers/rooms'
                            );
                            if (changed) {
                                roomTypesChanged = true;
                                totalUploadedImages += updatedUrls.filter((u, i) => u !== (rt.imageUrls as string[])[i]).length;
                                return { ...rt, imageUrls: updatedUrls };
                            }
                        }
                        return rt;
                    })
                );

                if (roomTypesChanged) {
                    newRoomTypes = processedRoomTypes;
                    rowChanged = true;
                }
            }

            // Update row if any image was migrated
            if (rowChanged) {
                const updatePayload: Record<string, unknown> = {};
                if (newLogoUrl !== center.brand_logo_url) updatePayload.brand_logo_url = newLogoUrl;
                if (newImageUrls !== center.image_urls) updatePayload.image_urls = newImageUrls;
                if (newRoomTypes !== center.room_types) updatePayload.room_types = newRoomTypes;

                const { error: updateError } = await supabaseAdmin
                    .from('care_centers')
                    .update(updatePayload)
                    .eq('id', center.id);

                if (updateError) {
                    console.error(`   ❌ Failed to update care_center [ID: ${center.id}]:`, updateError.message);
                } else {
                    updatedCentersCount++;
                }
            }

            if ((idx + 1) % 50 === 0 || idx + 1 === centers.length) {
                console.log(`   [Progress] ${idx + 1} / ${centers.length} centers processed. (${updatedCentersCount} centers updated, ${totalUploadedImages} images migrated)`);
            }
        });

        console.log(`\n✅ Care centers completed: ${updatedCentersCount} centers updated (${totalUploadedImages} images migrated into Supabase Storage).`);
    }

    console.log('\n===========================================================');
    console.log('🎉 IMAGE MIGRATION TO SUPABASE STORAGE FINISHED!');
    console.log(`   Total unique images cached/uploaded: ${uploadedUrlCache.size}`);
    console.log('===========================================================\n');
}

main().catch(err => {
    console.error('\n❌ Fatal Migration Error:', err);
    process.exit(1);
});
