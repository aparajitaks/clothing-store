const supabase = require('../config/db');
const { forbidden } = require('../utils/apiResponse');

/**
 * Must be used AFTER authenticate middleware.
 * Checks that the user has role='admin' in profiles table.
 * If Supabase is unavailable, access is denied (fail-secure).
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!supabase) {
      // Fail-secure: if DB is unavailable we cannot verify role, deny access
      return forbidden(res, 'Admin verification service unavailable');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return forbidden(res, 'Admin access required');
    }

    req.user.role = 'admin';
    return next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    return forbidden(res, 'Access denied');
  }
};

module.exports = { requireAdmin };
