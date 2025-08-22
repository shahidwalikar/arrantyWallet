const Item = require('../models/ItemModel');
const cloudinary = require('../config/cloudinary');

// Helper function to upload image buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'warranty-wallet' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};

// @desc    Create a new warranty item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  const { itemName, purchaseDate, expiryDate, customerCareNumber } = req.body;
  
  if (!itemName || !purchaseDate || !expiryDate) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a receipt image.' });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer);

    const item = new Item({
      user: req.user._id,
      itemName,
      purchaseDate,
      expiryDate,
      customerCareNumber,
      receiptImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Could not create item.' });
  }
};

// @desc    Get all items for a logged-in user
// @route   GET /api/items
// @access  Private
const getUserItems = async (req, res) => {
  const items = await Item.find({ user: req.user._id }).sort({ expiryDate: 1 });
  res.json(items);
};

// @desc    Update a warranty item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
    const { itemName, purchaseDate, expiryDate, customerCareNumber } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the item belongs to the user
    if (item.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    item.itemName = itemName || item.itemName;
    item.purchaseDate = purchaseDate || item.purchaseDate;
    item.expiryDate = expiryDate || item.expiryDate;
    item.customerCareNumber = customerCareNumber || item.customerCareNumber;

    // If a new file is uploaded, replace the old one
    if (req.file) {
        try {
            // Delete old image from Cloudinary
            await cloudinary.uploader.destroy(item.receiptImage.public_id);
            // Upload new image
            const newImage = await uploadToCloudinary(req.file.buffer);
            item.receiptImage = {
                public_id: newImage.public_id,
                url: newImage.secure_url,
            };
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating image.' });
        }
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
};


// @desc    Delete a warranty item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure the item belongs to the user trying to delete it
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete image from Cloudinary first
    await cloudinary.uploader.destroy(item.receiptImage.public_id);

    // Then remove the item from the database
    await item.deleteOne();

    res.json({ message: 'Item removed successfully' });
  // in server/controllers/itemController.js -> createItem function
} catch (error) {
    // THIS IS THE IMPORTANT CHANGE
    console.error('--- DETAILED CREATE ITEM ERROR ---', error); 
    res.status(500).json({ 
        message: 'Server Error: Could not create item.',
        error: error.message // Also send the specific error message back
    });
}
};

module.exports = { createItem, getUserItems, updateItem, deleteItem };