export let products = [
  {
    "id": "prod-1",
    "name": "Pro Running Shoes",
    "slug": "pro-running-shoes",
    "description": "High performance running shoes",
    "price": 120,
    "originalPrice": 150,
    "stock": 50,
    "lowStockThreshold": 5,
    "categoryId": "cat-1",
    "imageUrl": "https://via.placeholder.com/400?text=Shoes",
    "availableSizes": [
      "40",
      "41",
      "42"
    ],
    "isActive": true,
    "createdAt": "2026-10-01T11:44:04.393Z",
    "updatedAt": "2026-10-01T11:44:04.393Z",
    "variants": [
      {
        "id": "var-1",
        "productId": "prod-1",
        "size": "40",
        "color": "red",
        "quantity": 10,
        "createdAt": "2026-10-01T11:44:04.393Z",
        "updatedAt": "2026-10-01T11:44:04.393Z"
      }
    ]
  },
  {
    "id": "prod-2",
    "name": "Workout T-Shirt",
    "slug": "workout-t-shirt",
    "description": "Breathable fabric for intense workouts",
    "price": 35,
    "originalPrice": null,
    "stock": 100,
    "lowStockThreshold": 10,
    "categoryId": "cat-2",
    "imageUrl": "https://via.placeholder.com/400?text=T-Shirt",
    "availableSizes": [
      "S",
      "M",
      "L"
    ],
    "isActive": true,
    "createdAt": "2026-10-01T11:44:04.393Z",
    "updatedAt": "2026-10-01T11:44:04.393Z",
    "variants": []
  }
];