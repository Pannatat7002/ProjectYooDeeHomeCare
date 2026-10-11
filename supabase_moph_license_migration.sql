-- ==============================================================================
-- YooDeeHomeCare: MOPH ESTA License & Anti-Duplication Migration
-- สำหรับเพิ่มฟิลด์เลขลำดับและวันที่อนุญาต สบส. เพื่อป้องกันศูนย์ซ้ำซ้อนในระบบ
-- ==============================================================================
-- วิธีใช้งาน:
-- 1. เข้าสู่ Supabase Dashboard (https://supabase.com/dashboard)
-- 2. ไปที่โปรเจกต์ของคุณ -> เมนู "SQL Editor" ด้านซ้าย
-- 3. วางโค้ด SQL ด้านล่างนี้ทั้งหมดแล้วกดปุ่ม "Run"
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ในตาราง care_centers
ALTER TABLE public.care_centers 
ADD COLUMN IF NOT EXISTS moph_order INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS license_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS moph_approved_date TEXT DEFAULT '';

-- 2. สร้าง Indexes สำหรับค้นหาและตรวจสอบความซ้ำซ้อนอย่างรวดเร็ว
CREATE INDEX IF NOT EXISTS idx_care_centers_moph_order ON public.care_centers (moph_order);
CREATE INDEX IF NOT EXISTS idx_care_centers_license_number ON public.care_centers (license_number);

-- 3. หมายเหตุ: moph_order คือลำดับที่ทางการจากระบบ สบ.ส (esta.hss.moph.go.th/check-shops.php)
-- เช่น #1, #2, #1080 ซึ่งไม่ซ้ำกันในระบบราชการ
