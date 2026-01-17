const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Access the in-memory data from main server
let users, generateId, findUserById;

const setDataReferences = (dataRefs) => {
  users = dataRefs.users;
  generateId = dataRefs.generateId;
  findUserById = dataRefs.findUserById;
};

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, userId, password, phone, address, membershipType } = req.body;

    // Normalize userId to uppercase
    const normalizedUserId = userId ? userId.toUpperCase().trim() : '';

    // Check if user already exists (case-insensitive)
    const existingUser = users.find(user => 
      user.membershipId && user.membershipId.toUpperCase() === normalizedUserId
    );
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      _id: generateId(),
      name,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      membershipType: membershipType || 'student',
      membershipId: normalizedUserId,
      role: 'user',
      joinDate: new Date(),
      isActive: true,
      borrowedBooks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    // Normalize userId to uppercase for case-insensitive comparison
    const normalizedUserId = userId.toUpperCase().trim();

    // Find user (case-insensitive comparison)
    const user = users.find(u => 
      u.membershipId && u.membershipId.toUpperCase() === normalizedUserId
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user has a password (should always have one, but check for safety)
    if (!user.password) {
      console.error('User found but has no password:', user._id);
      return res.status(500).json({ message: 'Account error. Please contact administrator.' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        userId: user.membershipId,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    // Return user and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userIndex = users.findIndex(u => u._id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address } = req.body;

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      phone: phone !== undefined ? phone : users[userIndex].phone,
      address: address !== undefined ? address : users[userIndex].address,
      updatedAt: new Date(),
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Change password
router.put('/change-password', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const userIndex = users.findIndex(u => u._id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password stored
    if (!users[userIndex].password) {
      return res.status(500).json({ message: 'Account error. Please contact administrator.' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password - directly modify the object to ensure reference is maintained
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Password change failed: ' + error.message });
  }
});

module.exports = { router, setDataReferences };