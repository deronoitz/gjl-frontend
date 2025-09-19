// Utility functions for handling push notifications

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class NotificationService {
  private static VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  /**
   * Check if push notifications are supported by the browser
   */
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Get current notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribe(): Promise<NotificationSubscription | null> {
    console.log('🔔 NotificationService.subscribe() called');
    
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    if (!this.VAPID_PUBLIC_KEY) {
      console.error('❌ VAPID_PUBLIC_KEY not found:', this.VAPID_PUBLIC_KEY);
      throw new Error('VAPID public key is not configured');
    }
    
    console.log('✅ VAPID key available, length:', this.VAPID_PUBLIC_KEY.length);

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }
    
    console.log('✅ Permission granted, proceeding with subscription...');

    try {
      // Wait for service worker to be ready with timeout
      console.log('⏳ Waiting for service worker...');
      
      // First try to get existing registration
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log('🔧 No existing registration, trying to register...');
        try {
          registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          console.log('✅ Service worker registered manually:', !!registration);
        } catch (regError) {
          console.error('❌ Manual registration failed:', regError);
        }
      }
      
      // Wait for it to be ready with timeout
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)
      );
      
      registration = await Promise.race([readyPromise, timeoutPromise]) as ServiceWorkerRegistration;
      console.log('✅ Service worker ready:', !!registration);

      // Subscribe to push notifications
      console.log('📝 Creating push subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY) as BufferSource
      });
      console.log('✅ Push subscription created:', !!subscription);

      // Convert subscription to a plain object
      const subscriptionObject = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
      console.log('✅ Subscription object created:', !!subscriptionObject);

      // Send subscription to server
      console.log('📤 Sending subscription to server...');
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ subscription: subscriptionObject })
      });

      console.log('📤 Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Failed to save subscription to server: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Server response:', responseData);

      return subscriptionObject;
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribe(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently subscribed
   */
  static async isSubscribed(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get current subscription details
   */
  static async getSubscription(): Promise<NotificationSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) return null;

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Show a local notification (fallback for testing)
   */
  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        ...options
      });
    } else {
      new Notification(title, options);
    }
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Export utility functions
export const {
  isSupported,
  getPermissionStatus,
  requestPermission,
  subscribe,
  unsubscribe,
  isSubscribed,
  getSubscription,
  showNotification
} = NotificationService;
