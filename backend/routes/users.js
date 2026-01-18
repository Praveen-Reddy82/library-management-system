const express = require('express');
const bcrypt = require('bcryptjs');

// Access the Mongoose models from main server
let User, Borrowing, Book;

const setDataReferences = (dataRefs) => {
  User = dataRefs.User;
  Borrowing = dataRefs.Borrowing;
  Book = dataRefs.Book;
};

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const { search, membershipType } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { membershipId: new RegExp(search, 'i') }
      ];
    }

    if (membershipType) {
      query.membershipType = membershipType;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    // Add borrowed books info
    const usersWithBorrowings = await Promise.all(
      users.map(async (user) => {
        const borrowedBooks = await Borrowing.find({
          user: user._id,
          status: 'borrowed'
        }).select('_id');
        const userObj = user.toObject();
        const { password, ...userWithoutPassword } = userObj;
        return {
          ...userWithoutPassword,
          borrowedBooks: borrowedBooks.map(b => b._id)
        };
      })
    );

    res.json(usersWithBorrowings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user
router.get('/:id', (req, res) => {
  try {
    const user = findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userWithBorrowings = {
      ...user,
      borrowedBooks: borrowings.filter(b => b.user === user._id && b.status === 'borrowed').map(b => b._id)
    };
    res.json(userWithBorrowings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user (Admin only)
router.post('/', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.membershipId || !req.body.membershipId.trim()) {
      return res.status(400).json({ message: 'Membership ID is required' });
    }
    if (!req.body.password || req.body.password.trim() === '') {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!req.body.phone || !req.body.phone.trim()) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Normalize membershipId to uppercase for consistency
    const normalizedMembershipId = req.body.membershipId.toUpperCase().trim();

    // Check for duplicate phone or membership ID
    const existingUser = users.find(user =>
      (user.phone && user.phone.trim() === req.body.phone.trim()) ||
      (user.membershipId && user.membershipId.toUpperCase() === normalizedMembershipId)
    );
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number or membership ID already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = {
      _id: generateId(),
      name: req.body.name || '',
      phone: req.body.phone.trim(),
      membershipId: normalizedMembershipId,
      password: hashedPassword,
      address: req.body.address || '',
      membershipType: req.body.membershipType || 'student',
      role: req.body.role || 'user',
      joinDate: new Date(),
      isActive: true,
      borrowedBooks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a user (Admin only or own profile)
router.put('/:id', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    // Allow users to update their own profile, or admin to update any profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userIndex = users.findIndex(user => user._id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for duplicate phone or membership ID (excluding current user)
    const existingUser = users.find(user =>
      (user.phone === req.body.phone || user.membershipId === req.body.membershipId) &&
      user._id !== req.params.id
    );
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number or membership ID already exists' });
    }

    users[userIndex] = {
      ...users[userIndex],
      ...req.body,
      updatedAt: new Date(),
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user (Admin only)
router.delete('/:id', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  try {
    // Check if user has active borrowings
    const activeBorrowings = borrowings.filter(
      borrowing => borrowing.user === req.params.id && borrowing.status === 'borrowed'
    );

    if (activeBorrowings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete user with active borrowings'
      });
    }

    const userIndex = users.findIndex(user => user._id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate token number (matches borrowings route)
const generateBorrowingToken = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `REQ-${timestamp}-${random}`;
};

// Get user's borrowing history
router.get('/:id/borrowings', (req, res) => {
  try {
    const userBorrowings = borrowings
      .filter(borrowing => borrowing.user === req.params.id)
      .map(borrowing => {
        const book = books ? books.find(book => book._id === borrowing.book) : null;
        const userData = users ? users.find(u => u._id === borrowing.user) : null;
        
        return {
          ...borrowing,
          tokenNumber: borrowing.tokenNumber || generateBorrowingToken(),
          book: book ? {
            _id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            coverImage: book.coverImage,
            genre: book.genre,
          } : null,
          user: userData ? {
            _id: userData._id,
            name: userData.name,
            phone: userData.phone,
            membershipId: userData.membershipId,
          } : null,
        };
      })
      .sort((a, b) => new Date(b.createdAt || b.borrowDate) - new Date(a.createdAt || a.borrowDate));

    res.json(userBorrowings);
  } catch (error) {
    console.error('Error fetching user borrowings:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch borrowing history' });
  }
});

module.exports = { router, setDataReferences };