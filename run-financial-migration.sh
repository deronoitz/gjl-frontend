#!/bin/bash

# Script to run financial records migration on Supabase Cloud
# Make sure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment

echo "Running financial records migration on Supabase Cloud..."

# Check if environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables"
    exit 1
fi

# Run the migration
npx supabase db push --db-url "$SUPABASE_URL" --password "$SUPABASE_SERVICE_ROLE_KEY"

echo "Migration completed!"
