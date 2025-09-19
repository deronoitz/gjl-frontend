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
          if (existingRegistration && existingRegistration.active) {
            console.log('✅ Service worker already registered and active:', existingRegistration);
            return;
          }
          
          // Register service worker with fallback for production issues
          let registration;
          try {
            registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none' // Ensure fresh service worker in production
            });
          } catch (mainSwError) {
            console.warn('Main SW failed, trying fallback:', mainSwError);
            // Try fallback service worker if main one fails
            registration = await navigator.serviceWorker.register('/sw-fallback.js', {
              scope: '/',
              updateViaCache: 'none'
            });
            console.log('✅ Fallback service worker registered');
          }
          
          console.log('✅ Service worker registered successfully:', registration);
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New service worker available, will update on next visit');
                }
              });
            }
          });
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service worker is ready');
          
        } catch (error) {
          console.error('❌ Service worker registration failed:', error);
          // In production, try to clear any problematic cache
          if (typeof caches !== 'undefined') {
            try {
              const cacheNames = await caches.keys();
              console.log('🧹 Clearing caches due to SW error:', cacheNames);
              await Promise.all(cacheNames.map(name => caches.delete(name)));
            } catch (cacheError) {
              console.warn('Failed to clear caches:', cacheError);
            }
          }
        }
      };

      // Register with delay to avoid blocking initial page load
      setTimeout(registerSW, 100);
    }
  }, []);

  return null; // This component doesn't render anything
}
