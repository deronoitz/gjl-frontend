#!/bin/bash

# Database Migration Runner Script
# This script helps you run migrations using different methods

echo "🚀 Database Migration Guide"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found! Please create it first."
    echo ""
    echo "Required environment variables:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is installed"
    echo ""
    
    echo "📋 METHOD 1: Using Supabase CLI (Recommended)"
    echo "=============================================="
    echo ""
    echo "Step 1: Initialize Supabase project (if not done yet):"
    echo "  supabase init"
    echo ""
    echo "Step 2: Link to your Supabase project:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo "  (Get PROJECT_REF from your Supabase dashboard URL)"
    echo ""
    echo "Step 3: Apply migrations:"
    echo "  supabase db push"
    echo ""
    echo "Or run all steps automatically:"
    echo "  ./run-migrations-cli.sh YOUR_PROJECT_REF"
    echo ""
else
    echo "❌ Supabase CLI not found"
    echo ""
    echo "Install it first:"
    echo "  brew install supabase/tap/supabase"
    echo ""
fi

echo "📋 METHOD 2: Manual Execution via Supabase Dashboard"
echo "=================================================="
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to: SQL Editor"
echo "3. Execute these files in order:"
echo ""
echo "   a) Custom Auth Schema:"
echo "      📄 supabase/migrations/20250906000010_custom_auth_schema.sql"
echo ""
echo "   b) Seed Data:"
echo "      📄 supabase/migrations/20250906000011_custom_auth_seed_data.sql"
echo ""
echo "4. Copy and paste each file's content into SQL Editor"
echo "5. Click 'Run' for each migration"
echo ""

echo "📋 METHOD 3: Using psql (Advanced)"
echo "================================="
echo ""
echo "If you have PostgreSQL client installed:"
echo ""
echo "1. Get your database URL from Supabase Dashboard"
echo "2. Run migrations:"
echo "   psql 'your_database_url' -f supabase/migrations/20250906000010_custom_auth_schema.sql"
echo "   psql 'your_database_url' -f supabase/migrations/20250906000011_custom_auth_seed_data.sql"
echo ""

echo "🎯 AFTER MIGRATION SUCCESS:"
echo "=========================="
echo ""
echo "Demo users will be available:"
echo "  👤 House: A-01, Password: demo123 (Admin)"
echo "  👤 House: A-02, Password: demo123 (User)"  
echo "  👤 House: B-01, Password: demo123 (User)"
echo "  👤 House: B-02, Password: demo123 (User)"
echo "  👤 House: C-01, Password: demo123 (User)"
echo ""
echo "Test your setup:"
echo "  npm run dev"
echo "  → Open http://localhost:3000/login"
echo "  → Login with A-01 / demo123"
echo ""

echo "Happy migrating! 🎉"
