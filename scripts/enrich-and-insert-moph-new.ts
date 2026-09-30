import fs from 'fs';
import path from 'path';

// 1. Load environment variables
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

function cleanSearchName(name: string): string {
    return name
        .replace(/การดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/ศูนย์ดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/สถานดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/กิจการการดูแลผู้สูงอายุ(หรือผู้มีภาวะพึ่งพิง)?/g, '')
        .replace(/จำกัด/g, '')
        .replace(/บริษัท/g, '')
        .replace(/ห้างหุ้นส่วนจำกัด/g, '')
        .trim();
}

function cleanPhone(raw: string): string {
    if (!raw) return '';
    const cleaned = raw.replace(/[^\d]/g, '');
    if (cleaned.length === 9 && !cleaned.startsWith('0')) return '0' + cleaned;
    if (cleaned.length >= 9) return cleaned;
    return raw.trim() === '—' || raw.trim() === '-' ? '' : raw.trim();
}

function provinceMatches(address: string, province: string): boolean {
    if (!address || !province) return false;
    if (address.includes(province)) return true;
    if (province === 'กรุงเทพมหานคร' && (address.includes('กรุงเทพ') || address.includes('กทม') || address.includes('Bangkok'))) {
        return true;
    }
    return false;
}

const BLACKLISTED_TYPES = new Set([
    'car_wash', 'car_repair', 'gas_station', 'restaurant', 'cafe',
    'bar', 'night_club', 'clothing_store', 'supermarket', 'auto_parts_store'
]);

function isPlaceRelevant(place: any, shopName: string, province: string): boolean {
    if (!provinceMatches(place.formatted_address, province)) {
        return false;
    }
    if (place.types && place.types.some((t: string) => BLACKLISTED_TYPES.has(t))) {
        return false;
    }

    const cleanS = cleanSearchName(shopName).toLowerCase().replace(/\s+/g, '');
    const cleanP = (place.name || '').toLowerCase().replace(/\s+/g, '');

    // Common tokens
    const commonCareTerms = ['แคร์', 'เนอร์สซิ่ง', 'เนอสซิ่ง', 'เนิร์สซิ่ง', 'สูงอายุ', 'ฟื้นฟู', 'โฮม', 'care', 'nursing', 'home', 'senior'];
    
    // Check if clean place name includes significant substring of shop name
    const shopTokens = cleanSearchName(shopName).split(/\s+/).filter(t => t.length >= 3);
    for (const tok of shopTokens) {
        if (cleanP.includes(tok.toLowerCase())) {
            return true;
        }
    }

    if (cleanS.length >= 4 && (cleanP.includes(cleanS) || cleanS.includes(cleanP))) {
        return true;
    }

    // If place name contains care terms and shop name contains care terms
    const placeHasCare = commonCareTerms.some(t => cleanP.includes(t));
    const shopHasCare = commonCareTerms.some(t => cleanS.includes(t));
    if (placeHasCare && shopHasCare) {
        // Also ensure at least 2 characters of prefix/stem match
        const prefix = cleanS.slice(0, 3);
        if (prefix && cleanP.includes(prefix)) {
            return true;
        }
    }

    return false;
}

// Cache province coordinates to minimize geocoding requests
const provinceCoordCache = new Map<string, { lat: number; lng: number }>();

