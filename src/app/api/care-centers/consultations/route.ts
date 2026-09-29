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
            recipientName, recipientAge, relationshipToRecipient
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
            name: name?.trim() || 'ผู้สนใจบริการ',
            contactName: name?.trim() || 'ผู้สนใจบริการ',
            phone: cleanPhone,
            lineId: lineId || '',
            email: email || '',
            recipientName: recipientName || '',
            recipientAge: recipientAge ? Number(recipientAge) : undefined,
            relationshipToRecipient: relationshipToRecipient || '',
            roomType: roomType || 'ยังไม่ระบุห้องพัก',
            branch: branch || 'ศูนย์ทั่วไป',
            budget: budget || 'ยังไม่ระบุ',
            convenientTime: convenientTime || 'ด่วนภายใน 7 วัน',
            message: message || '',
            status: 'verified',
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
