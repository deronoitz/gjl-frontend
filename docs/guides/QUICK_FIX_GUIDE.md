# 🛠️ Quick Fix Guide

## Issue Resolved: `tsx` Command Not Found

**Problem:** The `tsx` command was not accessible directly in the terminal.

**Solution Applied:**
- Updated npm script to use `npx tsx` instead of `tsx`
- Created `hash-password.sh` script for easier password generation

### Now Working Commands:
```bash
# Generate password hash via npm script
npm run hash-password your_password

# Generate password hash via shell script  
./hash-password.sh your_password

# Direct command
npx tsx src/lib/password.ts your_password
```

## Database RLS Policy Fix Required

**Issue Detected:** Infinite recursion in RLS policies for the profiles table.

**Error Message:**
```
infinite recursion detected in policy for relation "profiles"
```

**Solution:** Apply the new migration file to fix the circular dependency.

### Steps to Fix Database:

1. **Apply the RLS fix migration:**
   ```sql
   -- Run this in Supabase SQL Editor
   -- File: supabase/migrations/20250906000003_fix_rls_policies.sql
   ```

2. **Or manually fix in Supabase Dashboard:**
   - Go to Authentication > RLS Policies
   - Drop the existing admin policies on profiles table
   - Apply the new policies from the migration file

### Quick Database Setup (Updated):

1. **Run initial schema:**
   ```sql
   -- Execute: supabase/migrations/20250906000001_initial_schema.sql
   ```

2. **Apply RLS fix:**
   ```sql
   -- Execute: supabase/migrations/20250906000003_fix_rls_policies.sql  
   ```

3. **Add seed data:**
   ```sql
   -- Execute: supabase/migrations/20250906000002_seed_data.sql
   ```

4. **Create admin user in Supabase Dashboard:**
   ```json
   {
     "email": "admin@gjl.local",
     "user_metadata": {
       "house_number": "A-01", 
       "role": "admin",
       "full_name": "Administrator",
       "password": "$2b$12$jV3ISTOMbwDE4YEhjoGy8uL23EAnf3SCAtbu9rgfc7s2seZZ4Gyh2"
     }
   }
   ```

### Test Login:
- **House Number:** A-01
- **Password:** admin123

## Next Steps:

1. ✅ Fix database RLS policies (apply migration)
2. ✅ Create admin user in Supabase
3. ✅ Test login functionality  
4. ✅ Verify user management features

The `tsx` command issue is now resolved! 🎉
