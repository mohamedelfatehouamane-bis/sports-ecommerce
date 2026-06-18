-- Sample Data for Sports Shop E-commerce Platform
-- Run this script in your Supabase SQL Editor to populate test data

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Running Shoes', 'running-shoes', 'Professional running footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Apparel', 'apparel', 'Athletic clothing and gear', 'https://images.unsplash.com/photo-1535528033733-fe86d50eab6e'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Accessories', 'accessories', 'Sports accessories and equipment', 'https://images.unsplash.com/photo-1523889033099-2aa51b8352b2'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Outdoor Gear', 'outdoor-gear', 'Outdoor sports equipment', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4')
ON CONFLICT DO NOTHING;

-- Insert Sizes
INSERT INTO sizes (id, category_id, name, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'US 6', 1),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'US 7', 2),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'US 8', 3),
  ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'US 9', 4),
  ('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'US 10', 5),
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440002', 'XS', 1),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'S', 2),
  ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440002', 'M', 3),
  ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440002', 'L', 4),
  ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440002', 'XL', 5)
ON CONFLICT DO NOTHING;

-- Insert Colors
INSERT INTO colors (id, name, hex_code, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', 'Black', '#000000', 1),
  ('550e8400-e29b-41d4-a716-446655440302', 'White', '#FFFFFF', 2),
  ('550e8400-e29b-41d4-a716-446655440303', 'Red', '#FF0000', 3),
  ('550e8400-e29b-41d4-a716-446655440304', 'Blue', '#0000FF', 4),
  ('550e8400-e29b-41d4-a716-446655440305', 'Gray', '#808080', 5)
ON CONFLICT DO NOTHING;

-- Insert Materials
INSERT INTO materials (id, name, description, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440401', 'Mesh', 'Breathable mesh upper', 1),
  ('550e8400-e29b-41d4-a716-446655440402', 'Synthetic Leather', 'Durable synthetic leather', 2),
  ('550e8400-e29b-41d4-a716-446655440403', 'Cotton', 'Pure cotton material', 3),
  ('550e8400-e29b-41d4-a716-446655440404', 'Polyester', 'Breathable polyester blend', 4)
ON CONFLICT DO NOTHING;

-- Insert Sample Products
INSERT INTO products (id, category_id, name, slug, description, long_description, base_price, sale_price, image_url, featured, active) VALUES
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440001', 'Pro Runner Max', 'pro-runner-max', 'Professional running shoes with advanced cushioning', 'Experience ultimate comfort with our Pro Runner Max. Features advanced cushioning technology, responsive midsole, and breathable mesh upper for optimal performance.', 149.99, 119.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', true, true),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440002', 'Athletic Performance Tee', 'athletic-performance-tee', 'Breathable athletic performance t-shirt', 'Premium athletic t-shirt made from moisture-wicking polyester blend. Perfect for training and casual wear.', 39.99, 29.99, 'https://images.unsplash.com/photo-1535528033733-fe86d50eab6e', false, true),
  ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440003', 'Sports Water Bottle', 'sports-water-bottle', 'Durable 32oz sports water bottle', 'Keep hydrated during your workouts with our insulated sports water bottle. Keeps drinks cold for 24 hours.', 24.99, NULL, 'https://images.unsplash.com/photo-1523889033099-2aa51b8352b2', false, true),
  ('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440004', 'Outdoor Hiking Backpack', 'outdoor-hiking-backpack', '45L outdoor hiking backpack', 'Spacious 45L hiking backpack with ergonomic design and multiple compartments for your outdoor adventures.', 89.99, 69.99, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', true, true)
ON CONFLICT DO NOTHING;

-- Insert Product Variants with SKUs
INSERT INTO product_variants (id, product_id, size_id, color_id, material_id, sku, price, cost, quantity_in_stock, reorder_level, active) VALUES
  -- Pro Runner Max variants
  ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440401', 'PRM-BLK-MESH-6', 119.99, 60.00, 15, 5, true),
  ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440401', 'PRM-BLK-MESH-7', 119.99, 60.00, 20, 5, true),
  ('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440401', 'PRM-BLK-MESH-8', 119.99, 60.00, 25, 5, true),
  ('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440401', 'PRM-BLU-MESH-9', 119.99, 60.00, 18, 5, true),
  ('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440401', 'PRM-BLU-MESH-10', 119.99, 60.00, 22, 5, true),
  -- Athletic Performance Tee variants
  ('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440404', 'APT-BLK-POLY-XS', 29.99, 12.00, 30, 10, true),
  ('550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440404', 'APT-BLK-POLY-S', 29.99, 12.00, 35, 10, true),
  ('550e8400-e29b-41d4-a716-446655440608', '550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440404', 'APT-BLK-POLY-M', 29.99, 12.00, 40, 10, true),
  ('550e8400-e29b-41d4-a716-446655440609', '550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440404', 'APT-WHT-POLY-M', 29.99, 12.00, 25, 10, true),
  -- Sports Water Bottle variants
  ('550e8400-e29b-41d4-a716-446655440610', '550e8400-e29b-41d4-a716-446655440503', NULL, '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440402', 'SWB-BLK-32OZ', 24.99, 8.00, 50, 15, true),
  ('550e8400-e29b-41d4-a716-446655440611', '550e8400-e29b-41d4-a716-446655440503', NULL, '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440402', 'SWB-BLU-32OZ', 24.99, 8.00, 45, 15, true),
  -- Outdoor Hiking Backpack variants
  ('550e8400-e29b-41d4-a716-446655440612', '550e8400-e29b-41d4-a716-446655440504', NULL, '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440404', 'OHB-BLK-45L', 69.99, 35.00, 20, 5, true),
  ('550e8400-e29b-41d4-a716-446655440613', '550e8400-e29b-41d4-a716-446655440504', NULL, '550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440404', 'OHB-GRY-45L', 69.99, 35.00, 18, 5, true)
ON CONFLICT DO NOTHING;

-- Insert some sample reviews
INSERT INTO reviews (id, product_id, customer_id, order_item_id, rating, title, content, verified_purchase, helpful_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440501', NULL, NULL, 5, 'Amazing comfort', 'Best running shoes I have ever worn. Extremely comfortable for long distances.', true, 42),
  ('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440501', NULL, NULL, 4, 'Great shoes', 'Very good quality. A bit pricey but worth the investment.', true, 28),
  ('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440502', NULL, NULL, 5, 'Perfect fit', 'Excellent athletic tee. Breathable and comfortable for training.', true, 35)
ON CONFLICT DO NOTHING;
