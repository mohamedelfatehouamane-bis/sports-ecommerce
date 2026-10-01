# 🏆 Sport Store

A modern sports e-commerce website prototype built with **Next.js, React, TypeScript, and Tailwind CSS**.

This project is designed as a **database-free, reusable e-commerce prototype**. It uses mock data and an in-memory data layer, allowing the application to run locally without PostgreSQL, Prisma, Supabase, or any external database.

---

## ✨ Features

### 🛍️ Storefront

- Modern sports e-commerce interface
- Responsive design
- Product browsing
- Product categories
- Product details
- Search and filtering
- Shopping cart
- Guest checkout
- Order confirmation

### 📦 Product Management

- Product listing
- Product creation
- Product editing
- Product deletion
- Category management
- Stock management
- Product availability
- Mock inventory system

### 🧾 Checkout

- Guest checkout
- Customer information
- Wilaya and commune selection
- Order creation
- Order code generation
- Inventory updates
- Order status handling

### 📊 Admin Dashboard

- Dashboard overview
- Product management
- Category management
- Orders
- Inventory
- Store settings
- Basic analytics

### 🧪 Prototype Architecture

The project does **not require a database**.

Instead, it uses:

```text
Mock Data
    ↓
In-Memory Data Layer
    ↓
Server Actions / API Routes
    ↓
React UI
