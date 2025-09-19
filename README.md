# Griya Jannatin Leyangan - Management System

A comprehensive web application for managing residential community operations, built with Next.js and Supabase.

## 🚀 Features

- **User Authentication & Authorization** - Secure login system with role-based access
- **Dashboard** - Overview of community statistics and activities
- **Payment Management** - Track and manage monthly fees and payments
- **Gallery** - Community photo gallery management
- **Announcements** - Admin announcements and community notices
- **Resident Management** - Manage resident information and house blocks
- **Financial Records** - Comprehensive financial tracking and reporting
- **Organizational Structure** - Display community organizational hierarchy
- **📱 Progressive Web App (PWA)** - Installable app experience on mobile and desktop

## 📱 PWA Features

- ✅ **Installable** - Install directly to home screen
- ✅ **Offline Support** - Works without internet connection
- ✅ **Service Worker** - Automatic caching for better performance
- ✅ **App-like Experience** - Full screen mode
- ✅ **Auto Updates** - Automatic updates when available
- ✅ **Install Prompt** - Smart installation prompts

See [PWA Installation Guide](docs/pwa/PWA_INSTALLATION_GUIDE.md) for detailed installation instructions.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
npm run build
npm start
```

The PWA features are only available in production mode.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Supabase
- **PWA**: next-pwa with Workbox
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📚 Documentation

Comprehensive documentation is organized into the following categories:

### 🚀 Features Documentation
- [Admin Users Drawer Implementation](docs/features/ADMIN_USERS_DRAWER_IMPLEMENTATION.md) - Admin user management interface
- [Announcements Drawer Implementation](docs/features/ANNOUNCEMENTS_DRAWER_IMPLEMENTATION.md) - Community announcements system
- [Change Password Feature](docs/features/CHANGE_PASSWORD_FEATURE.md) - User password management
- [Change Phone Feature](docs/features/CHANGE_PHONE_FEATURE.md) - User phone number updates
- [Content Truncation Feature](docs/features/CONTENT_TRUNCATION_FEATURE.md) - Text truncation utilities
- [Daftar Warga Feature](docs/features/DAFTAR_WARGA_FEATURE.md) - Resident management system
- [Export PDF Feature](docs/features/EXPORT_PDF_FEATURE.md) - PDF generation and export
- [Gallery Album Drawer Implementation](docs/features/GALLERY_ALBUM_DRAWER_IMPLEMENTATION.md) - Photo gallery management
- [Login Redirect Feature](docs/features/LOGIN_REDIRECT_FEATURE.md) - Authentication flow handling
- [Payment Drawer Implementation](docs/features/PAYMENT_DRAWER_IMPLEMENTATION.md) - Payment interface components
- [Payment Report Feature](docs/features/PAYMENT_REPORT_FEATURE.md) - Financial reporting system
- [Settings Feature](docs/features/SETTINGS_FEATURE.md) - Application configuration management

### 🔌 API Documentation
- [Backend README](docs/api/BACKEND_README.md) - Backend system overview
- [Finance API Documentation](docs/api/FINANCE_API_DOCS.md) - Financial operations API
- [Gallery API Documentation](docs/api/GALLERY_API_DOCS.md) - Photo gallery API endpoints
- [Payment Status API Documentation](docs/api/PAYMENT_STATUS_API_DOCS.md) - Payment tracking API

### 📱 Mobile & Responsive Design
- [Mobile Admin Announcements Improvements](docs/mobile/MOBILE_ADMIN_ANNOUNCEMENTS_IMPROVEMENTS.md) - Mobile admin interface optimizations
- [Mobile Admin Users Improvements](docs/mobile/MOBILE_ADMIN_USERS_IMPROVEMENTS.md) - Mobile user management enhancements
- [Mobile Dashboard Improvements](docs/mobile/MOBILE_DASHBOARD_IMPROVEMENTS.md) - Mobile dashboard optimization
- [Mobile Drawer Implementation](docs/mobile/MOBILE_DRAWER_IMPLEMENTATION.md) - Mobile navigation components
- [Mobile Gallery Improvements](docs/mobile/MOBILE_GALLERY_IMPROVEMENTS.md) - Mobile photo gallery enhancements
- [Tablet Responsive Improvements](docs/mobile/TABLET_RESPONSIVE_IMPROVEMENTS.md) - Tablet-specific optimizations

### 💳 Payment System
- [Payment Expiration System](docs/payment/PAYMENT_EXPIRATION_SYSTEM.md) - Payment deadline management
- [Payment Gateway Integration](docs/payment/PAYMENT_GATEWAY_INTEGRATION.md) - External payment provider integration
- [Payment Records Integration](docs/payment/PAYMENT_RECORDS_INTEGRATION.md) - Payment history management
- [Payment Report Fix](docs/payment/PAYMENT_REPORT_FIX.md) - Payment reporting bug fixes
- [Payment Status Feature](docs/payment/PAYMENT_STATUS_FEATURE.md) - Payment tracking system
- [Payment Status Testing](docs/payment/PAYMENT_STATUS_TESTING.md) - Payment system testing procedures

### 🔐 Authentication
- [Authentication Comparison](docs/authentication/AUTHENTICATION_COMPARISON.md) - Authentication system analysis and recommendations

### 📱 Progressive Web App (PWA)
- [PWA Implementation Summary](docs/pwa/PWA_IMPLEMENTATION_SUMMARY.md) - Complete PWA implementation overview
- [PWA Installation Guide](docs/pwa/PWA_INSTALLATION_GUIDE.md) - User installation instructions
- [Push Notifications Implementation](docs/pwa/PUSH_NOTIFICATIONS_IMPLEMENTATION.md) - Push notification system
- [Push Notifications Summary](docs/pwa/PUSH_NOTIFICATIONS_SUMMARY.md) - Notification features overview

### 🔧 Fixes & Troubleshooting
- [Build Error Fix](docs/fixes/BUILD_ERROR_FIX.md) - Common build issue solutions
- [Build Status Success](docs/fixes/BUILD_STATUS_SUCCESS.md) - Successful build configurations
- [Drawer Form Fix](docs/fixes/DRAWER_FORM_FIX.md) - Form component bug fixes

### 📖 Guides
- [Quick Fix Guide](docs/guides/QUICK_FIX_GUIDE.md) - Common issues and quick solutions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
