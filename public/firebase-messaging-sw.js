importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAvS0U3LWN1Xm_7Y2A1wBgcUdaWh9H_i6Y",
  authDomain: "shop-admin-83d86.firebaseapp.com",
  projectId: "shop-admin-83d86",
  storageBucket: "shop-admin-83d86.firebasestorage.app",
  messagingSenderId: "850860026200",
  appId: "1:850860026200:web:f1bc08cec0eb3985649d2d"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || '🛒 New Order Received';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'A new order has been placed.',
    icon: payload.notification?.icon || '/icon-192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Determine destination: order details if id exists, fallback to admin orders list
  const orderId = event.notification.data?.orderId;
  const targetUrl = orderId 
    ? `/a145/orders/${orderId}` 
    : '/a145/orders';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already an admin window open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // Match any tab currently on the admin portal
        if (client.url.includes('/a145') && 'focus' in client) {
          return client.focus().then(() => {
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
          });
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
