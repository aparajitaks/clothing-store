const supabase = require('../config/db');
const { forbidden } = require('../utils/apiResponse');

/**
 * Must be used AFTER authenticate middleware.
 * Checks that the user has role='admin' in profiles table.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return forbidden(res, 'Admin access required');
    }

    req.user.role = 'admin';
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    return forbidden(res, 'Access denied');
  }
};

module.exports = { requireAdmin };
