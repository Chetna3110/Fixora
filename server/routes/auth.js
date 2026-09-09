const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
  if (!token) return res.status(401).json({ message: 'No token, access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const allowedRoles = ['user', 'worker', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'user';

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: assignedRole });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET own profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE own profile (name, bio, profileImage)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;

    const updated = await User.findByIdAndUpdate(
      req.user.id, updateFields, { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CHANGE password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all users — admin only
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    const users = await User.find({}, 'name email role createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE user role — admin only
router.put('/users/:id/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });

    const { role } = req.body;
    if (!['user', 'worker', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const updated = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select('name email role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;