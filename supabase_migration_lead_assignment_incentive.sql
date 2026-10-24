-- ==============================================================================
-- Migration: Add Lead Assignment & Care Advisor Incentive columns
-- Run this script in the Supabase SQL Editor
-- ==============================================================================

-- 1. คอลัมน์การมอบหมายเคส (Lead Assignment)
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT '';

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS assigned_to_name TEXT DEFAULT '';

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. คอลัมน์การปิดเคสและคำนวณ Incentive สำหรับ Care Advisor
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS closed_package_price NUMERIC DEFAULT 0;

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS center_commission_rate TEXT DEFAULT '';

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS center_commission_amount NUMERIC DEFAULT 0;

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS advisor_incentive_rate TEXT DEFAULT '';

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS advisor_incentive_amount NUMERIC DEFAULT 0;

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS closed_care_center_name TEXT DEFAULT '';

-- 3. คอลัมน์สถิติหรือเรต Incentive ประจำตัวในตาราง admins
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS default_incentive_rate NUMERIC DEFAULT 15.0;

-- Refresh PostgREST cache
COMMENT ON TABLE public.consultations IS 'Consultation with Care Advisor Assignment & Commission Incentive';
