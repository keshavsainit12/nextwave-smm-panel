# Admin Panel Credentials

## Default Login Credentials

After running the database migrations, use these credentials to access the admin panel:

```
URL: /admin-login
Username: admin202502
Password: admin@123
```

## Important Security Notes

⚠️ **CHANGE THESE CREDENTIALS IMMEDIATELY AFTER FIRST LOGIN**

1. Login with the default credentials above
2. Navigate to **Settings > Account**
3. Change your username and password
4. Keep your new credentials secure

## Changing Credentials

### Change Password:
1. Go to Admin Panel > Settings > Account
2. Enter your current password
3. Enter your new password (minimum 6 characters)
4. Confirm your new password
5. Click "Change Password"

### Change Username:
1. Go to Admin Panel > Settings > Account  
2. Enter your new username (minimum 3 characters)
3. Click "Change Username"
4. Use your new username on next login

## Database Schema

Admin credentials are stored in the `admin_credentials` table:
- `username` - Login username (unique)
- `password_hash` - Bcrypt hashed password
- `email` - Admin email address
- `user_id` - Fixed admin user ID

## Password Hash Details

The default password "admin@123" is hashed using bcrypt with 10 rounds:
```
$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK
```

## Troubleshooting

### "Invalid Credentials" Error:

1. **Check Migration Status**: Ensure `009_create_admin_credentials.sql` has been executed in your Supabase database
2. **Verify Username**: Username is case-sensitive - use exactly `admin202502`
3. **Verify Password**: Password is `admin@123` (not `admin123` or `admin@1234`)
4. **Check Database**: Query the `admin_credentials` table to verify the record exists:
   ```sql
   SELECT username, email FROM admin_credentials;
   ```

### Reset Admin Password:

If you forget your password, run this SQL in Supabase:
```sql
-- Reset to default password (admin@123)
UPDATE admin_credentials 
SET password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
    updated_at = NOW()
WHERE username = 'admin202502';
```

## Migration Instructions

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the migration script: `/scripts/009_create_admin_credentials.sql`
4. Verify the table was created:
   ```sql
   SELECT * FROM admin_credentials;
   ```
5. You should see one row with username `admin202502`

## Support

If you continue to have login issues:
1. Verify the migration script executed successfully
2. Check Supabase logs for errors
3. Ensure your environment variables are configured correctly
4. Check that the admin panel layout is loading (admin_session cookie check)
