-- ============================================
-- DISABLE RLS ON SERVICES TABLE
-- ============================================
-- This script disables Row Level Security on the services table
-- to allow admin operations to work without auth context issues.
--
-- Run this in Supabase SQL Editor or via psql:
-- psql $DATABASE_URL -f scripts/disable-services-rls.sql
--
-- WHY: The services table should be admin-only and doesn't need
-- RLS since we control access through the application layer.
-- ============================================

-- Drop all existing policies on services table
DROP POLICY IF EXISTS "services_all_admin" ON services;
DROP POLICY IF EXISTS "services_read_public" ON services;
DROP POLICY IF EXISTS "services_read_active" ON services;
DROP POLICY IF EXISTS "Allow admins full access" ON services;
DROP POLICY IF EXISTS "Allow users to read active services" ON services;

-- Disable RLS completely on services table
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'services';

-- Expected output: rowsecurity = false

COMMENT ON TABLE services IS 'Admin-only table with RLS disabled. Access controlled at application layer.';
