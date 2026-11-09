// backend/src/utils/courierConfig.js

const COURIER_OPTIONS = [
  {
    id: 'express',
    name: 'Express Delivery',
    price: 180,
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
    description: 'Best for urgent shipments'
  },
  {
    id: 'standard',
    name: 'Standard Delivery',
    price: 120,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    description: 'Best for economical shipping'
  },
  {
    id: 'eco',
    name: 'Eco Delivery',
    price: 90,
    estimatedDaysMin: 4,
    estimatedDaysMax: 6,
    description: 'Best for lower-cost, environmentally conscious shipping'
  }
];

const getCourierById = (id) => COURIER_OPTIONS.find(c => c.id === id);

module.exports = { COURIER_OPTIONS, getCourierById };