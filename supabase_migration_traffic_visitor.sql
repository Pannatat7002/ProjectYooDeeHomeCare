-- ==============================================================================
-- Migration: เพิ่มคอลัมน์ visitor_id และ session_id สำหรับระบบ Anonymous Tracking (PDPA)
-- นำคำสั่งด้านล่างนี้ไปวางและกด Run ที่ Supabase SQL Editor ได้ทันทีครับ
-- ==============================================================================

ALTER TABLE public.traffic ADD COLUMN IF NOT EXISTS visitor_id TEXT DEFAULT '';
ALTER TABLE public.traffic ADD COLUMN IF NOT EXISTS session_id TEXT DEFAULT '';

-- สร้าง Index เพื่อให้การค้นหาและนับ Unique Visitors ในหน้า Admin ทำงานได้รวดเร็ว
CREATE INDEX IF NOT EXISTS idx_traffic_visitor_id ON public.traffic (visitor_id);
CREATE INDEX IF NOT EXISTS idx_traffic_session_id ON public.traffic (session_id);
