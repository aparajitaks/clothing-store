-- TeyaCollections Seed Data
-- Run after 001_initial_schema.sql

-- ============================================================
-- CATEGORIES
-- ============================================================
insert into public.categories (id, name, slug, description, image_url, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'Kurta Sets',         'kurta-sets',         'Complete kurta sets with coordinated trousers or palazzos', '/products/rust-embroidered-kurta-set/front.jpg', 1),
  ('11111111-0000-0000-0000-000000000002', 'Embroidered Kurtas', 'embroidered-kurtas', 'Hand-embroidered kurtas with intricate threadwork',          '/products/rust-embroidered-kurta-set/right.jpg', 2),
  ('11111111-0000-0000-0000-000000000003', 'Festive Kurtas',     'festive-kurtas',     'Celebratory kurtas crafted for occasions',                  '/products/rust-embroidered-kurta-set/front.jpg', 3),
  ('11111111-0000-0000-0000-000000000004', 'Everyday Kurtas',    'everyday-kurtas',    'Effortlessly wearable kurtas in breathable fabrics',        '/hero_luxury.jpg', 4);

-- ============================================================
-- PRODUCTS (Original Launch Collection - 15% Launch Offer)
-- ============================================================
insert into public.products (name, slug, category_id, description, price, compare_price, images, sizes, colors, stock, is_featured) values
  (
    'Rust Embroidered Kurta Set',
    'rust-embroidered-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A striking two-piece ensemble in a rich rust hue, featuring a button-down tunic with a mandarin collar, 3/4th sleeves, and intricate floral cutwork scalloped embroidery along the hem and sleeve cuffs. Complemented with relaxed straight-fit trousers for effortless festive and celebratory elegance.',
    1784.00, 2099.00,
    '[{"url":"/products/rust-embroidered-kurta-set/front.jpg","alt":"Rust Embroidered Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/rust-embroidered-kurta-set/back.jpg","alt":"Rust Embroidered Kurta Set — Back View","type":"image"},{"url":"/products/rust-embroidered-kurta-set/right.jpg","alt":"Rust Embroidered Kurta Set — Right Side Profile","type":"image"},{"url":"/products/rust-embroidered-kurta-set/left.jpg","alt":"Rust Embroidered Kurta Set — Left Side Profile","type":"image"},{"url":"/products/rust-embroidered-kurta-set/video.mp4","poster":"/products/rust-embroidered-kurta-set/video-poster.jpg","alt":"Rust Embroidered Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Rust Orange","hex":"#C2542D"}]',
    60, true
  );
