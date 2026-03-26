const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['ADJUST_STOCK', 'HANDOVER_3PL', 'PACK_ORDER', 'PLACE_ORDER'],
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantityChanged: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = InventoryLog;
