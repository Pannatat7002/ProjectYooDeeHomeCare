import { toPng } from 'html-to-image';

export interface LeadSlipData {
    centerName: string;
    name: string;
    phone: string;
    location?: string;
    patientCondition: string;
    roomType: string;
    budget: string;
    timeframe: string;
    submittedAt?: string;
}

/**
 * แปลง DOM Element (HTML/Tailwind Card) ให้เป็นรูปภาพ PNG และสั่งดาวน์โหลดลงเครื่องทันที (แบบที่ 2)
 */
export async function downloadSlipFromDom(node: HTMLElement, filename?: string): Promise<boolean> {
    const defaultFilename = filename || 'ใบนัดหมาย-ข้อมูลประสานงาน.png';
    try {
        const dataUrl = await toPng(node, {
            pixelRatio: 2, // 2x Retina DPI เพื่อความคมชัดสูง
            backgroundColor: '#ffffff',
            cacheBust: true,
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Direct Download ทันที ไม่เปิดหน้าต่างแชร์
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
            URL.revokeObjectURL(blobUrl);
        }, 1200);

        return true;
    } catch (err) {
        console.error('html-to-image capture error:', err);
        throw err;
    }
}

/**
 * แปลง DOM Element ให้เป็นรูปภาพ PNG และเปิดหน้าต่างแชร์ของระบบ (Web Share API)
 */
export async function shareSlipFromDom(node: HTMLElement, filename?: string, title?: string): Promise<boolean> {
    const defaultFilename = filename || 'ใบนัดหมาย-ข้อมูลประสานงาน.png';
    const shareTitle = title || 'ใบนัดหมายและข้อมูลประสานงาน';
    try {
        const dataUrl = await toPng(node, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], defaultFilename, { type: 'image/png' });

        if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: 'ใบนัดหมายและข้อมูลประสานงานศูนย์ดูแล',
                    files: [file],
                });
                return true;
            } catch (e: any) {
                if (e.name === 'AbortError') return false; // user cancelled share
            }
        }

        // Fallback: ถ้าอุปกรณ์ไม่รองรับการแชร์ไฟล์ ให้ทำการดาวน์โหลดลงเครื่องแทน
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        }, 1200);
        return true;
    } catch (err) {
        console.error('shareSlipFromDom error:', err);
        throw err;
    }
}

/**
 * สร้างรูปภาพใบนัดหมาย/สลิปข้อมูลสรุปด้วย HTML5 Canvas ความละเอียดสูง (High-DPI)
 * ใช้งานได้ 100% บนทุกเบราว์เซอร์ ไม่ต้องพึ่ง Library ภายนอก
 */
