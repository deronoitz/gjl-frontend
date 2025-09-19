# 📋 Migration Execution Order

This file provides the correct chronological order for executing migrations in the Griya Jannatin Leyangan Management System.

## ✅ Active Migrations (Execute in Order)

```bash
# 1. Core System Setup (Sept 6, 2025 - 12:00 series)
20250906120000_reset_and_custom_auth.sql              # Custom auth foundation
20250906120001_fix_password_hashes.sql                # Password security fixes  
20250906120002_fix_rls_policies.sql                   # Row Level Security

# 2. Feature Tables (Sept 6, 2025 - 12:00 series continued)
20250906120003_create_announcements_table.sql         # Community announcements
20250906120004_fix_announcements_rls.sql              # Announcements security
20250906120005_create_app_settings.sql                # Application settings
20250906120006_fix_app_settings_rls.sql               # Settings security
20250906120007_create_albums_table.sql                # Photo gallery

# 3. Remote Schema Sync (Sept 6, 2025 - 17:14)
20250906171412_remote_schema.sql                      # Supabase remote sync

# 4. Payment System (Sept 6, 2025 - 17:15)
20250906171500_create_payment_records_table.sql       # Payment tracking

# 5. Financial System (Sept 7, 2025 - 12:00 series)
20250907120000_create_financial_records_table.sql     # Financial transactions
20250907120001_add_status_payment_url_to_financial_records.sql  # Payment URLs
20250907120002_add_reference_id_to_financial_records.sql        # Reference IDs

# 6. Settings & User Enhancements (Sept 8, 2025)
20250908000001_add_qris_fee_setting.sql               # QRIS fee configuration
20250908120000_add_phone_position_to_users.sql        # User profile fields
20250908120001_create_positions_table.sql             # Organizational positions
20250908120002_migrate_position_to_foreign_key.sql    # Position normalization
20250908120003_remove_position_column.sql             # Cleanup old fields

# 7. Advanced Features (Sept 8-13, 2025)
20250908120004_auto_expire_pending_payments.sql       # Payment expiration
20250913000001_create_push_subscriptions.sql          # Push notifications
```

## 🚫 Archived/Redundant Migrations

These files are in `archive/` and should NOT be executed:

```bash
# Old backup files (.bak)
old_20250906000001_initial_schema.sql.bak
old_20250906000002_seed_data.sql.bak  
old_20250906000003_fix_rls_policies.sql.bak
old_20250906000010_custom_auth_schema.sql.bak
old_20250906000011_custom_auth_seed_data.sql.bak

# Redundant migrations (replaced by newer versions)
redundant_create_payment_status_table.sql  # Replaced by payment_records
```

## 🔧 Utility Files (Manual Execution)

These are in `utilities/` and `seeds/` - execute manually as needed:

```bash
# Storage setup (run once after main migrations)
utilities/setup-storage.sql               # Payment proof storage bucket

# Seed data (optional)
seeds/seed_albums.sql                      # Initial photo albums

# Testing/verification queries (as needed)
utilities/check_payments.sql              # Verify payment data
utilities/test_organizational_data.sql     # Test org structure
```

## 🚀 Quick Setup Commands

### Full Reset & Migration
```bash
# Reset database and run all migrations
supabase db reset

# Or manually run migrations in order
supabase migration up
```

### Partial Setup (New Environment)
```bash
# Run specific migration
supabase migration up --file 20250906120000_reset_and_custom_auth.sql

# Run all pending migrations
supabase migration up
```

### Utilities Setup
```bash
# Setup storage (after main migrations)
supabase db sql --file supabase/migrations/utilities/setup-storage.sql

# Add seed data (optional)
supabase db sql --file supabase/migrations/seeds/seed_albums.sql
```

## ⚠️ Important Notes

1. **Never skip migrations** - Execute in exact chronological order
2. **Dependencies exist** - Later migrations depend on earlier ones
3. **Test locally first** - Always test migrations on local environment
4. **Backup before production** - Create database backup before production migrations
5. **Check status** - Use `supabase migration list` to check applied migrations

## 📚 Related Documentation

- [Migration README](migrations/README.md) - Detailed migration documentation
- [Archive README](../archive/README.md) - Information about archived files
- [Backend Setup](../docs/api/BACKEND_README.md) - Complete setup guide
