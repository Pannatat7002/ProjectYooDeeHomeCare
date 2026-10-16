-- ==============================================================================
-- Migration: Add CRM & Care Advisor columns to public.consultations table
-- Run this script in the Supabase SQL Editor to support ThaiCareAdmin & CRM fields
-- ==============================================================================

-- 1. บันทึกช่วยจำเคส / Care Advisor Note
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 2. สถานะโทรคุยกับศูนย์ (not_called, no_answer, contacted, appointment, accepted, rejected)
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS center_call_status TEXT DEFAULT 'not_called';

-- 3. มีค่าแนะนำศูนย์หรือไม่ (true / false)
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS has_commission BOOLEAN DEFAULT false;

-- 4. อัตราค่าแนะนำ (เช่น '10%', '3,000 บาท')
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS commission_rate TEXT DEFAULT '';

-- 5. ศูนย์มีห้องเดี่ยวว่างหรือไม่
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS has_single_room BOOLEAN DEFAULT false;

-- 6. ศูนย์มีห้องรวมว่างหรือไม่
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS has_shared_room BOOLEAN DEFAULT false;

-- 7. ราคาพิเศษที่ศูนย์แจ้ง (เช่น '18,000 - 20,000 บาท/เดือน')
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS custom_price TEXT DEFAULT '';

-- 8. ตรวจสอบคอลัมน์ผู้สูงอายุว่ามีครบถ้วน
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS recipient_name TEXT DEFAULT '';

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS recipient_age NUMERIC DEFAULT 0;

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS relationship_to_recipient TEXT DEFAULT '';

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS convenient_time TEXT DEFAULT '';

-- Refresh Schema Cache Notification (Supabase PostgREST will reload automatically)
COMMENT ON TABLE public.consultations IS 'Consultation and Lead Case Management for ThaiCareCenter';
