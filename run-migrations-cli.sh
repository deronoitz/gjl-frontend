#!/bin/bash

# Automated CLI Migration Runner
# Usage: ./run-migrations-cli.sh YOUR_PROJECT_REF

if [ $# -eq 0 ]; then
    echo "Usage: $0 <PROJECT_REF>"
    echo "Example: $0 abcdefghijklmnop"
    echo ""
    echo "Get your PROJECT_REF from your Supabase dashboard URL:"
    echo "https://supabase.com/dashboard/project/YOUR_PROJECT_REF"
    exit 1
fi

PROJECT_REF=$1

echo "🚀 Running Supabase CLI Migrations"
echo "================================="
echo "Project REF: $PROJECT_REF"
echo ""

# Check if supabase.toml exists
if [ ! -f supabase.toml ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize Supabase project"
        exit 1
    fi
    echo "✅ Supabase project initialized"
    echo ""
fi

# Link to remote project
echo "🔗 Linking to remote project..."
supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo "❌ Failed to link to remote project"
    echo "Please check your PROJECT_REF and try again"
    exit 1
fi
echo "✅ Linked to remote project"
echo ""

# Push migrations
echo "📤 Pushing migrations to remote database..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations"
    exit 1
fi

echo ""
echo "🎉 Migrations completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Run your app: npm run dev"
echo "2. Go to: http://localhost:3000/login"  
echo "3. Login with: House A-01, Password demo123"
echo ""
echo "Demo users available:"
echo "  • A-01 (Admin): demo123"
echo "  • A-02 (User): demo123"
echo "  • B-01 (User): demo123"
echo "  • B-02 (User): demo123"
echo "  • C-01 (User): demo123"
