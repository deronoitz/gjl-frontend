#!/bin/bash

# Quick Password Hash Generator
# Usage: ./hash-password.sh your_password

if [ $# -eq 0 ]; then
    echo "Usage: ./hash-password.sh <password>"
    echo "Example: ./hash-password.sh admin123"
    exit 1
fi

PASSWORD="$1"

echo "🔐 Generating password hash..."
echo ""

# Use npm script to generate hash
npm run hash-password "$PASSWORD"

echo ""
echo "✅ Use this hash when creating users in Supabase Authentication panel"
echo "   Set it in the user_metadata.password field"
