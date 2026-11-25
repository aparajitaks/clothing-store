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
  ),
  (
    'Ice Blue Embroidered Kurta Set',
    'ice-blue-embroidered-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'An ethereal three-piece ensemble in serene ice blue, featuring delicate white floral embroidery framing the scalloped V-neckline and scattered motifs across the kurta. Paired with matching straight-fit trousers and a sheer lace-trimmed dupatta for timeless daytime and festive grace.',
    2464.00, 2899.00,
    '[{"url":"/products/ice-blue-embroidered-kurta-set/front.jpg","alt":"Ice Blue Embroidered Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/ice-blue-embroidered-kurta-set/back.jpg","alt":"Ice Blue Embroidered Kurta Set — Back View","type":"image"},{"url":"/products/ice-blue-embroidered-kurta-set/left.jpg","alt":"Ice Blue Embroidered Kurta Set — Left Side Profile","type":"image"},{"url":"/products/ice-blue-embroidered-kurta-set/detail.jpg","alt":"Ice Blue Embroidered Kurta Set — Front Detail","type":"image"},{"url":"/products/ice-blue-embroidered-kurta-set/video.mp4","poster":"/products/ice-blue-embroidered-kurta-set/video-poster.jpg","alt":"Ice Blue Embroidered Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Ice Blue","hex":"#9EC5D0"}]',
    60, true
  ),
  (
    'Ivory Floral Embroidered Kurta Set',
    'ivory-floral-embroidered-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A luminous three-piece ivory kurta set adorned with vibrant pink, coral, and sage floral neckline embroidery and delicate scattered motifs. Completed with embroidered-hem straight trousers and a sheer organza dupatta featuring hand-painted lotus motifs and antique zari edging.',
    2464.00, 2899.00,
    '[{"url":"/products/ivory-floral-embroidered-kurta-set/front.jpg","alt":"Ivory Floral Embroidered Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/ivory-floral-embroidered-kurta-set/back.jpg","alt":"Ivory Floral Embroidered Kurta Set — Back View","type":"image"},{"url":"/products/ivory-floral-embroidered-kurta-set/left.jpg","alt":"Ivory Floral Embroidered Kurta Set — Left Side Profile","type":"image"},{"url":"/products/ivory-floral-embroidered-kurta-set/right.jpg","alt":"Ivory Floral Embroidered Kurta Set — Full Silhouette","type":"image"},{"url":"/products/ivory-floral-embroidered-kurta-set/detail.jpg","alt":"Ivory Floral Embroidered Kurta Set — Front Detail","type":"image"},{"url":"/products/ivory-floral-embroidered-kurta-set/video.mp4","poster":"/products/ivory-floral-embroidered-kurta-set/video-poster.jpg","alt":"Ivory Floral Embroidered Kurta Set — Video Shoot","type":"video"}]',
    '["S","M","L","XL","XXL"]',
    '[{"name":"Ivory White","hex":"#F4F1EA"}]',
    70, true
  ),
  (
    'Champagne Gold Zari Kurta Set',
    'champagne-gold-zari-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'An opulent three-piece champagne cream ensemble featuring a flared peplum kurta embellished with intricate gold zari and zardosi neckline embroidery, finished with delicate beaded tassel trim along the hem and sleeves. Paired with wide-leg palazzos and a gold-bordered sheer dupatta.',
    2889.00, 3399.00,
    '[{"url":"/products/champagne-gold-zari-kurta-set/front.jpg","alt":"Champagne Gold Zari Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/champagne-gold-zari-kurta-set/back.jpg","alt":"Champagne Gold Zari Kurta Set — Back View","type":"image"},{"url":"/products/champagne-gold-zari-kurta-set/left.jpg","alt":"Champagne Gold Zari Kurta Set — Left Side Profile","type":"image"},{"url":"/products/champagne-gold-zari-kurta-set/detail.jpg","alt":"Champagne Gold Zari Kurta Set — Front Detail","type":"image"},{"url":"/products/champagne-gold-zari-kurta-set/drape.jpg","alt":"Champagne Gold Zari Kurta Set — Dupatta Drape","type":"image"},{"url":"/products/champagne-gold-zari-kurta-set/video.mp4","poster":"/products/champagne-gold-zari-kurta-set/video-poster.jpg","alt":"Champagne Gold Zari Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Champagne Gold","hex":"#E5DEC9"}]',
    60, true
  ),
  (
    'Botanical Printed Pink Kurta Set',
    'botanical-printed-pink-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A cheerful three-piece cotton ensemble featuring a multicolor botanical-printed kurta highlighted with white chikankari floral embroidery along the notched V-neckline. Paired with rose pink bandhani-dot straight trousers and a breezy lace-edged dupatta.',
    1444.00, 1699.00,
    '[{"url":"/products/botanical-printed-pink-kurta-set/front.jpg","alt":"Botanical Printed Pink Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/botanical-printed-pink-kurta-set/back.jpg","alt":"Botanical Printed Pink Kurta Set — Back View","type":"image"},{"url":"/products/botanical-printed-pink-kurta-set/left.jpg","alt":"Botanical Printed Pink Kurta Set — Left Side Profile","type":"image"},{"url":"/products/botanical-printed-pink-kurta-set/back-detail.jpg","alt":"Botanical Printed Pink Kurta Set — Back Detail","type":"image"},{"url":"/products/botanical-printed-pink-kurta-set/video.mp4","poster":"/products/botanical-printed-pink-kurta-set/video-poster.jpg","alt":"Botanical Printed Pink Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Rose Pink","hex":"#D9729D"}]',
    60, true
  ),
  (
    'Midnight Black Zari Kurta Set',
    'midnight-black-zari-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'An elegant three-piece black kurta set featuring scattered gold zari and sequin floral motifs across the body, a V-neckline with white and gold embroidery trim, and three-quarter sleeves. Paired with straight-fit black trousers and a sheer black chiffon dupatta adorned with gold buti embroidery and a heavy gold zari pallu border.',
    2124.00, 2499.00,
    '[{"url":"/products/midnight-black-zari-kurta-set/front.jpg","alt":"Midnight Black Zari Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/midnight-black-zari-kurta-set/back.jpg","alt":"Midnight Black Zari Kurta Set — Back View","type":"image"},{"url":"/products/midnight-black-zari-kurta-set/left.jpg","alt":"Midnight Black Zari Kurta Set — Left Side Profile","type":"image"},{"url":"/products/midnight-black-zari-kurta-set/video.mp4","poster":"/products/midnight-black-zari-kurta-set/video-poster.jpg","alt":"Midnight Black Zari Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL"]',
    '[{"name":"Midnight Black","hex":"#1A1A1A"}]',
    50, true
  ),
  (
    'Tropical Floral Kaftan Palazzo Set',
    'tropical-floral-kaftan-palazzo-set',
    '11111111-0000-0000-0000-000000000001',
    'A bold and vibrant two-piece ensemble featuring a loose-fit kaftan-style top with batwing/dolman sleeves in a striking tropical floral print — a mix of black and white illustrated botanicals with oversized coral pink, orange, yellow and green blooms. Paired with flowing navy black wide-leg palazzo pants.',
    2124.00, 2499.00,
    '[{"url":"/products/tropical-floral-kaftan-palazzo-set/front.jpg","alt":"Tropical Floral Kaftan Palazzo Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/tropical-floral-kaftan-palazzo-set/back.jpg","alt":"Tropical Floral Kaftan Palazzo Set — Back View","type":"image"},{"url":"/products/tropical-floral-kaftan-palazzo-set/left.jpg","alt":"Tropical Floral Kaftan Palazzo Set — Left Side Profile","type":"image"},{"url":"/products/tropical-floral-kaftan-palazzo-set/right.jpg","alt":"Tropical Floral Kaftan Palazzo Set — Right Side Profile","type":"image"},{"url":"/products/tropical-floral-kaftan-palazzo-set/video.mp4","poster":"/products/tropical-floral-kaftan-palazzo-set/video-poster.jpg","alt":"Tropical Floral Kaftan Palazzo Set — Video Shoot","type":"video"}]',
    '["L","XXL"]',
    '[{"name":"Tropical Floral","hex":"#E8734A"}]',
    35, true
  ),
  (
    'Wine Tissue Silk Floral Kurta Set',
    'wine-tissue-silk-floral-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A stunning three-piece ensemble in rich wine-purple tissue silk featuring scattered multicolor floral embroidery — yellow, pink and green blooms — across the kurta body and neckline, with a dense embroidered hem border. Paired with straight-fit matching trousers and a sheer tissue silk dupatta with scalloped lace edging and scattered floral buti.',
    1699.00, 1999.00,
    '[{"url":"/products/wine-tissue-silk-floral-kurta-set/front.jpg","alt":"Wine Tissue Silk Floral Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/wine-tissue-silk-floral-kurta-set/front-2.jpg","alt":"Wine Tissue Silk Floral Kurta Set — Dupatta Drape View","type":"image"},{"url":"/products/wine-tissue-silk-floral-kurta-set/back.jpg","alt":"Wine Tissue Silk Floral Kurta Set — Back View","type":"image"},{"url":"/products/wine-tissue-silk-floral-kurta-set/side.jpg","alt":"Wine Tissue Silk Floral Kurta Set — Side Profile","type":"image"},{"url":"/products/wine-tissue-silk-floral-kurta-set/video.mp4","poster":"/products/wine-tissue-silk-floral-kurta-set/video-poster.jpg","alt":"Wine Tissue Silk Floral Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Wine Purple","hex":"#6B2D5E"}]',
    60, true
  ),
  (
    'Fuchsia Floral Block Print Kurta Set',
    'fuchsia-floral-block-print-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A vibrant two-piece kurta set in bold fuchsia pink featuring an all-over dense white floral block print in a classic Indian botanical motif. Notched V-neckline with button placket and silver gota trim, three-quarter sleeves, A-line silhouette with side slits, matched with printed straight-cut trousers.',
    1699.00, 1999.00,
    '[{"url":"/products/fuchsia-floral-block-print-kurta-set/front.jpg","alt":"Fuchsia Floral Block Print Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/fuchsia-floral-block-print-kurta-set/right.jpg","alt":"Fuchsia Floral Block Print Kurta Set — Right Side Profile","type":"image"},{"url":"/products/fuchsia-floral-block-print-kurta-set/front-2.jpg","alt":"Fuchsia Floral Block Print Kurta Set — Front Pose","type":"image"},{"url":"/products/fuchsia-floral-block-print-kurta-set/back.jpg","alt":"Fuchsia Floral Block Print Kurta Set — Back View","type":"image"},{"url":"/products/fuchsia-floral-block-print-kurta-set/back-2.jpg","alt":"Fuchsia Floral Block Print Kurta Set — Back Detail","type":"image"},{"url":"/products/fuchsia-floral-block-print-kurta-set/video.mp4","poster":"/products/fuchsia-floral-block-print-kurta-set/video-poster.jpg","alt":"Fuchsia Floral Block Print Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Fuchsia Pink","hex":"#D63B6B"}]',
    60, true
  ),
  (
    'Navy Rose Embroidered Kurta Set',
    'navy-rose-embroidered-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'An elegant three-piece navy blue kurta set featuring large bold pink rose embroidery with green leaf motifs scattered across the straight-fit kurta body. V-neckline with silver gota trim, three-quarter sleeves, matching navy trousers and sheer printed chiffon dupatta.',
    1614.00, 1899.00,
    '[{"url":"/products/navy-rose-embroidered-kurta-set/front.jpg","alt":"Navy Rose Embroidered Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/navy-rose-embroidered-kurta-set/back.jpg","alt":"Navy Rose Embroidered Kurta Set — Back View","type":"image"},{"url":"/products/navy-rose-embroidered-kurta-set/left.jpg","alt":"Navy Rose Embroidered Kurta Set — Left Side Profile","type":"image"},{"url":"/products/navy-rose-embroidered-kurta-set/front-detail.jpg","alt":"Navy Rose Embroidered Kurta Set — Embroidery Detail","type":"image"},{"url":"/products/navy-rose-embroidered-kurta-set/front-2.jpg","alt":"Navy Rose Embroidered Kurta Set — Front Pose","type":"image"},{"url":"/products/navy-rose-embroidered-kurta-set/video.mp4","poster":"/products/navy-rose-embroidered-kurta-set/video-poster.jpg","alt":"Navy Rose Embroidered Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Navy Blue","hex":"#1B3D6F"}]',
    60, true
  ),
  (
    'Terracotta Phulkari Anarkali Kurta Set',
    'terracotta-phulkari-anarkali-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A graceful three-piece terracotta rust ensemble featuring a gathered flared anarkali kurta embellished with geometric ivory floral embroidery along the yoke, delicate tassel accents, and scattered star motifs across the body. Styled with matching straight-fit trousers and a sheer slub-textured terracotta dupatta finished with corner tassels.',
    2124.00, 2499.00,
    '[{"url":"/products/terracotta-phulkari-anarkali-kurta-set/front.jpg","alt":"Terracotta Phulkari Anarkali Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/terracotta-phulkari-anarkali-kurta-set/back.jpg","alt":"Terracotta Phulkari Anarkali Kurta Set — Back View","type":"image"},{"url":"/products/terracotta-phulkari-anarkali-kurta-set/back-2.jpg","alt":"Terracotta Phulkari Anarkali Kurta Set — Back Full Flared View","type":"image"},{"url":"/products/terracotta-phulkari-anarkali-kurta-set/right.jpg","alt":"Terracotta Phulkari Anarkali Kurta Set — Right Side Profile","type":"image"},{"url":"/products/terracotta-phulkari-anarkali-kurta-set/front-2.jpg","alt":"Terracotta Phulkari Anarkali Kurta Set — Yoke Embroidery Detail","type":"image"},{"url":"/products/terracotta-phulkari-anarkali-kurta-set/video.mp4","poster":"/products/terracotta-phulkari-anarkali-kurta-set/video-poster.jpg","alt":"Terracotta Phulkari Anarkali Kurta Set — Model Video Shoot","type":"video"}]',
    '["38","42","44","46"]',
    '[{"name":"Terracotta Rust","hex":"#B44B32"}]',
    60, true
  ),
  (
    'Sage Olive Mirrorwork Printed Kurta Set',
    'sage-olive-mirrorwork-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'An understated luxury three-piece ensemble in metallic-sheen sage olive linen silk featuring authentic mirrorwork embroidery along the V-neckline, artisanal rust, ochre, and olive geometric leaf prints along the lower kurta panel and cuffs, and delicate beaded tassel trims. Paired with matching sage straight-fit trousers and a statement woven silk-linen printed dupatta.',
    2549.00, 2999.00,
    '[{"url":"/products/sage-olive-mirrorwork-kurta-set/front.jpg","alt":"Sage Olive Mirrorwork Printed Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/sage-olive-mirrorwork-kurta-set/left.jpg","alt":"Sage Olive Mirrorwork Printed Kurta Set — Left Side Profile","type":"image"},{"url":"/products/sage-olive-mirrorwork-kurta-set/back.jpg","alt":"Sage Olive Mirrorwork Printed Kurta Set — Back View","type":"image"},{"url":"/products/sage-olive-mirrorwork-kurta-set/drape.jpg","alt":"Sage Olive Mirrorwork Printed Kurta Set — Dupatta Drape","type":"image"},{"url":"/products/sage-olive-mirrorwork-kurta-set/video.mp4","poster":"/products/sage-olive-mirrorwork-kurta-set/video-poster.jpg","alt":"Sage Olive Mirrorwork Printed Kurta Set — Model Video Shoot","type":"video"}]',
    '["M","L","XL","XXL","3XL"]',
    '[{"name":"Sage Olive","hex":"#8E977D"}]',
    70, true
  ),
  (
    'Midnight Navy Bandhani Foil Print Kurta Set',
    'midnight-navy-bandhani-foil-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A regal three-piece midnight navy kurta set showcasing antique gold and olive bandhani, paisley, and chevron geometric foil motifs across the straight-fit kurta silhouette. Finished with delicate pearl-and-beaded tassel edging along the three-quarter sleeve cuffs and straight hemline, paired with solid navy trousers and a flowing printed sheer dupatta.',
    2634.00, 3099.00,
    '[{"url":"/products/midnight-navy-bandhani-foil-kurta-set/front.jpg","alt":"Midnight Navy Bandhani Foil Print Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/midnight-navy-bandhani-foil-kurta-set/left.jpg","alt":"Midnight Navy Bandhani Foil Print Kurta Set — Left Side Profile","type":"image"},{"url":"/products/midnight-navy-bandhani-foil-kurta-set/back.jpg","alt":"Midnight Navy Bandhani Foil Print Kurta Set — Back View","type":"image"},{"url":"/products/midnight-navy-bandhani-foil-kurta-set/video.mp4","poster":"/products/midnight-navy-bandhani-foil-kurta-set/video-poster.jpg","alt":"Midnight Navy Bandhani Foil Print Kurta Set — Model Video Shoot","type":"video"}]',
    '["L","XL","XXL"]',
    '[{"name":"Midnight Navy","hex":"#182449"}]',
    45, true
  ),
  (
    'Champagne Beige Kalamkari Kurta Set',
    'beige-teal-kalamkari-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'An exquisite three-piece champagne beige jacquard kurta set accented with a teal floral embroidered yoke framed by real mirrorwork, intricate beaded three-quarter sleeve cuffs, and Kalamkari-inspired teal print along the tassel-trimmed hem. Completed with tailored beige trousers and a luminous Kalamkari floral printed silk-blend dupatta with antique zari woven borders.',
    2294.00, 2699.00,
    '[{"url":"/products/beige-teal-kalamkari-kurta-set/front.jpg","alt":"Champagne Beige Kalamkari Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/beige-teal-kalamkari-kurta-set/back.jpg","alt":"Champagne Beige Kalamkari Kurta Set — Back View","type":"image"},{"url":"/products/beige-teal-kalamkari-kurta-set/left.jpg","alt":"Champagne Beige Kalamkari Kurta Set — Left Side Profile","type":"image"},{"url":"/products/beige-teal-kalamkari-kurta-set/drape.jpg","alt":"Champagne Beige Kalamkari Kurta Set — Dupatta Drape","type":"image"},{"url":"/products/beige-teal-kalamkari-kurta-set/detail.jpg","alt":"Champagne Beige Kalamkari Kurta Set — Yoke Mirrorwork Detail","type":"image"},{"url":"/products/beige-teal-kalamkari-kurta-set/video.mp4","poster":"/products/beige-teal-kalamkari-kurta-set/video-poster.jpg","alt":"Champagne Beige Kalamkari Kurta Set — Model Video Shoot","type":"video"}]',
    '["L","XL","3XL"]',
    '[{"name":"Beige & Teal","hex":"#CBB99B"}]',
    45, true
  ),
  (
    'Buttercream Silk Cutwork Floral Kurta Set',
    'buttercream-silk-cutwork-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A luminous three-piece buttercream gold tissue-silk kurta set embellished with marigold-yellow and blush-peach floral embroidery, delicate gold zari neckline work, and a scalloped cutwork embroidered hemline. Styled with matching straight-fit buttercream trousers and a sheer tissue-silk dupatta with scalloped zari borders and scattered embroidered floral motifs.',
    2294.00, 2699.00,
    '[{"url":"/products/buttercream-silk-cutwork-kurta-set/front.jpg","alt":"Buttercream Silk Cutwork Floral Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/buttercream-silk-cutwork-kurta-set/back.jpg","alt":"Buttercream Silk Cutwork Floral Kurta Set — Back View","type":"image"},{"url":"/products/buttercream-silk-cutwork-kurta-set/left.jpg","alt":"Buttercream Silk Cutwork Floral Kurta Set — Left Side Profile","type":"image"},{"url":"/products/buttercream-silk-cutwork-kurta-set/video.mp4","poster":"/products/buttercream-silk-cutwork-kurta-set/video-poster.jpg","alt":"Buttercream Silk Cutwork Floral Kurta Set — Model Video Shoot","type":"video"}]',
    '["L","XL","3XL"]',
    '[{"name":"Buttercream Gold","hex":"#E6DFBA"}]',
    45, true
  ),
  (
    'Sage Green Organza Zardosi Co-Ord Set',
    'sage-green-organza-zardosi-coord-set',
    '11111111-0000-0000-0000-000000000001',
    'A contemporary two-piece sage green tissue-organza co-ord set featuring a collared tunic with a layered waistcoat-style overlay, side tie accents, and intricate gold-and-silver zardosi, gota, and coin-sequin chest embroidery over sheer three-quarter shimmer sleeves. Paired with matching wide-leg crinkled tissue-organza trousers for effortless fusion elegance.',
    3144.00, 3699.00,
    '[{"url":"/products/sage-green-organza-zardosi-coord-set/front.jpg","alt":"Sage Green Organza Zardosi Co-Ord Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/sage-green-organza-zardosi-coord-set/front-2.jpg","alt":"Sage Green Organza Zardosi Co-Ord Set — Front Standing Pose","type":"image"},{"url":"/products/sage-green-organza-zardosi-coord-set/back.jpg","alt":"Sage Green Organza Zardosi Co-Ord Set — Back View","type":"image"},{"url":"/products/sage-green-organza-zardosi-coord-set/right.jpg","alt":"Sage Green Organza Zardosi Co-Ord Set — Side Profile","type":"image"},{"url":"/products/sage-green-organza-zardosi-coord-set/detail.jpg","alt":"Sage Green Organza Zardosi Co-Ord Set — Zardosi Yoke Detail","type":"image"},{"url":"/products/sage-green-organza-zardosi-coord-set/video.mp4","poster":"/products/sage-green-organza-zardosi-coord-set/video-poster.jpg","alt":"Sage Green Organza Zardosi Co-Ord Set — Model Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Sage Green","hex":"#94AC8A"}]',
    60, true
  );
