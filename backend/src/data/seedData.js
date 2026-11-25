/**
 * TEYA COLLECTIONS — Product Catalog
 * All products are original garments with launch discount pricing.
 */

const SEED_CATEGORIES = [
  {
    id: 'cat-6',
    name: 'Kurta Sets',
    slug: 'kurta-sets',
    description: 'Complete kurta sets with coordinated trousers, palazzos, or dupattas.',
    image_url: '/products/rust-embroidered-kurta-set/front.jpg',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Embroidered Kurtas',
    slug: 'embroidered-kurtas',
    description: 'Hand-embroidered kurtas with intricate threadwork and artisanal detailing.',
    image_url: '/products/rust-embroidered-kurta-set/right.jpg',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Festive Kurtas',
    slug: 'festive-kurtas',
    description: 'Celebratory kurtas crafted for weddings, festivals, and auspicious occasions.',
    image_url: '/products/rust-embroidered-kurta-set/front.jpg',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-1',
    name: 'Everyday Kurtas',
    slug: 'everyday-kurtas',
    description: 'Effortlessly wearable kurtas in breathable cotton and linen for daily elegance.',
    image_url: '/hero_luxury.jpg',
    sort_order: 4,
    is_active: true,
  },
];

const SEED_COLLECTIONS = [
  {
    id: 'col-4',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    tagline: 'Fresh silhouettes, just launched',
    description: 'The latest additions to the Teya Collections wardrobe.',
    image_url: '/products/rust-embroidered-kurta-set/front.jpg',
    is_featured: true,
  },
  {
    id: 'col-2',
    name: 'Festive Noor',
    slug: 'festive-noor',
    tagline: 'Luminous kurtas for celebrations',
    description: 'Rich embroidery, jewel tones, and heirloom craftsmanship.',
    image_url: '/products/rust-embroidered-kurta-set/front.jpg',
    is_featured: true,
  },
  {
    id: 'col-1',
    name: 'The Everyday Edit',
    slug: 'everyday-edit',
    tagline: 'Kurtas designed for effortless daily wear',
    description: 'A curated selection of breathable, beautifully draped kurtas that move with you.',
    image_url: '/hero_luxury.jpg',
    is_featured: false,
  },
];

const SEED_PRODUCTS = [
  {
    id: 'prod-1',
    category_id: 'cat-6',
    collection_id: 'col-4',
    name: 'Rust Embroidered Kurta Set',
    slug: 'rust-embroidered-kurta-set',
    description: 'A striking two-piece ensemble in a rich rust hue, featuring a button-down tunic with a mandarin collar, 3/4th sleeves, and intricate floral cutwork scalloped embroidery along the hem and sleeve cuffs. Complemented with relaxed straight-fit trousers for effortless festive and celebratory elegance.',
    price: 1784, // 2099 - 15% discount = 1784
    compare_price: 2099, // Original MRP
    discount_percent: 15,
    images: [
      { url: '/products/rust-embroidered-kurta-set/front.jpg', alt: 'Rust Embroidered Kurta Set — Front View', isPrimary: true, type: 'image' },
      { url: '/products/rust-embroidered-kurta-set/back.jpg', alt: 'Rust Embroidered Kurta Set — Back View', type: 'image' },
      { url: '/products/rust-embroidered-kurta-set/right.jpg', alt: 'Rust Embroidered Kurta Set — Right Side Profile', type: 'image' },
      { url: '/products/rust-embroidered-kurta-set/left.jpg', alt: 'Rust Embroidered Kurta Set — Left Side Profile', type: 'image' },
      { url: '/products/rust-embroidered-kurta-set/video.mp4', poster: '/products/rust-embroidered-kurta-set/video-poster.jpg', alt: 'Rust Embroidered Kurta Set — Video Shoot', type: 'video' },
    ],
    video: '/products/rust-embroidered-kurta-set/video.mp4',
    video_poster: '/products/rust-embroidered-kurta-set/video-poster.jpg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Rust Orange', hex: '#C2542D' },
    ],
    variants: [
      { size: 'M',   color: 'Rust Orange', sku: 'TC-RST-M',   stock: 15 },
      { size: 'L',   color: 'Rust Orange', sku: 'TC-RST-L',   stock: 20 },
      { size: 'XL',  color: 'Rust Orange', sku: 'TC-RST-XL',  stock: 15 },
      { size: 'XXL', color: 'Rust Orange', sku: 'TC-RST-XXL', stock: 10 },
    ],
    stock: 60,
    is_featured: true,
    is_active: true,
    material: 'Pure Silk Blend Kurta with Matching Relaxed Trousers',
    care_instructions: 'Gentle hand wash in cold water or dry clean recommended. Iron inside out on medium heat.',
    fabric: 'Pure Silk Blend',
    fit: 'Relaxed Straight Fit',
    neckline: 'Mandarin Collar with Front Button Placket',
    sleeves: 'Three-Quarter Sleeves with Scalloped Floral Embroidery',
    kurta_length: 'Midi (40 inches)',
    occasion: 'Festive, Celebrations, Evening Gatherings',
    size_chart: [
      { size: 'M',   chest: '38', waist: '32', hip: '42', kurta_length: '40', shoulder: '15.5' },
      { size: 'L',   chest: '40', waist: '34', hip: '44', kurta_length: '41', shoulder: '16' },
      { size: 'XL',  chest: '42', waist: '36', hip: '46', kurta_length: '41', shoulder: '16.5' },
      { size: 'XXL', chest: '44', waist: '38', hip: '48', kurta_length: '42', shoulder: '17' },
    ],
    meta_title: 'Rust Embroidered Kurta Set | TEYA COLLECTIONS',
    meta_description: 'Pure silk blend rust embroidered kurta set with scalloped floral hem, mandarin collar, and matching trousers. Launch offer flat 15% discount.',
  },
];

const SEED_COUPONS = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for your first kurta',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1999,
    max_discount_amount: 1500,
    is_active: true,
    usage_limit: 1000,
    times_used: 18,
    expires_at: '2028-12-31T23:59:59Z',
  },
  {
    code: 'TEYA20',
    description: '₹200 off on orders above ₹2500',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 2500,
    max_discount_amount: 200,
    is_active: true,
    usage_limit: 500,
    times_used: 43,
    expires_at: '2028-06-30T23:59:59Z',
  },
];

const STORE_SETTINGS = {
  store_name: 'TEYA COLLECTIONS',
  brand_tagline: 'Timeless kurtas, refined for today.',
  brand_description: 'TEYA COLLECTIONS — Premium Indian Kurtas',
  support_email: 'concierge@teyacollections.com',
  support_phone: '+91 98765 43210',
  currency: 'INR',
  currency_symbol: '₹',
  free_shipping_threshold: 2999,
  default_shipping_fee: 149,
  enable_cod: true,
  enable_coupons: true,
  tax_rate: 0.12,
  return_window_days: 7,
};

module.exports = {
  SEED_CATEGORIES,
  SEED_COLLECTIONS,
  SEED_PRODUCTS,
  SEED_COUPONS,
  STORE_SETTINGS,
};
