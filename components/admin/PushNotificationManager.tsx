'use client'

import { useEffect, useState } from 'react';
import { messaging, requestNotificationPermission } from '@/lib/firebase/client';
import { onMessage } from 'firebase/messaging';
import { registerPushToken } from '@/app/actions/push-token';
import { Bell, BellOff, X } from 'lucide-react';

export function PushNotificationManager() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'default') {
        setShowBanner(true);
      } else if (Notification.permission === 'granted') {
        // Automatically attempt registration in background
        setupPushNotifications();
      }
    }
  }, []);

  const setupPushNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service worker not supported in browser');
        return;
      }

      if (!messaging) {
        console.warn('FCM Messaging is not supported or initialized');
        return;
      }

      // Explicitly register our Next.js served Service Worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });

      console.log('FCM Service Worker registered successfully:', registration);

      // Request token from FCM
      const token = await requestNotificationPermission();

      if (token) {
        // Send token to our Server Action
        const deviceInfo = `${navigator.userAgent} (${navigator.platform})`;
        const result = await registerPushToken(token, deviceInfo);
        if (result.success) {
          console.log('FCM push token registered in DB successfully');
          setPermissionStatus('granted');
          setShowBanner(false);
        } else {
          console.error('Failed to register FCM token in DB:', result.error);
        }
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }

      // Set up foreground message listener
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        
        // Show a custom UI toast or standard browser notification
        const title = payload.notification?.title || '🛒 New Order';
        const body = payload.notification?.body || 'A new order has been received';
        
        // Standard notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icon-192.png',
          });
        }
        
        // Also show an in-app visual feedback
        setStatusMessage(`${title}: ${body}`);
        setTimeout(() => setStatusMessage(null), 8000);
      });

    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        await setupPushNotifications();
      } else {
        console.warn('Notification permission denied by user.');
        setShowBanner(false);
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  return (
    <>
      {/* Foreground Notification Banner alert */}
      {statusMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-orange-500 bg-slate-900 p-4 shadow-2xl animate-bounce text-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500 animate-pulse flex-shrink-0" />
            <p className="text-sm font-semibold">{statusMessage}</p>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Permission Request Banner */}
      {showBanner && permissionStatus === 'default' && (
        <div className="border-b border-orange-500/20 bg-orange-950/20 px-6 py-3 text-slate-100">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-500 animate-pulse" />
              <div className="text-left">
                <p className="text-sm font-bold text-white">Enable Order Notifications</p>
                <p className="text-xs text-slate-400">Get instant push updates on desktop and mobile when customers place new orders.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={requestPermission}
                className="w-full sm:w-auto rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 cursor-pointer"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
