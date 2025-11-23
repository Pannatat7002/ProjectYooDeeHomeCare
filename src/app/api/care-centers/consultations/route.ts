import { NextResponse } from 'next/server';
import { getConsultations, saveConsultations } from '../../../../lib/db';

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
            lineId, email, message
        } = body;

        if (!name || !phone || !roomType || !branch || !budget || !convenientTime) {
            return NextResponse.json(
                { success: false, message: 'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบถ้วน' },
                { status: 400 }
            );
        }

        const consultations = await getConsultations();
        const newConsultation = {
            id: Date.now(),
            name,
            phone,
            lineId: lineId || '',
            email: email || '',
            roomType,
            branch,
            budget,
            convenientTime,
            message: message || '',
            status: 'pending',
            submittedAt: new Date().toISOString(),
        };

        consultations.push(newConsultation);
        await saveConsultations(consultations);

        return NextResponse.json(
            {
                success: true,
                message: 'บันทึกข้อมูลการนัดหมายเรียบร้อยแล้ว',
                data: newConsultation,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error processing consultation POST:', error);
        return NextResponse.json(
            { success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}
