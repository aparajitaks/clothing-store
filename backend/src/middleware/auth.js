// Reuse the singleton service-role client; never create one per-request
const supabase = require('../config/db');
const { unauthorized } = require('../utils/apiResponse');

/**
 * Verifies Supabase JWT from Authorization header.
 * Attaches req.user = { id, email } on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!supabase) {
      // Supabase not configured — cannot verify JWT
      return unauthorized(res, 'Authentication service unavailable');
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return unauthorized(res, 'Invalid or expired token');
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    req.token = token;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return unauthorized(res, 'Authentication failed');
  }
};

/**
 * Optional auth — attaches user if token present, continues either way
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuthenticate };
