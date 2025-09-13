# Push Notifications Implementation for PWA

This document describes the implementation of push notifications for the Griya Jannatin Leyangan (GJL) PWA application, specifically for announcement notifications.

## Overview

The push notification system allows the application to send notifications to users when new announcements are posted by administrators. This enhances user engagement and ensures important information reaches residents quickly.

## Architecture

### Components

1. **Backend API Endpoints**
   - `/api/notifications/subscribe` - Handle push notification subscriptions
   - `/api/notifications/send` - Send push notifications to all subscribers
   - Modified `/api/announcements` - Triggers notifications when announcements are created

2. **Client-Side Services**
   - `NotificationService` - Utility class for managing push notifications
   - `NotificationPermissions` component - User interface for notification settings

3. **Service Worker Enhancement**
   - Push event handling
   - Notification click/close events
   - Background notification display

4. **Database**
   - `push_subscriptions` table - Stores user notification subscriptions

## Features

### For Users
- **Automatic Notification Prompts**: New users are prompted to enable notifications after 3 seconds
- **Notification Settings**: Users can enable/disable notifications via the navigation bar
- **Permission Management**: Clear instructions for users whose browsers have blocked notifications
- **Visual Indicators**: Bell icon shows subscription status with green dot when active

### For Administrators
- **Automatic Notifications**: When creating announcements, notifications are automatically sent
- **Notification Content**: Includes announcement title and truncated content (up to 100 characters)
- **Delivery Tracking**: Logs successful and failed notification deliveries

### Technical Features
- **VAPID Key Security**: Secure push message authentication
- **Subscription Management**: Automatic cleanup of invalid subscriptions
- **Cross-Platform Support**: Works on desktop and mobile browsers that support push notifications
- **Offline Capability**: Notifications work even when the app is closed (if service worker is active)

## Setup Instructions

### 1. Generate VAPID Keys
```bash
node scripts/generate-vapid-keys.js
```

### 2. Environment Variables
Add the following to your `.env.local` file:
```env
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Migration
Run the push subscriptions migration:
```sql
-- This creates the push_subscriptions table
-- File: supabase/migrations/20250913000001_create_push_subscriptions.sql
```

### 4. Dependencies
The following packages are required:
```json
{
  "web-push": "^3.6.7",
  "@types/web-push": "^3.6.3"
}
```

## Usage

### For Users

1. **Enable Notifications**:
   - Click the bell icon in the navigation bar
   - Click "Aktifkan" in the notification prompt
   - Grant permission when browser asks

2. **Disable Notifications**:
   - Click the bell icon (with green dot when active)
   - Click "Nonaktifkan" in the settings dialog

3. **If Notifications Are Blocked**:
   - Click the lock/info icon in browser address bar
   - Change "Notifications" setting to "Allow"
   - Refresh the page

### For Developers

#### Sending Custom Notifications
```javascript
// Example: Send notification via API
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: 'Custom Notification',
    body: 'Your message here',
    url: '/target-page'
  })
});
```

#### Check Subscription Status
```javascript
import { NotificationService } from '@/lib/notification-service';

// Check if user has notifications enabled
const isSubscribed = await NotificationService.isSubscribed();

// Get permission status
const permission = NotificationService.getPermissionStatus();
```

## Files Modified/Created

### New Files
- `src/app/api/notifications/subscribe/route.ts` - Subscription management API
- `src/app/api/notifications/send/route.ts` - Send notifications API
- `src/lib/notification-service.ts` - Client-side notification utilities
- `src/components/NotificationPermissions.tsx` - Notification settings UI
- `scripts/generate-vapid-keys.js` - VAPID key generation script
- `supabase/migrations/20250913000001_create_push_subscriptions.sql` - Database migration

### Modified Files
- `src/app/api/announcements/route.ts` - Added notification sending on announcement creation
- `src/app/layout.tsx` - Added NotificationPermissions component
- `src/components/Navigation.tsx` - Added notification settings to navigation
- `public/sw.js` - Added push notification event handlers
- `public/manifest.json` - Added notification permissions
- `.env.example` - Added VAPID key examples

## Browser Support

Push notifications are supported in:
- Chrome 50+ (desktop and Android)
- Firefox 44+ (desktop and Android)
- Safari 16+ (macOS, iOS/iPadOS 16.4+)
- Edge 17+

## Security Considerations

1. **VAPID Keys**: Keep private keys secure and never commit them to version control
2. **User Permissions**: Always respect user preferences and provide easy opt-out
3. **Content Filtering**: Notification content is truncated to prevent sensitive data exposure
4. **Rate Limiting**: Consider implementing rate limiting for notification sending

## Testing

### Manual Testing
1. Enable notifications in the app
2. Create a new announcement as an admin
3. Verify notification appears on subscribed devices
4. Test notification clicks navigate to correct page
5. Test unsubscription process

### Debug Information
- Check browser console for notification service logs
- Monitor network requests to `/api/notifications/` endpoints
- Use browser dev tools Application tab to inspect service worker and push subscriptions

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**:
   - Check browser notification permissions
   - Verify VAPID keys are correctly set
   - Ensure service worker is registered and active

2. **Subscription Fails**:
   - Check network connectivity
   - Verify API endpoints are accessible
   - Ensure user is authenticated

3. **Service Worker Issues**:
   - Clear browser cache and reload
   - Check for service worker errors in dev tools
   - Verify service worker file is accessible

### Logs to Check
- Browser console for client-side errors
- Server logs for API endpoint errors
- Network tab for failed requests
- Application tab for service worker status

## Future Enhancements

Possible improvements to consider:
- **Notification Categories**: Different types of notifications (announcements, payments, etc.)
- **Scheduled Notifications**: Send notifications at specific times
- **Rich Notifications**: Include images or action buttons
- **User Preferences**: Allow users to customize notification types
- **Analytics**: Track notification open rates and engagement
