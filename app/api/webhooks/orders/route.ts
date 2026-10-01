import { NextRequest, NextResponse } from 'next/server';
import { sendAdminOrderNotification } from '@/lib/firebase/firebase-admin';

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`--- [Webhook Request Received] ${timestamp} ---`);
  try {
    // Log request details
    console.log(`[Webhook Route] Method: ${request.method}`);
    const contentType = request.headers.get('content-type') || '';
    console.log(`[Webhook Route] Content-Type: ${contentType}`);

    if (!contentType.includes('application/json')) {
      console.warn('[Webhook Route] Invalid Content-Type, expected application/json');
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error('[Webhook Route] Failed to parse JSON request body:', parseErr);
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    console.log('[Webhook Route] Received Body:', JSON.stringify(body, null, 2));

    if (!body || typeof body !== 'object') {
      console.warn('[Webhook Route] Payload body is not an object.');
      return NextResponse.json(
        { success: false, error: 'Payload body must be a valid JSON object' },
        { status: 400 }
      );
    }

    const { record, type, table } = body;
    console.log(`[Webhook Route] Event Type: ${type}, Table: ${table || 'unknown'}, Record Exists: ${!!record}`);

    if (!type) {
      console.warn('[Webhook Route] Missing "type" field in payload.');
      return NextResponse.json(
        { success: false, error: 'Missing "type" field in payload' },
        { status: 400 }
      );
    }

    if (type !== 'INSERT') {
      console.log(`[Webhook Route] Ignoring non-INSERT event type: "${type}"`);
      return NextResponse.json({ success: true, message: `Ignored event type: ${type}` });
    }

    if (!record) {
      console.warn('[Webhook Route] Missing "record" field for INSERT event.');
      return NextResponse.json(
        { success: false, error: 'Missing "record" field for INSERT event' },
        { status: 400 }
      );
    }

    const orderId = record.id;
    if (!orderId) {
      console.warn('[Webhook Route] Missing "id" in record payload.');
      return NextResponse.json(
        { success: false, error: 'Missing order "id" in record payload' },
        { status: 400 }
      );
    }

    const customerName = record.guest_customer_name || 'Guest';
    const total = Number(record.total) || 0;

    console.log(`[Webhook Route] Dispatching FCM notification for Order ID: ${orderId}, Customer: ${customerName}, Total: $${total}`);

    const fcmResult = await sendAdminOrderNotification({
      orderId,
      customerName,
      totalAmount: total,
    });

    console.log(`[Webhook Route] FCM Dispatch Finished for Order ID: ${orderId}. Result:`, JSON.stringify(fcmResult));
    return NextResponse.json({
      success: true,
      message: 'FCM push notification processed',
      result: fcmResult,
    });
  } catch (error) {
    console.error('[Webhook Route] Unhandled error in order webhook:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
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
