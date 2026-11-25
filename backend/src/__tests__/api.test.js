/**
 * TeyaCollections Backend — Test Suite
 * Tests: Authentication, Authorization, Products, Orders (IDOR),
 *        Payments, Coupons, Inventory, Admin access control
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');

// ─── Mock Supabase so tests run offline ──────────────────────────────────────
jest.mock('../config/db', () => {
  const mockUser  = { id: 'user-123',  email: 'test@example.com' };
  const mockAdmin = { id: 'admin-456', email: 'admin@example.com' };

  const mockSupabase = {
    auth: {
      getUser: jest.fn(async (token) => {
        if (token === 'valid-user-token')  return { data: { user: mockUser  }, error: null };
        if (token === 'valid-admin-token') return { data: { user: mockAdmin }, error: null };
        return { data: { user: null }, error: { message: 'Invalid token' } };
      }),
    },
    from: jest.fn(() => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { role: 'customer' }, error: null }),
      };
      return chain;
    }),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  return mockSupabase;
});

const app = require('../index');
const supabase = require('../config/db');

const authHeaders  = (tok) => ({ Authorization: `Bearer ${tok}` });
const userAuth     = authHeaders('valid-user-token');

// ─────────────────────────────────────────────────────────────────────────────
describe('Health Check', () => {
  test('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/unknown → 404', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Authentication Middleware', () => {
  test('GET /api/cart — no token → 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  test('GET /api/cart — bad token → 401', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Bearer invalid-token-xyz');
    expect(res.status).toBe(401);
  });

  test('GET /api/profiles/me — no token → 401', async () => {
    const res = await request(app).get('/api/profiles/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/wishlist — no token → 401', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Admin Authorization', () => {
  test('GET /api/admin/dashboard — no token → 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  test('GET /api/admin/dashboard — customer token → 403', async () => {
    // supabase.from returns role: customer (default mock)
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set(userAuth);
    expect(res.status).toBe(403);
  });

  test('GET /api/admin/products — customer token → 403', async () => {
    const res = await request(app)
      .get('/api/admin/products')
      .set(userAuth);
    expect(res.status).toBe(403);
  });

  test('POST /api/admin/products — no token → 401', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({ name: 'Test', slug: 'test', price: 999 });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Products API', () => {
  test('GET /api/products — 200 with pagination', async () => {
    // Supabase returns error → falls back to seed data
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
      then: jest.fn((cb) => cb({ data: null, error: { message: 'fail' }, count: 0 })),
    }));
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data).toHaveProperty('pagination');
  });

  test('GET /api/products/:slug — 404 for unknown slug', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    }));
    const res = await request(app).get('/api/products/no-such-slug-xyz-abc');
    expect(res.status).toBe(404);
  });

  test('GET /api/categories — 200', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb({ data: null, error: { message: 'fail' } })),
    }));
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Coupon Validation', () => {
  test('Valid WELCOME10 on ₹2500 → discount > 0', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'WELCOME10', subtotal: 2500 });
    expect(res.status).toBe(200);
    expect(res.body.data.discountAmount).toBeGreaterThan(0);
  });

  test('WELCOME10 discount capped at ₹1500 on large order', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'WELCOME10', subtotal: 20000 });
    expect(res.status).toBe(200);
    expect(res.body.data.discountAmount).toBe(1500);
  });

  test('TEYA20 → fixed ₹200 discount', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'TEYA20', subtotal: 3000 });
    expect(res.status).toBe(200);
    expect(res.body.data.discountAmount).toBe(200);
  });

  test('Invalid coupon → 400', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'FAKECODE999', subtotal: 3000 });
    expect(res.status).toBe(400);
  });

  test('Min order not met → 400 with message', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'WELCOME10', subtotal: 500 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/minimum/i);
  });

  test('Empty code → 400', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ subtotal: 2500 });
    expect(res.status).toBe(400);
  });

  test('Case insensitive — welcome10 same as WELCOME10', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'welcome10', subtotal: 2500 });
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Order Creation — Validation', () => {
  const validAddress = {
    name: 'Test User', phone: '9876543210',
    line1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
  };

  test('Missing items → 400', async () => {
    const res = await request(app)
      .post('/api/orders/create')
      .set(userAuth)
      .send({ shippingAddress: validAddress });
    expect(res.status).toBe(400);
  });

  test('Empty items array → 400', async () => {
    const res = await request(app)
      .post('/api/orders/create')
      .set(userAuth)
      .send({ items: [], shippingAddress: validAddress });
    expect(res.status).toBe(400);
  });

  test('Missing address → 400', async () => {
    const res = await request(app)
      .post('/api/orders/create')
      .set(userAuth)
      .send({ items: [{ productId: 'x', quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  test('Nonexistent product → 400', async () => {
    const res = await request(app)
      .post('/api/orders/create')
      .set(userAuth)
      .send({
        items: [{ productId: 'definitely-not-a-real-product-id-xyz', quantity: 1 }],
        shippingAddress: validAddress,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('Missing address fields (city) → 400', async () => {
    const noCity = { name: 'T', phone: '9876543210', line1: '1 St', state: 'MH', pincode: '400001' };
    const res = await request(app)
      .post('/api/orders/create')
      .set(userAuth)
      .send({ items: [{ productId: 'x', quantity: 1 }], shippingAddress: noCity });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Order IDOR Protection', () => {
  test('GET /api/orders/ — unauthenticated → empty array (not 401)', async () => {
    const res = await request(app).get('/api/orders/');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test('GET /api/orders/:id — nonexistent → 404 (not info about ownership)', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    }));
    const res = await request(app)
      .get('/api/orders/00000000-0000-0000-0000-000000000000')
      .set(userAuth);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Payment Verification — Security', () => {
  test('Missing paymentId → 400', async () => {
    const res = await request(app)
      .post('/api/orders/verify')
      .send({ razorpayOrderId: 'order_test123' });
    expect(res.status).toBe(400);
  });

  test('Missing orderId → 400', async () => {
    const res = await request(app)
      .post('/api/orders/verify')
      .send({ razorpayPaymentId: 'pay_test456' });
    expect(res.status).toBe(400);
  });

  test('Tampered real signature → verification fails → 400', async () => {
    const res = await request(app)
      .post('/api/orders/verify')
      .set(userAuth)
      .send({
        razorpayOrderId:   'order_realtest123',
        razorpayPaymentId: 'pay_realtest456',
        razorpaySignature: 'completely_forged_signature_not_valid',
      });
    // Should fail — either 400 (sig mismatch) or 404 (order not found)
    expect([400, 404]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Inventory Service Unit Tests', () => {
  const inventoryService = require('../services/inventoryService');

  test('Unknown product → available=false', () => {
    const result = inventoryService.checkVariantStock('no-such-product', 'M', 'Blue', 1);
    expect(result.available).toBe(false);
    expect(result.message).toMatch(/not found/i);
  });

  test('deductStock cannot produce negative stock', () => {
    const products = inventoryService.getProducts();
    if (!products.length) return;
    const p = products.find((x) => !x.variants?.length);
    if (!p) return;
    const bigQty = p.stock + 9999;
    inventoryService.deductStock([{ product_id: p.id, quantity: bigQty }]);
    expect(p.stock).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Shipping Service Unit Tests', () => {
  const shippingService = require('../services/shippingService');

  test('Valid 6-digit PIN → deliverable', () => {
    expect(shippingService.checkPincode('400001').deliverable).toBe(true);
  });

  test('5-digit PIN → not deliverable', () => {
    expect(shippingService.checkPincode('40000').deliverable).toBe(false);
  });

  test('Alpha PIN → not deliverable', () => {
    expect(shippingService.checkPincode('ABCDEF').deliverable).toBe(false);
  });

  test('Above threshold → free shipping', () => {
    const r = shippingService.calculateShippingFee(3500);
    expect(r.fee).toBe(0);
    expect(r.isFree).toBe(true);
  });

  test('Below threshold → paid shipping', () => {
    const r = shippingService.calculateShippingFee(500);
    expect(r.fee).toBeGreaterThan(0);
    expect(r.isFree).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Tax Service Unit Tests', () => {
  const taxService = require('../services/taxService');

  test('5% GST on ₹800 item', () => {
    const result = taxService.calculateTax(
      [{ product_name: 'Test', unit_price: 800, quantity: 1 }], true, 'Karnataka'
    );
    expect(result.itemsTax[0].gstRate).toBe(5);
    expect(result.totalTax).toBeGreaterThan(0);
  });

  test('12% GST on ₹2000 item', () => {
    const result = taxService.calculateTax(
      [{ product_name: 'Test', unit_price: 2000, quantity: 1 }], true, 'Karnataka'
    );
    expect(result.itemsTax[0].gstRate).toBe(12);
  });

  test('Karnataka → CGST+SGST split, no IGST', () => {
    const result = taxService.calculateTax(
      [{ product_name: 'Test', unit_price: 2000, quantity: 1 }], true, 'Karnataka'
    );
    expect(result.cgst).toBeGreaterThan(0);
    expect(result.sgst).toBeGreaterThan(0);
    expect(result.igst).toBe(0);
  });

  test('Non-Karnataka → IGST only', () => {
    const result = taxService.calculateTax(
      [{ product_name: 'Test', unit_price: 2000, quantity: 1 }], true, 'Maharashtra'
    );
    expect(result.igst).toBeGreaterThan(0);
    expect(result.cgst).toBe(0);
  });
});
