import { NextResponse } from 'next/server';
import { getConsultations, addConsultation } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const consultations = await getConsultations();
    return NextResponse.json({
        success: true,
        count: consultations.length,
        data: consultations,
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

        // Validate required fields
        if (!name || !phone || !roomType || !branch || !budget || !convenientTime) {
            return NextResponse.json(
                { success: false, message: 'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบถ้วน' },
                { status: 400 }
            );
        }

        // Create new consultation object
        const newConsultation = {
            id: Date.now(),
            name,
            contactName: name, // Map name to contactName for backward compatibility
            phone,
            lineId: lineId || '',
            email: email || '',
            recipientName: recipientName || '',
            recipientAge: recipientAge ? Number(recipientAge) : undefined,
            relationshipToRecipient: relationshipToRecipient || '',
            roomType,
            branch,
            budget,
            convenientTime,
            message: message || '',
            status: 'pending',
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
