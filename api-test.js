const http = require('http');

async function testApi() {
  console.log('Setting sizes via db-test...');
  const initRes = await fetch('http://localhost:3000/api/db-test');
  const initData = await initRes.json();
  console.log('Init:', initData.success);

  console.log('Testing server-side validation...');
  
  // get a product ID
  const resList = await fetch('http://localhost:3000/api/products');
  const products = await resList.json();
  const productWithSizes = products.products.find(p => p.availableSizes && p.availableSizes.length > 0);
  
  if (!productWithSizes) {
    console.log('No product with sizes found for testing API.');
    return;
  }
  
  console.log('Testing with product:', productWithSizes.name, 'Sizes:', productWithSizes.availableSizes);
  
  const addRes = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: productWithSizes.id,
      quantity: 1,
      size: 'INVALID_SIZE_999'
    })
  });
  const text = await addRes.text();
  console.log('Invalid cart add status:', addRes.status, 'Response:', text);
  
  const addResValid = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: productWithSizes.id,
      quantity: 1,
      size: productWithSizes.availableSizes[0]
    })
  });
  const textValid = await addResValid.text();
  console.log('Valid cart add status:', addResValid.status, 'Response:', textValid);
}

testApi();
