const User = require('../models/UserModel');
const Item = require('../models/ItemModel');
const jwt = require('jsonwebtoken');

// Function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ username, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = async (req, res) => {
  try {
    // Note: We can also delete all associated items, images from cloudinary, etc.
    // For simplicity, we just delete the user document here.
    // A more robust solution would also clean up related data.
    await Item.deleteMany({ user: req.user._id }); // Delete all items by this user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'User account and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};


module.exports = { registerUser, loginUser, deleteUser };