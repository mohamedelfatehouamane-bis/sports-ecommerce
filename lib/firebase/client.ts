import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAvS0U3LWN1Xm_7Y2A1wBgcUdaWh9H_i6Y",
  authDomain: "shop-admin-83d86.firebaseapp.com",
  projectId: "shop-admin-83d86",
  storageBucket: "shop-admin-83d86.firebasestorage.app",
  messagingSenderId: "850860026200",
  appId: "1:850860026200:web:f1bc08cec0eb3985649d2d",
  measurementId: "G-NV5HEXZV2V"
};

// Initialize Firebase only once
export const app =
  getApps().length === 0
    ? (() => {
        const initializedApp = initializeApp(firebaseConfig);
        console.log("🔥 Firebase initialized");
        console.log("🔥 Project:", firebaseConfig.projectId);
        return initializedApp;
      })()
    : getApp();

export const messaging =
  typeof window !== "undefined"
    ? (() => {
        try {
          return getMessaging(app);
        } catch (e) {
          console.error("❌ FCM Messaging initialization failed:", e);
          return null;
        }
      })()
    : null;

// Initialize Analytics only on client side when supported
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (e) {
        console.error("❌ Firebase Analytics initialization failed:", e);
      }
    }
  });
}

/**
 * Request notification permission, generate and return FCM token.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("❌ Notifications not supported in this environment");
    return null;
  }

  try {
    console.log("🔥 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("❌ Notification permission denied:", permission);
      return null;
    }

    console.log("🔥 Notification permission granted. Retrieving FCM token...");
    
    if (!messaging) {
      console.warn("❌ FCM Messaging is not initialized");
      return null;
    }

    let token = "";
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready.catch(() => null);
      if (registration) {
        token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
      } else {
        token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
      }
    } else {
      token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
    }

    if (token) {
      console.log("🔥 FCM Token generated successfully:", token);
      return token;
    } else {
      console.warn("❌ No FCM token returned");
      return null;
    }
  } catch (error) {
    console.error("❌ Error requesting notification permission / retrieving token:", error);
    return null;
  }
}
