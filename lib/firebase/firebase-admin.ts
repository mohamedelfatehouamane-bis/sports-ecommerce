import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
// import removed

export function getFirebaseAdmin(): App | null {
  console.log("🔥 Firebase env check:", {
    projectId: !!(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: !!process.env.FIREBASE_PRIVATE_KEY
  });

  const apps = getApps();
  console.log("🔥 Firebase initialized:", apps.length > 0);
  if (apps.length > 0) {
    return apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log(`[FCM Init] Checking credentials: projectId=${projectId ? 'PRESENT' : 'MISSING'}, clientEmail=${clientEmail ? 'PRESENT' : 'MISSING'}, privateKey=${privateKey ? 'PRESENT' : 'MISSING'}`);

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FCM Init] Firebase Admin credentials are missing. Cloud Messaging not initialized.');
    return null;
  }

  try {
    console.log('[FCM Init] Initializing Firebase Admin SDK...');
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error('[FCM Init] Error initializing Firebase Admin SDK:', error);
    return null;
  }
}

interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  totalAmount: number;
}

export async function sendAdminOrderNotification({
  orderId,
  customerName,
  totalAmount,
}: OrderNotificationPayload) {
  console.log("🔥 Notification stub for order:", orderId);
  return { success: true, message: 'Stubbed' };
}
