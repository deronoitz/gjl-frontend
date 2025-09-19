'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          console.log('🔧 Manually registering service worker...');
          
          // Check if service worker is already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration();
          if (existingRegistration) {
            console.log('✅ Service worker already registered:', existingRegistration);
            return;
          }
          
          // Register service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('✅ Service worker registered successfully:', registration);
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service worker is ready');
          
        } catch (error) {
          console.error('❌ Service worker registration failed:', error);
        }
      };

      // Register immediately and also after a short delay
      registerSW();
      setTimeout(registerSW, 1000);
    }
  }, []);

  return null; // This component doesn't render anything
}
