/**
 * TEYA COLLECTIONS — Live Product Catalog
 * Original collection catalog with launch pricing.
 */

export const DEFAULT_CATEGORIES = [
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
    description: 'Effortlessly wearable kurtas in breathable fabrics for daily elegance.',
    image_url: '/hero_luxury.jpg',
    sort_order: 4,
    is_active: true,
  },
];

export const DEFAULT_COLLECTIONS = [
  {
    id: 'col-4',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    tagline: 'Fresh silhouettes, just launched',
    description: 'The latest additions to the Teya Collections festive & daily wardrobe.',
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
    tagline: 'Kurtas designed for effortless wear',
    description: 'A curated selection of breathable, beautifully draped kurtas.',
    image_url: '/hero_luxury.jpg',
    is_featured: false,
  },
];

export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    category_id: 'cat-6',
    category_slug: 'kurta-sets',
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
      { url: '/products/rust-embroidered-kurta-set/video.mp4', poster: '/products/rust-embroidered-kurta-set/video-poster.jpg', alt: 'Rust Embroidered Kurta Set — Model Video Shoot', type: 'video' },
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
    categories: { name: 'Kurta Sets', slug: 'kurta-sets' },
    collection: { name: 'New Arrivals', slug: 'new-arrivals' },
    material: 'Pure Silk Blend Kurta with Matching Relaxed Trousers',
    care_instructions: 'Gentle hand wash in cold water or dry clean recommended. Iron inside out on low to medium heat.',
    fabric: 'Pure Silk Blend',
    fit: 'Relaxed Straight Fit',
    neckline: 'Mandarin Collar with Front Button Placket',
    sleeves: 'Three-Quarter Sleeves with Scalloped Floral Embroidery',
    kurta_length: 'Midi (40 inches)',
    occasion: 'Festive, Celebrations, Evening Gatherings, Family Occasions',
    size_chart: [
      { size: 'M',   chest: '38', waist: '32', hip: '42', kurta_length: '40', shoulder: '15.5' },
      { size: 'L',   chest: '40', waist: '34', hip: '44', kurta_length: '41', shoulder: '16' },
      { size: 'XL',  chest: '42', waist: '36', hip: '46', kurta_length: '41', shoulder: '16.5' },
      { size: 'XXL', chest: '44', waist: '38', hip: '48', kurta_length: '42', shoulder: '17' },
    ],
    meta_title: 'Rust Embroidered Kurta Set | TEYA COLLECTIONS',
    meta_description: 'Pure silk blend rust embroidered kurta set with scalloped floral hem, mandarin collar, and matching trousers. Launch offer 15% off.',
  },
];
