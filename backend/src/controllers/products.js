const supabase = require('../config/db');
const { success, notFound, badRequest } = require('../utils/apiResponse');
const inventoryService = require('../services/inventoryService');
const { SEED_CATEGORIES, SEED_COLLECTIONS } = require('../data/seedData');

/**
 * Filter & sort products locally from seed data when offline / dev mode
 */
const filterLocalProducts = ({
  category,
  collection,
  featured,
  search,
  sort = 'created_at',
  order = 'desc',
  page = 1,
  limit = 12,
  minPrice,
  maxPrice,
  size,
  color,
  inStock,
}) => {
  let list = inventoryService.getProducts().map((p) => {
    const cat = SEED_CATEGORIES.find((c) => c.id === p.category_id);
    const col = SEED_COLLECTIONS.find((c) => c.id === p.collection_id);
    return {
      ...p,
      categories: cat || p.categories,
      category_slug: cat?.slug || p.category_slug,
      collection: col || p.collection,
    };
  });

  if (category) {
    list = list.filter(
      (p) =>
        (p.categories && p.categories.slug === category) ||
        p.category_slug === category ||
        p.category_id === category ||
        (SEED_CATEGORIES.find((c) => c.slug === category)?.id === p.category_id)
    );
  }

  if (collection) {
    list = list.filter(
      (p) =>
        p.collection_id === collection ||
        (p.collection && p.collection.slug === collection) ||
        SEED_COLLECTIONS.find((c) => c.slug === collection)?.id === p.collection_id
    );
  }

  if (featured === 'true' || featured === true) {
    list = list.filter((p) => p.is_featured);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    list = list.filter((p) => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    list = list.filter((p) => p.price <= parseFloat(maxPrice));
  }

  if (size) {
    list = list.filter((p) => p.sizes?.includes(size));
  }

  if (color) {
    list = list.filter((p) =>
      p.colors?.some((c) => (typeof c === 'string' ? c : c.name).toLowerCase() === color.toLowerCase())
    );
  }

  if (inStock === 'true' || inStock === true) {
    list = list.filter((p) => p.stock > 0);
  }

  // Sorting
  list = [...list].sort((a, b) => {
    if (sort === 'price') {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    }
    if (sort === 'name') {
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    // Default or newest / featured
    return order === 'asc' ? 1 : -1;
  });

  const total = list.length;
  const from = (parseInt(page) - 1) * parseInt(limit);
  const pagedList = list.slice(from, from + parseInt(limit));

  return {
    products: pagedList,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      collection,
      featured,
      search,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      size,
      color,
      inStock,
    } = req.query;

    if (supabase) {
      try {
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
          .from('products')
          .select(`
            id, name, slug, price, compare_price, images, sizes, colors, stock, is_featured, material,
            categories(id, name, slug)
          `, { count: 'exact' })
          .eq('is_active', true)
          .range(from, to);

        if (category) query = query.eq('categories.slug', category);
        if (featured === 'true') query = query.eq('is_featured', true);
        if (search) query = query.ilike('name', `%${search}%`);
        if (minPrice) query = query.gte('price', parseFloat(minPrice));
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

        const allowedSortFields = ['created_at', 'price', 'name'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
        query = query.order(sortField, { ascending: order === 'asc' });

        const { data, error, count } = await query;
        if (!error && data && data.length > 0) {
          return success(res, {
            products: data,
            pagination: {
              total: count,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(count / parseInt(limit)),
            },
          });
        }
      } catch (err) {
        console.warn('Supabase products fetch failed, using seed data fallback:', err.message);
      }
    }

    // Fallback mode
    const fallbackResult = filterLocalProducts({
      category,
      collection,
      featured,
      search,
      sort,
      order,
      page,
      limit,
      minPrice,
      maxPrice,
      size,
      color,
      inStock,
    });
    return success(res, fallbackResult);
  } catch (err) {
    next(err);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (supabase) {
      try {
        const { data: product, error } = await supabase
          .from('products')
          .select(`*, categories(id, name, slug)`)
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (!error && product) {
          // Fetch reviews
          const { data: reviews } = await supabase
            .from('reviews')
            .select('id, rating, title, comment, created_at, profiles(full_name, avatar_url)')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
            .limit(10);

          const avgRating = reviews?.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 4.9;

          return success(res, { ...product, reviews: reviews || [], avgRating: parseFloat(avgRating.toFixed(1)) });
        }
      } catch (err) {
        // quiet fallback
      }
    }

    // Fallback to local
    const p = inventoryService.getProductBySlug(slug);
    if (!p) return notFound(res, 'Garment not found');

    const cat = SEED_CATEGORIES.find((c) => c.id === p.category_id);
    const col = SEED_COLLECTIONS.find((c) => c.id === p.collection_id);

    return success(res, {
      ...p,
      categories: cat,
      collection: col,
      reviews: [
        {
          id: 'rev-1',
          rating: 5,
          title: 'Exquisite Weave & Royal Drape',
          comment: 'The craftsmanship on this piece is nothing short of imperial. Delivered with bespoke care and muslin packaging.',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          profiles: { full_name: 'Ananya Sharma' },
        },
      ],
      avgRating: 4.9,
    });
  } catch (err) {
    next(err);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, compare_price, images, sizes, colors, stock, categories(id, name, slug)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(8);

        if (!error && data && data.length > 0) return success(res, data);
      } catch (err) {
        // fallback
      }
    }

    const featured = inventoryService
      .getProducts()
      .filter((p) => p.is_featured)
      .slice(0, 8)
      .map((p) => {
        const cat = SEED_CATEGORIES.find((c) => c.id === p.category_id);
        return {
          ...p,
          categories: cat || p.categories,
          category_slug: cat?.slug || p.category_slug,
        };
      });
    return success(res, featured);
  } catch (err) {
    next(err);
  }
};

const getCollections = async (req, res, next) => {
  try {
    return success(res, SEED_COLLECTIONS);
  } catch (err) {
    next(err);
  }
};

const getCollectionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const collection = SEED_COLLECTIONS.find((c) => c.slug === slug);
    if (!collection) return notFound(res, 'Collection not found');

    const products = inventoryService.getProducts().filter((p) => p.collection_id === collection.id);
    return success(res, { collection, products });
  } catch (err) {
    next(err);
  }
};

const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return success(res, {
        trending: ['Chanderi Kurta', 'Embroidered Kurta', 'Cotton Everyday Kurta', 'Festive Kurta Set', 'Linen Kurta'],
        categories: SEED_CATEGORIES.map((c) => c.name),
      });
    }

    const query = q.toLowerCase();
    const matches = inventoryService
      .getProducts()
      .filter((p) => p.name.toLowerCase().includes(query) || p.material?.toLowerCase().includes(query))
      .slice(0, 6)
      .map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, image: p.images?.[0]?.url }));

    return success(res, { results: matches, query: q });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getCollections,
  getCollectionBySlug,
  getSearchSuggestions,
};
