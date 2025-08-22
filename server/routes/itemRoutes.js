const express = require('express');
const router = express.Router();
const { createItem, getUserItems, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload, createItem) // Apply upload middleware only for creation
  .get(protect, getUserItems);

router.route('/:id')
  .put(protect, upload, updateItem) // Also for update in case of new image
  .delete(protect, deleteItem);

module.exports = router;