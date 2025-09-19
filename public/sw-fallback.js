// Fallback service worker for production deployment issues
// This minimal SW focuses only on push notifications

console.log('🔄 Fallback service worker loaded');

// Import push notification handlers
try {
  importScripts('/sw-push.js');
  console.log('✅ Push notification handlers imported');
} catch (error) {
  console.error('❌ Failed to import push handlers:', error);
  
  // Inline push handlers as fallback
  self.addEventListener('push', function(event) {
    console.log('Push event received (fallback):', event);
    
    if (event.data) {
      let data;
      
      try {
        // Try to parse as JSON first
        data = event.data.json();
        console.log('Push data (JSON):', data);
      } catch (jsonError) {
        // If JSON parsing fails, treat as plain text
        const textData = event.data.text();
        console.log('Push data (text):', textData);
        
        // Create a basic notification structure for plain text
        data = {
          title: 'Test Notification',
          body: textData,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          url: '/',
          timestamp: Date.now()
        };
      }
      
      const options = {
        body: data.body || 'No message content',
        icon: data.icon || '/android-chrome-192x192.png',
        badge: data.badge || '/favicon-32x32.png',
        tag: data.tag || 'announcement',
        requireInteraction: false,
        actions: data.actions || [
          { action: 'view', title: 'Lihat' },
          { action: 'close', title: 'Tutup' }
        ],
        data: {
          url: data.url || '/',
          timestamp: data.timestamp || Date.now()
        }
      };
      
      const title = data.title || 'Notification';
      
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } else {
      // Show a default notification if no data
      event.waitUntil(
        self.registration.showNotification('Test Notification', {
          body: 'Push notification received without data',
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          tag: 'test'
        })
      );
    }
  });

  self.addEventListener('notificationclick', function(event) {
    console.log('Notification clicked (fallback):', event);
    event.notification.close();
    
    if (event.action !== 'close') {
      const urlToOpen = event.notification.data?.url || '/';
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clientList => {
            for (let client of clientList) {
              if (client.url === urlToOpen && 'focus' in client) {
                return client.focus();
              }
            }
            if (clients.openWindow) {
              return clients.openWindow(urlToOpen);
            }
          })
      );
    }
  });
}

// Minimal caching strategy to avoid precaching issues
self.addEventListener('install', function(event) {
  console.log('🔧 Fallback SW installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('✅ Fallback SW activated');
  event.waitUntil(clients.claim());
});

// Basic fetch handler without aggressive caching
self.addEventListener('fetch', function(event) {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Let the browser handle the request normally for now
  // This avoids precaching issues while maintaining push notifications
  return;
});
