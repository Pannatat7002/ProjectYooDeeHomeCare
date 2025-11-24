import { NextRequest, NextResponse } from 'next/server';
import { appendProviderSignup } from '../../../lib/googleSheets';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        const requiredFields = ['centerName', 'ownerName', 'phone', 'email', 'lineId', 'address', 'province', 'district', 'subdistrict', 'postalCode'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Prepare data for Google Sheets
        const providerData = {
            timestamp: new Date().toISOString(),
            centerName: data.centerName,
            ownerName: data.ownerName,
            phone: data.phone,
            email: data.email,
            lineId: data.lineId,
            address: data.address,
            subdistrict: data.subdistrict,
            district: data.district,
            province: data.province,
            postalCode: data.postalCode,
            centerType: data.centerType || '',
            capacity: data.capacity || '',
            services: Array.isArray(data.services) ? data.services.join(', ') : '',
            description: data.description || '',
            status: 'pending', // pending, approved, rejected
        };

        // Save to Google Sheets
        await appendProviderSignup(providerData);

        return NextResponse.json(
            {
                message: 'Provider signup submitted successfully',
                data: providerData
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing provider signup:', error);
        return NextResponse.json(
            { error: 'Failed to process provider signup' },
            { status: 500 }
        );
    }
}
