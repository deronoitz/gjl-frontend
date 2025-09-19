# 🗄️ Database Migrations

This directory contains all database migrations for the Griya Jannatin Leyangan Management System.

## 📁 Directory Structure

```
migrations/
├── README.md                    # This file
├── archive/                     # Archived/backup migration files
├── utilities/                   # Utility SQL scripts (not migrations)
├── seeds/                       # Seed data files
└── [timestamp]_[description].sql # Active migration files
```

## 🚀 Active Migrations (Chronological Order)

### Core System Setup
- `20250906120000_reset_and_custom_auth.sql` - Custom authentication system setup
- `20250906120001_fix_password_hashes.sql` - Password hash fixes
- `20250906120002_fix_rls_policies.sql` - Row Level Security policy fixes

### Feature Tables
- `20250906120003_create_announcements_table.sql` - Community announcements
- `20250906120004_fix_announcements_rls.sql` - Announcements RLS policies
- `20250906120005_create_app_settings.sql` - Application settings
- `20250906120006_fix_app_settings_rls.sql` - Settings RLS policies
- `20250906120007_create_albums_table.sql` - Photo gallery albums

### Payment System
- `20250906120008_create_payment_status_table.sql` - Payment status tracking
- `20250906171500_create_payment_records_table.sql` - Payment records (renamed from status)
- `20250907120000_create_financial_records_table.sql` - Financial transactions
- `20250907120001_add_status_payment_url_to_financial_records.sql` - Payment URL tracking
- `20250907120002_add_reference_id_to_financial_records.sql` - Reference ID for payments

### User Management & Organization
- `20250908000001_add_qris_fee_setting.sql` - QRIS payment fee configuration
- `20250908120000_add_phone_position_to_users.sql` - User phone and position fields
- `20250908120001_create_positions_table.sql` - Organizational positions
- `20250908120002_migrate_position_to_foreign_key.sql` - Position normalization
- `20250908120003_remove_position_column.sql` - Cleanup old position column

### Advanced Features
- `20250908120004_auto_expire_pending_payments.sql` - Payment expiration system
- `20250913000001_create_push_subscriptions.sql` - Push notification subscriptions

### Remote Schema
- `20250906171412_remote_schema.sql` - Supabase remote schema sync

## 🗂️ Utility Files

### `/utilities/`
- `setup-storage.sql` - Storage bucket configuration for payment proofs
- `check_payments.sql` - Payment data verification query
- `test_organizational_data.sql` - Test data for organizational structure

### `/seeds/`
- `seed_albums.sql` - Initial photo album data

### `/archive/`
- `old_*.sql.bak` - Archived migration files (backup copies)

## 🔄 Migration Workflow

### Running Migrations
```bash
# Run all pending migrations
supabase db reset

# Apply specific migration
supabase migration up --file [timestamp]_[description].sql
```

### Creating New Migrations
```bash
# Create new migration
supabase migration new [description]

# Example
supabase migration new add_user_preferences_table
```

## 📋 Migration Categories

### 🔐 **Authentication & Users**
- Custom auth system with house number login
- User sessions and role-based access
- User profile management

### 💰 **Payment System**
- Payment status tracking
- Financial records and transactions
- QRIS integration
- Payment expiration automation

### 🏢 **Organization Management**
- Organizational positions and hierarchy
- User-position relationships
- Community structure

### 📢 **Content Management**
- Announcements system
- Photo gallery albums
- Application settings

### 🔔 **Notifications**
- Push notification subscriptions
- Service worker integration

## 🚨 Important Notes

1. **Never modify existing migrations** - Always create new ones for changes
2. **Test migrations locally** before applying to production
3. **Backup database** before running major migrations
4. **Check dependencies** between migrations before reordering
5. **Archive old files** instead of deleting them

## 🛠️ Troubleshooting

### Common Issues
1. **Migration conflicts** - Check for duplicate table/column names
2. **RLS policy errors** - Verify user permissions and policy syntax
3. **Foreign key constraints** - Ensure referenced tables exist
4. **Type conflicts** - Check for enum type redefinitions

### Recovery
- Use archived migrations in `/archive/` folder if needed
- Check Supabase dashboard for migration status
- Review migration logs for detailed error messages

## 📚 Related Documentation

- [Authentication System](../../docs/authentication/AUTHENTICATION_COMPARISON.md)
- [Payment System](../../docs/payment/)
- [API Documentation](../../docs/api/)
- [Backend Setup](../../docs/api/BACKEND_README.md)
