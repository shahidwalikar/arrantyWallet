const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Creates a reference to the User model
  },
  itemName: {
    type: String,
    required: [true, 'Please add an item name'],
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Please add a purchase date'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add an expiry date'],
  },
  customerCareNumber: {
    type: String,
    default: '',
  },
  receiptImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
}, {
  timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
