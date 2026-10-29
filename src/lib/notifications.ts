/**
 * Notification dispatcher for incoming ThaiCareCenter consultation cases and inquiries.
 * Supports:
 * - LINE Notify (if LINE_NOTIFY_TOKEN is provided)
 * - Telegram Bot (if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are provided)
 * - Custom Webhook / Discord / Slack (if ADMIN_WEBHOOK_URL is provided)
 */

interface ConsultationNotificationPayload {
    id: number | string;
    name: string;
    phone: string;
    branch?: string;
    patientCondition?: string;
    roomType?: string;
    location?: string;
    budget?: string;
    convenientTime?: string;
    message?: string;
    submittedAt?: string;
}

export async function notifyNewConsultation(lead: ConsultationNotificationPayload): Promise<void> {
    const promises: Promise<any>[] = [];

    const leadSummary = [
        `🚨 [ThaiCareCenter] มีเคสด่วนใหม่เข้ามาในระบบ!`,
        `👤 ชื่อลูกค้า: ${lead.name || 'ไม่ระบุ'}`,
        `📞 เบอร์โทรศัพท์: ${lead.phone}`,
        `🏥 ศูนย์ที่สนใจ: ${lead.branch || 'ศูนย์ทั่วไป'}`,
        lead.patientCondition ? `🩺 อาการผู้สูงอายุ: ${lead.patientCondition}` : null,
        lead.roomType && lead.roomType !== 'ไม่ระบุ' ? `🛏️ ประเภทห้อง: ${lead.roomType}` : null,
        lead.location ? `📍 พิกัด/ทำเล: ${lead.location}` : null,
        lead.budget && lead.budget !== 'ยังไม่ระบุ' ? `💰 งบประมาณ: ${lead.budget} บ./ด.` : null,
        lead.convenientTime ? `⏱️ ความสะดวก: ${lead.convenientTime}` : null,
        lead.message ? `💬 หมายเหตุ: ${lead.message}` : null,
        `🕒 เวลาแจ้ง: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
        `🔗 ตรวจสอบเคส: https://thaicarecenter.com/admin/manage?tab=consultation`
    ].filter(Boolean).join('\n');

    console.log(`[Notification Engine] 🚨 New Consultation Alert:\n${leadSummary}`);

    // 1. LINE Notify (if configured)
    const lineToken = process.env.LINE_NOTIFY_TOKEN;
    if (lineToken) {
        promises.push(
            fetch('https://notify-api.line.me/api/notify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${lineToken}`,
                },
                body: new URLSearchParams({ message: `\n${leadSummary}` }).toString(),
            }).then(async (res) => {
                if (!res.ok) console.warn('[LINE Notify Error]', await res.text());
                else console.log('✅ [LINE Notify] Case alert sent successfully');
            }).catch((err) => console.error('[LINE Notify Exception]', err))
        );
    }

    // 2. Telegram Bot (if configured)
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChatId) {
        promises.push(
            fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: tgChatId,
                    text: leadSummary,
                }),
            }).then(async (res) => {
                if (!res.ok) console.warn('[Telegram Error]', await res.text());
                else console.log('✅ [Telegram] Case alert sent successfully');
            }).catch((err) => console.error('[Telegram Exception]', err))
        );
    }

    // 3. Generic Webhook (Discord / Slack / Internal Endpoint)
    const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
    if (webhookUrl) {
        promises.push(
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: leadSummary,
                    text: leadSummary,
                    event: 'new_consultation_lead',
                    data: lead,
                }),
            }).then(async (res) => {
                if (!res.ok) console.warn('[Webhook Error]', await res.text());
                else console.log('✅ [Webhook] Case alert sent successfully');
            }).catch((err) => console.error('[Webhook Exception]', err))
        );
    }

    // Await all background notifications non-blockingly
    try {
        await Promise.allSettled(promises);
    } catch (e) {
        console.error('[Notification Engine Exception]', e);
    }
}
