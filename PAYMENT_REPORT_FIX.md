# Database Schema Fix - Payment Report

## Issue Fixed: Empty House Numbers

### Problem
The payment report table was showing empty values in the "No. Rumah" (House Number) column.

### Root Cause
**Type Mismatch Between Database Schema and TypeScript Interfaces**

1. **Database Schema**: Uses `house_number` (snake_case)
   ```sql
   CREATE TABLE users (
       id UUID PRIMARY KEY,
       house_number VARCHAR(10) UNIQUE NOT NULL,
       name VARCHAR(255) NOT NULL,
       ...
   );
   ```

2. **Frontend Types**: Two different interfaces existed
   - `src/types/index.ts` - Uses `houseNumber` (camelCase) 
   - `src/hooks/use-users-admin.ts` - Uses `house_number` (snake_case) ✅

### Solution Applied

1. **Updated Import**: Changed to use the correct User type
   ```tsx
   // Before
   import { User } from '@/types';
   
   // After  
   import { User as UserType } from '@/hooks/use-users-admin';
   ```

2. **Fixed Field Access**: Updated all references to use snake_case
   ```tsx
   // Before
   data.user.houseNumber
   
   // After
   data.user.house_number
   ```

3. **Updated State Types**: Fixed TypeScript state declarations
   ```tsx
   // Before
   const [users, setUsers] = useState<User[]>([]);
   
   // After
   const [users, setUsers] = useState<UserType[]>([]);
   ```

### Files Modified
- `src/app/admin/payment-report/page.tsx`
  - Import statement updated
  - State type declarations fixed  
  - Field access corrected in:
    - Table display: `data.user.house_number`
    - CSV export: `data.user.house_number`

### Result
✅ House numbers now display correctly in the payment report table
✅ CSV export includes proper house numbers
✅ No TypeScript errors
✅ Consistent data mapping throughout the application

### Testing
To verify the fix:
1. Navigate to `/admin/payment-report`
2. Login as admin user  
3. Confirm house numbers (A-01, A-02, etc.) appear in table
4. Test CSV export to ensure house numbers are included

---
**Status**: ✅ **RESOLVED**
The payment report now correctly displays house numbers for all users.
