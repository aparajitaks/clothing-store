const shippingService = require('../services/shippingService');
const { success, badRequest } = require('../utils/apiResponse');

const checkPincode = (req, res, next) => {
  try {
    const { pincode } = req.params;
    const result = shippingService.checkPincode(pincode);
    if (!result.deliverable) {
      return badRequest(res, result.message);
    }
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkPincode };
