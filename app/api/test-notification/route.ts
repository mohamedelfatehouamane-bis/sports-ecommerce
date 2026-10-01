import { NextRequest, NextResponse } from 'next/server';
import { sendAdminOrderNotification } from '@/lib/firebase/firebase-admin';
import { requireAdmin } from '@/lib/admin-auth-helper';

export async function POST(request: NextRequest) {
  console.log('--- [Test Notification Endpoint Received Request] ---');
  try {
    await requireAdmin();
    const result = await sendAdminOrderNotification({
      orderId: 'TEST-ORDER-12345',
      customerName: 'Test Administrator',
      totalAmount: 149.99,
    });

    console.log('[Test Notification Endpoint] Dispatch finished. Result:', JSON.stringify(result));
    return NextResponse.json({
      success: result.success,
      message: 'Test notification process completed',
      details: result,
    });
  } catch (error) {
    console.error('[Test Notification Endpoint] Unhandled error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
