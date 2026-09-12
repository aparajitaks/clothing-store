const { createClient } = require('@supabase/supabase-js');
const { unauthorized } = require('../utils/apiResponse');

/**
 * Verifies Supabase JWT from Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Create a temporary client with the user's JWT to verify it
    const supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

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