async function getProvinceCoords(province: string, apiKey: string): Promise<{ lat: number; lng: number }> {
    if (provinceCoordCache.has(province)) {
        return provinceCoordCache.get(province)!;
    }

    try {
        const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(province + ', ประเทศไทย')}&key=${apiKey}&language=th`
        );
        const geoData = await geoRes.json();
        const loc = geoData.results?.[0]?.geometry?.location;
        if (loc && loc.lat && loc.lng) {
            provinceCoordCache.set(province, loc);
            return loc;
        }
    } catch (e) {
        console.warn(`Geocoding failed for ${province}:`, e);
    }

    // Default fallback (Bangkok center)
    const fallback = { lat: 13.7563, lng: 100.5018 };
    provinceCoordCache.set(province, fallback);
    return fallback;
}

async function main() {
    const { supabaseAdmin, BUCKET_NAME } = await import('../src/lib/supabase');
    const apiKey = process.env.CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Missing CONFIG_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');

    const jsonPath = path.resolve(process.cwd(), 'scripts', 'new-moph-centers.json');
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`File not found: ${jsonPath}`);
    }

    const newShops: any[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded ${newShops.length} new MOPH centers to enrich and insert.`);

    // 1. Get current max ID in DB
    const { data: maxRow, error: maxErr } = await supabaseAdmin
        .from('care_centers')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

    if (maxErr) throw maxErr;
    let nextId = (maxRow && maxRow[0]?.id ? Number(maxRow[0].id) : 0) + 1;
    console.log(`Starting insertion at ID: ${nextId}`);

    let insertedCount = 0;
    let enrichedWithGoogleCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < newShops.length; i++) {
        const shop = newShops[i];
        console.log(`\n[${i + 1}/${newShops.length}] Processing: "${shop.name}" (${shop.province})`);

        let address = '';
        let lat = 0;
        let lng = 0;
        let map_url = '';
        let website = '';
        let rating = 5;
        let phone = cleanPhone(shop.phone);
        const imageUrls: string[] = [];

        // Google Places search
        const query1 = `${cleanSearchName(shop.name)} ${shop.province}`;
        const query2 = `${shop.name} ${shop.province}`;

        let matchedPlace: any = null;

        // Try primary query
        try {
            let sRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query1)}&key=${apiKey}&language=th`);
            let sData = await sRes.json();
            if (sData.results && sData.results.length > 0) {
                for (const r of sData.results) {
                    if (isPlaceRelevant(r, shop.name, shop.province)) {
                        matchedPlace = r;
                        break;
                    }
                }
            }

            // Try secondary query if not found
            if (!matchedPlace && query1 !== query2) {
                sRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query2)}&key=${apiKey}&language=th`);
                sData = await sRes.json();
                if (sData.results && sData.results.length > 0) {
                    for (const r of sData.results) {
                        if (isPlaceRelevant(r, shop.name, shop.province)) {
                            matchedPlace = r;
                            break;
                        }
                    }
                }
            }
        } catch (err: any) {
            console.warn(`  Google Places search error:`, err.message);
        }

        if (matchedPlace) {
            enrichedWithGoogleCount++;
            console.log(`  ✓ Matched Google Place: "${matchedPlace.name}"`);

            // Fetch Place Details
            try {
                const detUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${matchedPlace.place_id}&fields=name,formatted_address,geometry,rating,url,website,photos,formatted_phone_number&key=${apiKey}&language=th`;
                const detRes = await fetch(detUrl);
                const detData = await detRes.json();
                const details = detData.result || {};

                address = details.formatted_address || matchedPlace.formatted_address || `${shop.province} ประเทศไทย`;
                lat = details.geometry?.location?.lat || matchedPlace.geometry?.location?.lat || 0;
                lng = details.geometry?.location?.lng || matchedPlace.geometry?.location?.lng || 0;
                map_url = details.url || `https://maps.google.com/?cid=${matchedPlace.place_id}`;
                website = details.website || '';
                rating = details.rating || matchedPlace.rating || 5;

                if (!phone && details.formatted_phone_number) {
                    phone = cleanPhone(details.formatted_phone_number);
                }

                // Download & Upload real place photos
                const photos = details.photos || matchedPlace.photos || [];
                const photoLimit = Math.min(photos.length, 3);
                for (let pIdx = 0; pIdx < photoLimit; pIdx++) {
                    const pRef = photos[pIdx].photo_reference;
                    const photoApiUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${pRef}&key=${apiKey}`;
                    try {
                        const imgRes = await fetch(photoApiUrl);
                        if (imgRes.ok) {
                            const buffer = Buffer.from(await imgRes.arrayBuffer());
                            const filename = `moph-${nextId}-${pIdx + 1}-${Date.now()}.jpg`;
                            const storagePath = `centers/${filename}`;
                            const { error: upErr } = await supabaseAdmin.storage
                                .from(BUCKET_NAME)
                                .upload(storagePath, buffer, {
                                    contentType: 'image/jpeg',
                                    cacheControl: '31536000'
                                });
                            if (!upErr) {
                                const { data: pData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
                                imageUrls.push(pData.publicUrl);
                            }
                        }
                    } catch (photoErr: any) {
                        console.warn(`    Photo upload warning:`, photoErr.message);
                    }
                }
            } catch (detErr: any) {
                console.warn(`  Place details warning:`, detErr.message);
            }
        } else {
            fallbackCount++;
            console.log(`  ℹ No Google Place match; using province geocode fallback.`);
            const coords = await getProvinceCoords(shop.province, apiKey);
            lat = coords.lat;
            lng = coords.lng;
            address = `${shop.province} ประเทศไทย`;
            map_url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + shop.province)}`;
        }

        // Clean natural Thai description WITHOUT phone numbers
        const cleanShopName = shop.name.trim();
        const description = `${cleanShopName} ศูนย์ดูแลผู้สูงอายุและผู้มีภาวะพึ่งพิง ได้รับการรับรองมาตรฐานจากกรมสนับสนุนบริการสุขภาพ (สบส.) กระทรวงสาธารณสุข ตั้งอยู่ในจังหวัด${shop.province.trim()} มุ่งเน้นการดูแลสุขภาพและฟื้นฟูสมรรถภาพอย่างใกล้ชิด โดยทีมงานและผู้บริบาลที่ผ่านการอบรม พร้อมสิ่งอำนวยความสะดวกที่ปลอดภัยและได้มาตรฐาน`;

        const newRecord = {
            id: nextId,
            name: cleanShopName,
            address: address,
            province: shop.province.trim(),
            lat: lat,
            lng: lng,
            price: 0,
            type: 'both',
            rating: rating,
            phone: phone,
            website: website,
            map_url: map_url,
            image_urls: imageUrls,
            description: description,
            services: ["การดูแลผู้สูงอายุ", "การดูแลผู้มีภาวะพึ่งพิง", "บริบาล 24 ชั่วโมง"],
            packages: [],
            room_types: [],
            has_government_certificate: true,
            brand_name: '',
            brand_logo_url: '',
            is_partner: false,
            status: 'visible',
            utm_source: 'moph_esta',
            utm_medium: 'banner',
            utm_campaign: 'certified_centers',
            created_at: new Date().toISOString()
        };

        const { error: insertErr } = await supabaseAdmin
            .from('care_centers')
            .insert([newRecord]);

        if (insertErr) {
            console.error(`❌ Failed to insert ID ${nextId} (${shop.name}):`, insertErr.message);
        } else {
            insertedCount++;
            console.log(`  ✅ Inserted ID ${nextId}: "${cleanShopName}" | Photos: ${imageUrls.length} | Status: visible | is_partner: false`);
            nextId++;
        }

        // Small delay to be polite to Google Places API rate limits
        await new Promise(r => setTimeout(r, 150));
    }

    console.log(`\n====================================================`);
    console.log(`🎉 Data Enrichment Pipeline Completed!`);
    console.log(`Total new centers processed: ${newShops.length}`);
    console.log(`Successfully inserted: ${insertedCount}`);
    console.log(`Enriched with Google Places: ${enrichedWithGoogleCount}`);
    console.log(`Province geocoded fallback: ${fallbackCount}`);
    console.log(`====================================================\n`);
}

main().catch(console.error);
