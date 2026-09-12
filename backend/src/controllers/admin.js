const supabase = require('../config/db');
const { success, created, notFound, badRequest } = require('../utils/apiResponse');
const inventoryService = require('../services/inventoryService');
const { localOrders } = require('./orders');

/** GET /api/admin/products */
const listProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    if (supabase) {
      try {
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
          .from('products')
          .select('*, categories(id, name, slug)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (search) query = query.ilike('name', `%${search}%`);

        const { data, error, count } = await query;
        if (!error && data) return success(res, { products: data, total: count });
      } catch (e) {
        // fallback to memory
      }
    }

    let products = inventoryService.getProducts();
    if (search) {
      products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return success(res, { products, total: products.length });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/products */
const createProduct = async (req, res, next) => {
  try {
    const { name, slug, category_id, description, price, compare_price, images, sizes, colors, stock, variants, material, care_instructions, size_chart, is_featured } = req.body;
    if (!name || !slug || price === undefined) return badRequest(res, 'name, slug, and price are required');

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name,
            slug,
            category_id,
            description,
            price,
            compare_price,
            images: images || [],
            sizes: sizes || [],
            colors: colors || [],
            stock: stock || 0,
            is_featured: is_featured || false,
          })
          .select()
          .single();

        if (!error && data) return created(res, data);
      } catch (e) {
        // fallback to memory
      }
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      name,
      slug,
      category_id: category_id || 'cat-1',
      description,
      price: Number(price),
      compare_price: compare_price ? Number(compare_price) : null,
      images: images || [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', isPrimary: true }],
      sizes: sizes || ['S', 'M', 'L'],
      colors: colors || [{ name: 'Ivory Cream', hex: '#FDFBF7' }],
      stock: Number(stock || 10),
      variants: variants || [],
      material: material || 'Pure Handloom Silk',
      care_instructions: care_instructions || 'Dry clean only',
      size_chart: size_chart || [],
      is_featured: Boolean(is_featured),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    inventoryService.getProducts().unshift(newProd);
    return created(res, newProd);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/products/:id */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return success(res, data, 'Product updated');
      } catch (e) {
        // fallback
      }
    }

    const prod = inventoryService.getProductBySlug(id);
    if (!prod) return notFound(res, 'Product not found');

    Object.assign(prod, updates);
    return success(res, prod, 'Product updated');
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/products/:id */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      try {
        await supabase.from('products').update({ is_active: false }).eq('id', id);
      } catch (e) {
        // quiet
      }
    }

    const prod = inventoryService.getProductBySlug(id);
    if (prod) prod.is_active = false;

    return success(res, {}, 'Product archived');
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/orders */
const listOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*), profiles(full_name, phone)', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error, count } = await query;
        if (!error && data && data.length > 0) return success(res, { orders: data, total: count });
      } catch (e) {
        // fallback to local
      }
    }

    let orders = [...localOrders];
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }
    return success(res, { orders, total: orders.length });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/orders/:id/status */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, courier } = req.body;
    const validStatuses = [
      'pending',
      'payment_initiated',
      'paid',
      'payment_failed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'return_requested',
      'returned',
      'refunded',
    ];
    if (!validStatuses.includes(status)) return badRequest(res, 'Invalid status');

    const order = localOrders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      if (trackingNumber) {
        order.tracking = {
          trackingNumber,
          courier: courier || 'BlueDart Air',
          trackingUrl: `https://www.bluedart.com/tracking?trackNumber=${trackingNumber}`,
        };
      }
    }

    if (supabase) {
      try {
        await supabase.from('orders').update({ status }).eq('id', id);
      } catch (e) {
        // quiet
      }
    }

    return success(res, order || { id, status }, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/orders/:id/return-process */
const processReturnRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const order = localOrders.find((o) => o.id === id);
    if (!order || !order.return_request) {
      return notFound(res, 'Return request not found');
    }

    order.return_request.status = action === 'approve' ? 'approved' : 'rejected';
    order.status = action === 'approve' ? 'returned' : 'delivered';

    if (action === 'approve') {
      // Restore variant stock
      inventoryService.restoreStock(order.return_request.selectedItems || order.order_items);
    }

    return success(res, order.return_request, `Return request ${action}d successfully`);
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/dashboard */
const getDashboard = async (req, res, next) => {
  try {
    const products = inventoryService.getProducts().filter((p) => p.is_active);
    const lowStock = products.filter((p) => p.stock < 10);

    const orders = localOrders;
    const paidOrders = orders.filter((o) => ['paid', 'processing', 'packed', 'shipped', 'delivered'].includes(o.status));
    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pendingOrders = orders.filter((o) => ['pending', 'payment_initiated', 'processing'].includes(o.status)).length;
    const returnRequests = orders.filter((o) => o.return_request && o.return_request.status === 'review_pending').length;

    return success(res, {
      totalOrders: orders.length,
      totalRevenue: parseFloat(revenue.toFixed(2)),
      totalProducts: products.length,
      pendingOrders,
      returnRequests,
      lowStockProducts: lowStock.map((p) => ({ id: p.id, name: p.name, stock: p.stock, slug: p.slug })),
      recentOrders: orders.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  processReturnRequest,
  getDashboard,
  listReturns,
  updateReturnStatus,
};

// ---------------------------------------------------------------
// In-memory returns store for dev mode
// ---------------------------------------------------------------
const memoryReturns = [
  { id: 'RET-001', order_id: 'ORD-20241201-001', customer_name: 'Priya Sharma', customer_email: 'priya@example.com', item_name: 'Pure Silk Kanjivaram Saree', reason: 'Size issue', status: 'pending', refund_amount: 3999, created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 'RET-002', order_id: 'ORD-20241128-012', customer_name: 'Anita Mehta',  customer_email: 'anita@example.com', item_name: 'Chanderi Cotton Salwar Kameez', reason: 'Quality mismatch', status: 'approved', refund_amount: 2199, created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 'RET-003', order_id: 'ORD-20241125-007', customer_name: 'Kavita Nair',  customer_email: 'kavita@example.com', item_name: 'Handloom Banarasi Lehenga', reason: 'Wrong colour dispatched', status: 'refunded', refund_amount: 6499, created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
];

/** GET /api/admin/returns */
async function listReturns(req, res, next) {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('returns')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return success(res, data);
      } catch (e) { /* fallback */ }
    }
    return success(res, memoryReturns);
  } catch (err) { next(err); }
}

/** PATCH /api/admin/returns/:id */
async function updateReturnStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'refunded', 'rejected'];
    if (!allowed.includes(status)) return badRequest(res, 'Invalid status');

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('returns')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return success(res, data, 'Return status updated');
      } catch (e) { /* fallback */ }
    }

    const ret = memoryReturns.find((r) => r.id === id);
    if (ret) ret.status = status;
    return success(res, ret || { id, status }, 'Return status updated');
  } catch (err) { next(err); }
}
