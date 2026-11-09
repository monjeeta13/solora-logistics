// backend/src/controllers/pincodeController.js
const { getPincodeDetails } = require('../utils/pincodeService');

const lookupPincode = (req, res) => {
  const { pincode } = req.params;
  const details = getPincodeDetails(pincode);

  if (!details) {
    return res.status(404).json({ 
      error: 'PIN code not serviceable or invalid.' 
    });
  }

  res.status(200).json(details);
};

module.exports = { lookupPincode };