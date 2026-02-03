-- Set Admin Role for User
-- Run this script in Supabase SQL Editor to grant admin access

-- Option 1: Set admin role by email
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Option 2: Set admin role by user ID
-- Replace 'your-user-id-here' with your actual user ID
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- Option 3: Set the first user as admin
-- Uncomment this if you want to make the first registered user an admin
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Verify the change
SELECT id, email, role, created_at 
FROM users 
WHERE role = 'admin';

-- Check all users and their roles
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at ASC;
