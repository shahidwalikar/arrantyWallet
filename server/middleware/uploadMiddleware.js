const multer = require('multer');
const path = require('path');

// Set up storage engine for multer
const storage = multer.memoryStorage(); // Store files in memory as buffers

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images Only!'));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('receiptImage'); // 'receiptImage' is the field name in the form

module.exports = upload;