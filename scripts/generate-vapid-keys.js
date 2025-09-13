#!/usr/bin/env node
/**
 * Generate VAPID keys for push notifications
 * Run this script to generate new VAPID keys for your application
 */

const webpush = require('web-push');

console.log('Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Add these environment variables to your .env.local file:');
console.log('================================================');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log('================================================\n');

console.log('IMPORTANT:');
console.log('1. Keep these keys secure and never commit them to version control');
console.log('2. The VAPID_PRIVATE_KEY should only be accessible on the server');
console.log('3. The NEXT_PUBLIC_VAPID_PUBLIC_KEY will be available in the browser');
console.log('4. If you regenerate these keys, all existing subscriptions will become invalid');
