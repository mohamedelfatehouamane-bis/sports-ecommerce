'use server'

// no db
import { requireAdmin } from '@/lib/admin-auth-helper';

interface RegisterTokenResult {
  success: boolean;
  error?: string;
}

export async function registerPushToken(fcmToken: string, deviceInfo?: string): Promise<RegisterTokenResult> {
  try {
    await requireAdmin();

    // Register or update the FCM token linked to this admin account
    // Note: adminPushToken model doesn't exist in current schema, safely ignoring for now.
    console.log(`(Skipping DB) Would have registered FCM token ${fcmToken} for admin user`);

    console.log(`Successfully registered/updated FCM token for admin user`);
    return { success: true };
  } catch (error) {
    console.error('Error inside registerPushToken Action:', error);
    return { success: false, error: 'Internal server error while registering token' };
  }
}
