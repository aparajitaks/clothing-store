-- TeyaCollections Seed Data
-- Run after 001_initial_schema.sql

-- ============================================================
-- CATEGORIES
-- ============================================================
insert into public.categories (id, name, slug, description, image_url, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'Dresses',      'dresses',     'Elegant dresses for every occasion', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800', 1),
  ('11111111-0000-0000-0000-000000000002', 'Tops',         'tops',        'Timeless tops and blouses',          'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800', 2),
  ('11111111-0000-0000-0000-000000000003', 'Bottoms',      'bottoms',     'Trousers, skirts and more',          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', 3),
  ('11111111-0000-0000-0000-000000000004', 'Ethnic Wear',  'ethnic-wear', 'Celebrating Indian craftsmanship',   'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 4),
  ('11111111-0000-0000-0000-000000000005', 'Accessories',  'accessories', 'Complete your look',                 'https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?w=800', 5);

-- ============================================================
-- PRODUCTS
-- ============================================================
insert into public.products (name, slug, category_id, description, price, compare_price, images, sizes, colors, stock, is_featured) values
  (
    'Ivory Linen Midi Dress',
    'ivory-linen-midi-dress',
    '11111111-0000-0000-0000-000000000001',
    'A breezy linen midi dress perfect for warm days. Features a relaxed fit with a subtle V-neckline and side pockets.',
    3499.00, 4999.00,
    '[{"url":"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800","alt":"Ivory Linen Midi Dress","isPrimary":true},{"url":"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800","alt":"Ivory Linen Midi Dress Back"}]',
    '["XS","S","M","L","XL"]',
    '[{"name":"Ivory","hex":"#F5F0E8"},{"name":"Sage","hex":"#8B9E8E"}]',
    50, true
  ),
  (
    'Champagne Slip Dress',
    'champagne-slip-dress',
    '11111111-0000-0000-0000-000000000001',
    'Luxurious satin slip dress with adjustable straps and a flowing silhouette. Day to night effortlessly.',
    4299.00, 5999.00,
    '[{"url":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800","alt":"Champagne Slip Dress","isPrimary":true}]',
    '["XS","S","M","L"]',
    '[{"name":"Champagne","hex":"#C9A96E"},{"name":"Black","hex":"#1A1A1A"}]',
    35, true
  ),
  (
    'Structured Linen Blazer',
    'structured-linen-blazer',
    '11111111-0000-0000-0000-000000000002',
    'A tailored linen blazer that transitions from desk to dinner. Single-button closure with clean lines.',
    5999.00, 7999.00,
    '[{"url":"https://images.unsplash.com/photo-1594938298603-c8148c4b4e0b?w=800","alt":"Structured Linen Blazer","isPrimary":true}]',
    '["XS","S","M","L","XL","XXL"]',
    '[{"name":"Cream","hex":"#F9F5F0"},{"name":"Mocha","hex":"#6F4E37"}]',
    40, true
  ),
  (
    'Silk Wrap Blouse',
    'silk-wrap-blouse',
    '11111111-0000-0000-0000-000000000002',
    'Elegant wrap blouse in lightweight silk. Flattering for all body types with adjustable tie.',
    2799.00, 3999.00,
    '[{"url":"https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800","alt":"Silk Wrap Blouse","isPrimary":true}]',
    '["XS","S","M","L","XL"]',
    '[{"name":"Dusty Rose","hex":"#D4A5A5"},{"name":"Ivory","hex":"#F9F5F0"},{"name":"Navy","hex":"#1F3A5F"}]',
    60, false
  ),
  (
    'Wide-Leg Linen Trousers',
    'wide-leg-linen-trousers',
    '11111111-0000-0000-0000-000000000003',
    'Relaxed wide-leg trousers crafted from breathable linen. Elastic waistband with front pockets.',
    2999.00, null,
    '[{"url":"https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800","alt":"Wide-Leg Linen Trousers","isPrimary":true}]',
    '["XS","S","M","L","XL"]',
    '[{"name":"Oat","hex":"#D4C5A9"},{"name":"Black","hex":"#1A1A1A"},{"name":"Terracotta","hex":"#C1613A"}]',
    45, true
  ),
  (
    'Pleated Midi Skirt',
    'pleated-midi-skirt',
    '11111111-0000-0000-0000-000000000003',
    'Flowing pleated midi skirt in georgette fabric. Pairs beautifully with tucked-in blouses.',
    2499.00, 3299.00,
    '[{"url":"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800","alt":"Pleated Midi Skirt","isPrimary":true}]',
    '["XS","S","M","L","XL"]',
    '[{"name":"Blush","hex":"#F2C4C4"},{"name":"Sage","hex":"#8B9E8E"},{"name":"Ivory","hex":"#F9F5F0"}]',
    55, false
  ),
  (
    'Hand-Block Print Kurta',
    'hand-block-print-kurta',
    '11111111-0000-0000-0000-000000000004',
    'Artisan hand-block printed kurta on pure cotton. Each piece is unique, celebrating Indian craft traditions.',
    3299.00, 4499.00,
    '[{"url":"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800","alt":"Hand-Block Print Kurta","isPrimary":true}]',
    '["XS","S","M","L","XL","XXL"]',
    '[{"name":"Indigo","hex":"#3D4F7C"},{"name":"Rust","hex":"#B54434"}]',
    30, true
  ),
  (
    'Embroidered Co-ord Set',
    'embroidered-coord-set',
    '11111111-0000-0000-0000-000000000004',
    'Intricate thread embroidery on a coordinated kurta and palazzo set. Perfect for celebrations.',
    6999.00, 9999.00,
    '[{"url":"https://images.unsplash.com/photo-1603344204980-4edb0ea63148?w=800","alt":"Embroidered Co-ord Set","isPrimary":true}]',
    '["XS","S","M","L","XL"]',
    '[{"name":"Champagne","hex":"#C9A96E"},{"name":"Ivory","hex":"#F9F5F0"}]',
    20, true
  ),
  (
    'Woven Leather Belt',
    'woven-leather-belt',
    '11111111-0000-0000-0000-000000000005',
    'Hand-woven leather belt with a brushed gold buckle. Elevates any outfit.',
    1299.00, null,
    '[{"url":"https://images.unsplash.com/photo-1611006173046-73c7e5cd0f34?w=800","alt":"Woven Leather Belt","isPrimary":true}]',
    '["S/M","L/XL"]',
    '[{"name":"Tan","hex":"#C49A6C"},{"name":"Black","hex":"#1A1A1A"}]',
    80, false
  ),
  (
    'Gold Hoop Earrings',
    'gold-hoop-earrings',
    '11111111-0000-0000-0000-000000000005',
    'Minimalist 18K gold-plated hoop earrings. Lightweight and versatile for daily wear.',
    899.00, 1299.00,
    '[{"url":"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800","alt":"Gold Hoop Earrings","isPrimary":true}]',
    '["One Size"]',
    '[{"name":"Gold","hex":"#C9A96E"},{"name":"Silver","hex":"#C0C0C0"}]',
    100, false
  );
