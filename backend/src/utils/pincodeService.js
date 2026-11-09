// backend/src/utils/pincodeService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const pincodeData = new Map();

const loadPincodes = () => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, '../data/pincodes.csv');
    
    if (!fs.existsSync(filepath)) {
      console.warn('⚠️ Pincode CSV not found at src/data/pincodes.csv. Pincode lookups will fail.');
      return resolve();
    }

    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (row) => {
        const pin = row.pincode?.trim();
        if (!pin) return;

        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);
        const hasValidCoords = !isNaN(lat) && !isNaN(lng);

        const existing = pincodeData.get(pin);

        // Store if not exists, OR overwrite if existing lacks coords but current row has them
        if (!existing || (!existing.hasCoords && hasValidCoords)) {
          pincodeData.set(pin, {
            district: row.district?.trim(),
            state: row.statename?.trim(),
            lat: hasValidCoords ? lat : null,
            lng: hasValidCoords ? lng : null,
            hasCoords: hasValidCoords
          });
        }
      })
      .on('end', () => {
        console.log(`📍 Loaded ${pincodeData.size} unique PIN codes into memory.`);
        resolve();
      })
      .on('error', reject);
  });
};

const getPincodeDetails = (pincode) => {
  return pincodeData.get(pincode?.toString().trim());
};

module.exports = { loadPincodes, getPincodeDetails };