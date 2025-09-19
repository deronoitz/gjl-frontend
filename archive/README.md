# 🗄️ Archive Directory

This directory contains archived files that are no longer actively used but are preserved for reference and recovery purposes.

## 📁 Directory Structure

```
archive/
├── README.md                    # This file
├── src-backups/                 # Archived source code backup files
└── (migration archives are in supabase/migrations/archive/)
```

## 📂 Contents

### `/src-backups/`
Contains backup copies of source code files that were replaced during development:

- `auth-config.ts.bak` - Old authentication configuration (replaced by custom auth)
- `use-auth.ts.bak` - Old authentication hook (replaced by `use-custom-auth.ts`)
- `route.ts.bak` - Old user API route implementation

### Migration Archives
Migration backup files are stored in `supabase/migrations/archive/`:
- `old_20250906000001_initial_schema.sql.bak` - Original schema design
- `old_20250906000002_seed_data.sql.bak` - Original seed data
- `old_20250906000003_fix_rls_policies.sql.bak` - Old RLS policy fixes
- `old_20250906000010_custom_auth_schema.sql.bak` - Previous auth schema
- `old_20250906000011_custom_auth_seed_data.sql.bak` - Previous auth seed data

## 🚨 Important Notes

### ⚠️ **Do Not Delete These Files**
These files are kept for:
1. **Recovery purposes** - In case we need to revert changes
2. **Reference** - Understanding evolution of the codebase
3. **Debugging** - Comparing old vs new implementations
4. **Compliance** - Maintaining development history

### 🔍 **When to Use Archive Files**
- **Rollback scenarios** - If current implementation fails
- **Feature comparison** - Understanding what changed and why
- **Debugging issues** - Comparing working vs broken implementations
- **Code archaeology** - Understanding design decisions

### 🧹 **Archive Maintenance**
- Files older than 6 months can be considered for permanent deletion
- Always document why a file was archived
- Keep archives organized by date and purpose
- Review archives quarterly for cleanup opportunities

## 📚 Related Documentation

For current implementations, see:
- [Authentication System](../docs/authentication/AUTHENTICATION_COMPARISON.md)
- [Migration Documentation](../supabase/migrations/README.md)
- [API Documentation](../docs/api/)

## 🗓️ Archive Log

| Date | File | Reason | Replaced By |
|------|------|--------|-------------|
| 2025-09-15 | auth-config.ts.bak | Moved to custom auth | src/lib/custom-auth.ts |
| 2025-09-15 | use-auth.ts.bak | Replaced with custom hook | src/hooks/use-custom-auth.ts |
| 2025-09-15 | route.ts.bak | API restructure | Updated user routes |
| 2025-09-15 | Migration .bak files | Schema evolution | Current migration files |
