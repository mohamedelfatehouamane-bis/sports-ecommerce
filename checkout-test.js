const http = require('http');

async function testCheckout() {
  console.log('Testing checkout...');
  
  const resList = await fetch('http://localhost:3000/api/products');
  const products = await resList.json();
  const productWithSizes = products.products.find(p => p.availableSizes && p.availableSizes.length > 0);
  
  const res = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test User',
      phoneNumber: '0555555555',
      wilaya: 'Algiers',
      commune: 'Algiers',
      address: 'Test Address',
      idempotencyKey: 'test-key-' + Date.now(),
      cartItems: [
        {
          productId: productWithSizes.id,
          quantity: 1,
          size: 'XL'
        }
      ]
    })
  });
  
  const data = await res.json();
  console.log('Checkout response:', res.status, data);
  
  if (data.orderCode) {
    console.log('Fetching order details...');
    const trackRes = await fetch('http://localhost:3000/api/orders/track?code=' + data.orderCode);
    const trackData = await trackRes.json();
    console.log('Tracked Order Item 0 Size:', trackData.order.items[0].size);
  }
}

testCheckout();
