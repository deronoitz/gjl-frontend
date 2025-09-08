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

See [PWA Installation Guide](PWA_INSTALLATION_GUIDE.md) for detailed installation instructions.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
