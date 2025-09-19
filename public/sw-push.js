// Push notification event handlers
// This file will be imported by the main service worker

self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/android-chrome-192x192.png',
      badge: data.badge || '/favicon-32x32.png',
      tag: 'announcement',
      requireInteraction: false,
      actions: data.actions || [
        {
          action: 'view',
          title: 'Lihat'
        },
        {
          action: 'close',
          title: 'Tutup'
        }
      ],
      data: {
        url: data.url || '/',
        timestamp: data.timestamp || Date.now()
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } else {
    console.log('Push event but no data');
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  // You can track notification close events here if needed
});
