export let orders = [
  {
    "id": "ord-1",
    "orderCode": "ORD-A1B2",
    "customerName": "John Doe",
    "customerPhone": "+213555555555",
    "address": "123 Main St",
    "wilaya": "Algiers",
    "commune": "Bab Ezzouar",
    "productsTotal": 155,
    "paymentMethod": "CASH_ON_DELIVERY",
    "paymentStatus": "UNPAID",
    "status": "NEW",
    "deliveryMethod": "HOME",
    "deliveryFee": 5,
    "createdAt": "2026-10-01T11:44:04.393Z",
    "updatedAt": "2026-10-01T11:44:04.393Z",
    "items": [
      {
        "id": "item-1",
        "orderId": "ord-1",
        "productId": "prod-1",
        "productName": "Pro Running Shoes",
        "unitPrice": 120,
        "quantity": 1,
        "subtotal": 120,
        "size": "40",
        "color": "red",
        "createdAt": "2026-10-01T11:44:04.393Z"
      },
      {
        "id": "item-2",
        "orderId": "ord-1",
        "productId": "prod-2",
        "productName": "Workout T-Shirt",
        "unitPrice": 35,
        "quantity": 1,
        "subtotal": 35,
        "size": "M",
        "color": null,
        "createdAt": "2026-10-01T11:44:04.393Z"
      }
    ]
  }
];