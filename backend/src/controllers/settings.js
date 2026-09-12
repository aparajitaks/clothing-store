const { STORE_SETTINGS } = require('../data/seedData');
const { success } = require('../utils/apiResponse');

let currentSettings = { ...STORE_SETTINGS };

const getSettings = (req, res, next) => {
  try {
    return success(res, currentSettings);
  } catch (err) {
    next(err);
  }
};

const updateSettings = (req, res, next) => {
  try {
    currentSettings = { ...currentSettings, ...req.body };
    return success(res, currentSettings, 'Store settings updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
