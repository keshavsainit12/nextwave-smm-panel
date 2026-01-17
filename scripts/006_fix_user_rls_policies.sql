-- Drop duplicate RLS policies
DROP POLICY IF EXISTS "users_insert_signup" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- Keep only the main policies and make INSERT more permissive
DROP POLICY IF EXISTS "Users can be created on signup" ON users;

-- Create new INSERT policy that allows both service_role and authenticated users
CREATE POLICY "Allow user signup and creation"
ON users FOR INSERT
TO public
WITH CHECK (
  -- Allow service_role (server actions)
  auth.jwt()->>'role' = 'service_role'
  OR
  -- Allow authenticated users to create their own profile
  auth.uid() = id
  OR
  -- Allow anonymous users during signup (will be authenticated after)
  auth.role() = 'anon'
);

-- Verify final policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY cmd, policyname;
