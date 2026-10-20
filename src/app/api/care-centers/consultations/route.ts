import { NextRequest, NextResponse } from 'next/server';
import { getConsultations, addConsultation } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return requireAuth(request, async () => {
        try {
            const consultations = await getConsultations();
            return NextResponse.json({
                success: true,
                count: consultations.length,
                data: consultations,
            });
        } catch (error) {
            console.error('Error fetching consultations:', error);
            return NextResponse.json(
                { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
                { status: 500 }
            );
        }
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, phone, roomType, branch, budget, convenientTime,
            lineId, email, message,
            recipientName, recipientAge, relationshipToRecipient,
            patientCondition, condition, location, userLocation
        } = body;

        // Validate required fields: phone is essential
        if (!phone || typeof phone !== 'string' || phone.trim().length < 9) {
            return NextResponse.json(
                { success: false, message: 'กรุณาระบุหมายเลขโทรศัพท์ให้ถูกต้อง' },
                { status: 400 }
            );
        }

        const cleanPhone = phone.trim().replace(/[^\d]/g, '');

        // Create new consultation object with intelligent defaults
        const newConsultation = {
            id: Date.now(),
            name: name?.trim() || body.contact_name?.trim() || 'ผู้สนใจบริการ',
            contactName: name?.trim() || body.contact_name?.trim() || 'ผู้สนใจบริการ',
            phone: cleanPhone,
            lineId: lineId || body.line_id || '',
            email: email || '',
            recipientName: recipientName || body.recipient_name || '',
            recipientAge: (recipientAge !== undefined && recipientAge !== null)
                ? Number(recipientAge)
                : ((body.recipient_age !== undefined && body.recipient_age !== null) ? Number(body.recipient_age) : undefined),
            relationshipToRecipient: relationshipToRecipient || body.relationship_to_recipient || '',
            roomType: roomType || body.room_type || 'ไม่ระบุ',
            location: location || userLocation || body.location || '',
            branch: branch || 'ศูนย์ทั่วไป',
            budget: budget || 'ยังไม่ระบุ',
            patientCondition: patientCondition || condition || body.patient_condition || '',
            convenientTime: convenientTime || body.convenient_time || 'ด่วนภายใน 7 วัน',
            message: message || '',
            utmSource: body.utmSource || body.utm_source || '',
            utmMedium: body.utmMedium || body.utm_medium || '',
            utmCampaign: body.utmCampaign || body.utm_campaign || '',
            status: body.status || 'verified',
            notes: body.notes || '',
            centerCallStatus: body.centerCallStatus || body.center_call_status || 'not_called',
            hasCommission: body.hasCommission !== undefined
                ? Boolean(body.hasCommission)
                : (body.has_commission !== undefined ? Boolean(body.has_commission) : false),
            commissionRate: body.commissionRate || body.commission_rate || '',
            hasSingleRoom: body.hasSingleRoom !== undefined
                ? Boolean(body.hasSingleRoom)
                : (body.has_single_room !== undefined ? Boolean(body.has_single_room) : false),
            hasSharedRoom: body.hasSharedRoom !== undefined
                ? Boolean(body.hasSharedRoom)
                : (body.has_shared_room !== undefined ? Boolean(body.has_shared_room) : false),
            customPrice: body.customPrice || body.custom_price || '',
            submittedAt: new Date().toISOString(),
        };

        // Use addConsultation instead of loading all and saving
        await addConsultation(newConsultation);

        console.log('✅ Consultation added successfully:', newConsultation.id);

        return NextResponse.json(
            {
                success: true,
                message: 'บันทึกข้อมูลการนัดหมายเรียบร้อยแล้ว',
                data: newConsultation,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Error processing consultation POST:', error);
        return NextResponse.json(
            { success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}
