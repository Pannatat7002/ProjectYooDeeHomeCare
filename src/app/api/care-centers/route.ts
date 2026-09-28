import { NextRequest, NextResponse } from 'next/server';
import { getCareCenters, addCareCenter } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';
import { CareCenter } from '../../../types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let careCenters: CareCenter[] = await getCareCenters();

    const hasGovernmentCertificate = searchParams.get('hasGovernmentCertificate');
    if (hasGovernmentCertificate !== null) {
        careCenters = careCenters.filter((c: CareCenter) => c.hasGovernmentCertificate === (hasGovernmentCertificate === 'true'));
    }

    const brandName = searchParams.get('brandName');
    if (brandName) {
        careCenters = careCenters.filter((c: CareCenter) => c.brandName === brandName);
    }

    const type = searchParams.get('type');
    if (type && type !== 'all') {
        careCenters = careCenters.filter((c: CareCenter) => c.type === type || c.type === 'both');
    }

    const name = searchParams.get('name');
    if (name) {
        careCenters = careCenters.filter((c: CareCenter) => c.name === name);
    }

    const status = searchParams.get('status');
    if (status && status !== 'all') {
        careCenters = careCenters.filter((c: CareCenter) => c.status === status);
    }

    const province = searchParams.get('province');
    if (province && province !== 'all') {
        careCenters = careCenters.filter((c: CareCenter) => c.province === province);
    }

    const isPartner = searchParams.get('isPartner');
    if (isPartner !== null) {
        careCenters = careCenters.filter((c: CareCenter) => c.isPartner === (isPartner === 'true'));
    }

    const search = searchParams.get('search') || searchParams.get('q');
    if (search) {
        const lowerSearch = search.toLowerCase().trim();
        careCenters = careCenters.filter((c: CareCenter) =>
            (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
            (c.address && c.address.toLowerCase().includes(lowerSearch)) ||
            (c.province && c.province.toLowerCase().includes(lowerSearch)) ||
            (c.brandName && c.brandName.toLowerCase().includes(lowerSearch))
        );
    }

    const priceRange = searchParams.get('priceRange');
    if (priceRange && priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number);
        careCenters = careCenters.filter((c: CareCenter) => c.price !== undefined && c.price !== null && c.price >= min && c.price <= max);
    }

    // Distance sorting if requested
    const sortByDistance = searchParams.get('sortByDistance');
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    if (sortByDistance === 'true' && userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
        const deg2rad = (deg: number) => deg * (Math.PI / 180);
        const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371;
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        careCenters.sort((a: CareCenter, b: CareCenter) => {
            if (!a.lat || !a.lng) return 1;
            if (!b.lat || !b.lng) return -1;
            return getDist(userLat, userLng, a.lat, a.lng) - getDist(userLat, userLng, b.lat, b.lng);
        });
    }

    // Support progressive pagination
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    if (pageParam !== null || limitParam !== null) {
        const page = Math.max(1, parseInt(pageParam || '1', 10));
        const limit = Math.max(1, parseInt(limitParam || '12', 10));
        const total = careCenters.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedData = careCenters.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            data: paginatedData,
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages
        });
    }

    return NextResponse.json(careCenters);
}

export async function POST(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const body = await request.json();
            const careCenters: CareCenter[] = await getCareCenters();

            const nextCenterId = careCenters.length > 0
                ? Math.max(...careCenters.map((c: CareCenter) => c.id)) + 1
                : 1;

            const newCenter = {
                id: nextCenterId,
                ...body,
            };

            await addCareCenter(newCenter);

            return NextResponse.json({ success: true, data: newCenter }, { status: 201 });
        } catch (err) {
            console.error('Error creating care center:', err);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการสร้างศูนย์ดูแล' },
                { status: 500 }
            );
        }
    });
}