export async function generateLeadSlipCanvas(data: LeadSlipData): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = data.location ? 1120 : 1060;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas 2d context');

    // 1. Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Border (Card style)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // 3. Header Gradient
    const headerGradient = ctx.createLinearGradient(0, 0, width, 220);
    headerGradient.addColorStop(0, '#1e3a8a'); // dark blue
    headerGradient.addColorStop(1, '#2563eb'); // royal blue
    ctx.fillStyle = headerGradient;
    ctx.fillRect(10, 10, width - 20, 220);

    // Header Content
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Brand Name
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText('THAI CARE CENTER', width / 2, 68);

    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillStyle = '#bfdbfe';
    ctx.fillText('ศูนย์ประสานงานดูแลผู้สูงอายุและผู้ป่วยพักฟื้น', width / 2, 98);

    // Badge: ใบนัดหมาย / ใบยืนยันข้อมูล
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, width / 2 - 200, 126, 400, 42, 21);
    ctx.fill();

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText('✓ ใบนัดหมายและข้อมูลประสานงาน', width / 2, 153);

    // Date & Ref
    const now = data.submittedAt ? new Date(data.submittedAt) : new Date();
    const dateFormatted = now.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText(`วันที่บันทึก: ${dateFormatted} น.`, width / 2, 202);

    // 4. Center Name Box
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, 40, 255, width - 80, 95, 16);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText('ศูนย์ดูแลที่ติดต่อ:', 60, 285);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    const centerDisplay = data.centerName.length > 34 ? data.centerName.substring(0, 32) + '...' : data.centerName;
    ctx.fillText(centerDisplay, 60, 323);

    // 5. Perforated Slip Divider Line
    drawDottedLine(ctx, 40, 375, width - 40, 375);

    // 6. Detail Rows
    let currentY = 425;
    const rowGap = 58;

    const details: Array<{ label: string; value: string; highlight?: boolean }> = [
        { label: 'ชื่อผู้ติดต่อ', value: data.name },
        { label: 'หมายเลขโทรศัพท์', value: formatPhone(data.phone), highlight: true },
        ...(data.location ? [{ label: 'ทำเล / ตำแหน่งที่ต้องการ', value: data.location }] : []),
        { label: 'อาการ / ภาวะผู้รับการดูแล', value: data.patientCondition },
        { label: 'ประเภทห้องพักที่สนใจ', value: data.roomType || 'ไม่ระบุ' },
        { label: 'งบประมาณต่อเดือน', value: data.budget || 'ไม่ระบุ' },
        { label: 'ระยะเวลาเข้าพัก / เยี่ยมชม', value: data.timeframe || 'ด่วนภายใน 7 วัน' },
    ];

    details.forEach((item, index) => {
        // Zebra row background
        if (index % 2 === 0) {
            ctx.fillStyle = '#f8fafc';
            roundRect(ctx, 40, currentY - 34, width - 80, 48, 10);
            ctx.fill();
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
        ctx.fillText(item.label, 58, currentY - 4);

        ctx.textAlign = 'right';
        ctx.fillStyle = item.highlight ? '#1d4ed8' : '#0f172a';
        ctx.font = item.highlight 
            ? 'bold 20px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif'
            : '600 18px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
        
        const val = item.value.length > 35 ? item.value.substring(0, 33) + '...' : item.value;
        ctx.fillText(val, width - 58, currentY - 4);

        currentY += rowGap;
    });

    // 7. Success Notice Box
    currentY += 15;
    ctx.fillStyle = '#f0fdf4';
    roundRect(ctx, 40, currentY, width - 80, 80, 14);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText('✓ บันทึกข้อมูลสำเร็จ เจ้าหน้าที่ศูนย์จะติดต่อกลับตามเบอร์โทรศัพท์ที่ระบุไว้', width / 2, currentY + 36);
    
    ctx.fillStyle = '#166534';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText('กรุณาบันทึกภาพนี้เก็บไว้เป็นหลักฐานการประสานงาน', width / 2, currentY + 62);

    // 8. Footer
    currentY += 115;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Kanit", "Prompt", sans-serif';
    ctx.fillText('บริการประสานงานศูนย์ดูแลผู้สูงอายุมาตรฐาน | www.thaicarecenter.com', width / 2, currentY);

    return canvas;
}

/**
 * ดาวน์โหลดใบนัดหมายลงเครื่อง หรือเรียก Web Share API บนมือถือ
 */
export async function downloadLeadSlipImage(data: LeadSlipData, filename?: string): Promise<boolean> {
    const canvas = await generateLeadSlipCanvas(data);
    const defaultFilename = filename || `ใบนัดหมาย-${data.centerName.replace(/[\/\\?%*:|"<>]/g, '-')}.png`;

    return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                resolve(false);
                return;
            }

            // Direct Download ทันที ไม่เปิดหน้าต่างแชร์
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultFilename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
                URL.revokeObjectURL(url);
            }, 1200);
            resolve(true);
        }, 'image/png');
    });
}

// Helper: วาดสี่เหลี่ยมมุมโค้ง
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Helper: เส้นประแบบสลิป
function drawDottedLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

// Helper: จัดรูปแบบเบอร์โทร 081-234-5678
function formatPhone(phone: string): string {
    const clean = phone.replace(/[^\d]/g, '');
    if (clean.length === 10) {
        return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    if (clean.length === 9) {
        return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
    }
    return phone;
}
