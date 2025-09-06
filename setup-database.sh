#!/bin/bash

# Custom Authentication Database Setup Script
# This script helps you set up the database structure with custom authentication

echo "=== Custom Authentication Database Setup ==="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local and add your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    echo ""
    echo "Note: No NextAuth configuration needed for custom auth!"
    echo ""
    exit 1
fi

echo "✅ Found .env.local file"
echo ""

echo "📋 Database migration files available:"
echo "  1. supabase/migrations/20250906000010_custom_auth_schema.sql - Creates custom auth tables"
echo "  2. supabase/migrations/20250906000011_custom_auth_seed_data.sql - Adds demo users and data"
echo ""

echo "🔧 To apply these migrations to your Supabase project:"
echo ""
echo "Option 1: Using Supabase CLI (Recommended)"
echo "  1. Install Supabase CLI: npm install -g supabase"
echo "  2. Initialize project: supabase init"
echo "  3. Link to your project: supabase link --project-ref YOUR_PROJECT_REF"
echo "  4. Apply migrations: supabase db push"
echo ""
echo "Option 2: Manual execution"
echo "  1. Go to your Supabase Dashboard"
echo "  2. Navigate to SQL Editor"
echo "  3. Copy and paste the content of each migration file"
echo "  4. Execute them in order"
echo ""

echo "🎉 Demo Users (Password: demo123):"
echo "  • A-01 (Admin) - Administrator"
echo "  • A-02 (User) - John Doe"
echo "  • B-01 (User) - Jane Smith"
echo "  • B-02 (User) - Bob Wilson"
echo "  • C-01 (User) - Alice Brown"
echo ""

echo "🔑 Custom Authentication Benefits:"
echo "  ✅ House number + password login (no email required)"
echo "  ✅ Simple session management with secure cookies"
echo "  ✅ Role-based access control (admin/user)"
echo "  ✅ No external dependencies (NextAuth not needed)"
echo "  ✅ Full control over authentication flow"
echo ""

echo "🚀 Once setup is complete:"
echo "  1. Run the development server: npm run dev"
echo "  2. Login with demo credentials (House: A-01, Password: demo123)"
echo "  3. Create additional users through the admin panel"
echo "  4. Test the authentication system"
echo ""

echo "💡 To generate password hashes for new users:"
echo "  ./hash-password.sh your_password"
echo ""

echo "Happy coding with custom authentication! 🎉"
