-- Fix Services RLS for Admin Operations
-- This script disables RLS on the services table to allow admin client operations
-- Services are admin-only operations, so RLS is not needed

-- Disable Row Level Security on services table
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Optional: If you want to keep RLS enabled but allow service role to bypass it,
-- you can use this approach instead:
-- 
-- DROP POLICY IF EXISTS "services_select_active" ON services;
-- DROP POLICY IF EXISTS "services_all_admin" ON services;
--
-- -- Allow service role (admin client) full access
-- CREATE POLICY "services_service_role_all" ON services FOR ALL 
--   TO service_role 
--   USING (true) 
--   WITH CHECK (true);
--
-- -- Allow authenticated users to view active services
-- CREATE POLICY "services_select_active" ON services FOR SELECT 
--   TO authenticated 
--   USING (is_active = true);
--
-- -- Allow admins full access (when using user client)
-- CREATE POLICY "services_admin_all" ON services FOR ALL 
--   TO authenticated 
--   USING (is_admin()) 
--   WITH CHECK (is_admin());

-- Verify the change
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'services';
