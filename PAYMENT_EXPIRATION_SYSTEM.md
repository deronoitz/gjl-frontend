# Payment Expiration System

## Overview
The payment gateway now includes automatic expiration of pending payments after 1 day. This system helps maintain data consistency and prevents indefinitely pending payments.

## Key Features

### 1. Expired Date in Payment Requests
- All payment requests now include an `expired_date` field
- Format: `YYYY-MM-DD HH:MM` (e.g., "2022-12-30 15:50")
- Set to exactly 1 day from the time of payment creation

### 2. Database Function for Auto-Expiration
- **Function**: `expire_old_pending_payments()`
- **Purpose**: Updates pending payments older than 1 day to 'expired' status
- **Returns**: Number of records updated
- **Location**: `supabase/migrations/20250908120004_auto_expire_pending_payments.sql`

### 3. Automatic Expiration Triggers
The system checks for expired payments in several ways:

#### A. Financial Records API
- Automatically runs expiration check when querying financial records
- Ensures expired payments are updated before displaying data

#### B. Manual API Endpoint
- **Endpoint**: `/api/expire-payments`
- **Methods**: 
  - `POST`: Expire old payments (admin only)
  - `GET`: Check for old pending payments without expiring them (admin only)

### 4. Database Schema
```sql
-- financial_records table includes:
status TEXT CHECK (status IN ('pending', 'done', 'expired'))
```

## Usage Examples

### 1. Creating a Payment
```typescript
// The payment gateway automatically adds expired_date
const paymentRequest = {
  title: "A1 Januari-Februari",
  type: 'single',
  step: 'checkout_seamless',
  reference_id: "GJL-A1-1725788400000",
  sender_name: "John Doe",
  sender_email: "A1@gjl.com",
  expired_date: "2025-09-09 15:50", // 1 day from now
  item_details: [...]
};
```

### 2. Manual Expiration (Admin)
```bash
# Check old pending payments
GET /api/expire-payments

# Expire old payments
POST /api/expire-payments
```

### 3. Database Function Call
```sql
-- Returns number of expired records
SELECT expire_old_pending_payments();
```

## Implementation Notes

1. **Time Calculation**: Uses local server time + 1 day
2. **Format**: ISO string converted to "YYYY-MM-DD HH:MM" format
3. **Automatic Checks**: Run when financial records are queried
4. **Admin Access**: Manual expiration endpoints require admin privileges
5. **Error Handling**: Expiration failures are logged but don't break main functionality

## Migration Files
- `20250908120004_auto_expire_pending_payments.sql`: Database function for expiration logic

## API Files Modified
- `src/app/api/payment-gateway/route.ts`: Added expired_date to payment requests
- `src/app/api/financial-records/route.ts`: Added automatic expiration check
- `src/app/api/expire-payments/route.ts`: New endpoint for manual expiration management
