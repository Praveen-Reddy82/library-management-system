const express = require('express');
const requireAuth = require('../middleware/auth').authenticateToken;
const requireAdmin = require('../middleware/auth').requireAdmin;

// Access the Mongoose models from main server
let Book, User, Borrowing;

const setDataReferences = (dataRefs) => {
  Book = dataRefs.Book;
  User = dataRefs.User;
  Borrowing = dataRefs.Borrowing;
};

const router = express.Router();

// Generate unique token number for borrowing request
const generateTokenNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `REQ-${timestamp}-${random}`;
};

// Get all borrowings
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, overdue } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (overdue === 'true') {
      query.status = 'borrowed';
      query.dueDate = { $lt: new Date() };
    }

    const borrowings = await Borrowing.find(query)
      .populate('user', 'name phone membershipId')
      .populate('book', 'title author isbn coverImage')
      .sort({ createdAt: -1 });

    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create borrowing request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if user already has a pending request for this book
    const existingPendingRequest = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: 'pending'
    });

    if (existingPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    // Check if user already has this book borrowed
    const existingBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    // Generate unique token number
    const tokenNumber = generateTokenNumber();

    // Create borrowing request
    const newBorrowing = new Borrowing({
      user: userId,
      book: bookId,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'pending',
      tokenNumber: tokenNumber,
      fine: 0,
    });

    await newBorrowing.save();

    // Populate the response
    await newBorrowing.populate('user', 'name phone membershipId');
    await newBorrowing.populate('book', 'title author isbn availableCopies');

    res.status(201).json(newBorrowing);
  } catch (error) {
    console.error('Error creating borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve borrowing request
router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    if (borrowing.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    // Check if book is still available
    const book = await Book.findById(borrowing.book);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is no longer available' });
    }

    // Update borrowing
    borrowing.status = 'borrowed';
    borrowing.borrowDate = new Date();
    await borrowing.save();

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    await borrowing.populate('user', 'name phone membershipId');
    await borrowing.populate('book', 'title author isbn');

    res.json(borrowing);
  } catch (error) {
    console.error('Error approving borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject borrowing request
router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    if (borrowing.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    borrowing.status = 'rejected';
    await borrowing.save();

    await borrowing.populate('user', 'name phone membershipId');
    await borrowing.populate('book', 'title author isbn');

    res.json(borrowing);
  } catch (error) {
    console.error('Error rejecting borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Return book
router.put('/:id/return', requireAuth, requireAdmin, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    if (borrowing.status !== 'borrowed') {
      return res.status(400).json({ message: 'Only borrowed books can be returned' });
    }

    // Calculate fine if overdue
    const now = new Date();
    const dueDate = new Date(borrowing.dueDate);
    let fine = 0;

    if (now > dueDate) {
      const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 1; // $1 per day
    }

    // Update borrowing
    borrowing.status = 'returned';
    borrowing.returnDate = now;
    borrowing.fine = fine;
    await borrowing.save();

    // Update book availability
    const book = await Book.findById(borrowing.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    await borrowing.populate('user', 'name phone membershipId');
    await borrowing.populate('book', 'title author isbn');

    res.json(borrowing);
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single borrowing
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate('user', 'name phone membershipId')
      .populate('book', 'title author isbn coverImage');

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    res.json(borrowing);
  } catch (error) {
    console.error('Error fetching borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single borrowing
router.get('/:id', (req, res) => {
  try {
    const borrowing = findBorrowingById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    const userData = users.find(user => user._id === borrowing.user);
    const bookData = books.find(book => book._id === borrowing.book);
    
    const populatedBorrowing = {
      ...borrowing,
      tokenNumber: borrowing.tokenNumber || generateTokenNumber(),
      user: userData ? {
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        membershipId: userData.membershipId,
      } : null,
      book: bookData ? {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        coverImage: bookData.coverImage,
      } : null,
    };

    res.json(populatedBorrowing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request to borrow a book (Authenticated users - creates pending request)
router.post('/', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    const { userId, bookId, dueDate } = req.body;

    // Check if user exists
    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if book exists
    const book = findBookById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has a pending request for this book
    const existingPendingRequest = borrowings.find(
      borrowing => borrowing.user === userId && 
                   borrowing.book === bookId && 
                   borrowing.status === 'pending'
    );

    if (existingPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    // Check if user already has this book borrowed
    const existingBorrowing = borrowings.find(
      borrowing => borrowing.user === userId && 
                   borrowing.book === bookId && 
                   borrowing.status === 'borrowed'
    );

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    // Generate unique token number
    const tokenNumber = generateTokenNumber();

    // Create borrowing request with 'pending' status (DO NOT update book availability yet)
    const newBorrowing = {
      _id: generateId(),
      user: userId,
      book: bookId,
      borrowDate: null, // Will be set when approved
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days from approval
      returnDate: null,
      status: 'pending',
      tokenNumber: tokenNumber,
      fine: 0,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    borrowings.push(newBorrowing);

    // DO NOT update book availability or user's borrowed books until admin approves

    const populatedBorrowing = {
      ...newBorrowing,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        membershipId: user.membershipId,
      },
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        availableCopies: book.availableCopies,
      },
    };

    res.status(201).json(populatedBorrowing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Return a book (Authenticated users)
router.put('/:id/return', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    const borrowingIndex = borrowings.findIndex(b => b._id === req.params.id);
    if (borrowingIndex === -1) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    const borrowing = borrowings[borrowingIndex];

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book is already returned' });
    }

    // Update borrowing record
    borrowing.returnDate = new Date();
    borrowing.status = 'returned';
    borrowing.updatedAt = new Date();

    // Calculate fine if overdue
    if (new Date(borrowing.dueDate) < new Date()) {
      const daysOverdue = Math.ceil((new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24));
      borrowing.fine = daysOverdue * 0.50; // $0.50 per day fine
      borrowing.status = 'overdue';
    }

    // Update book availability
    const bookIndex = books.findIndex(b => b._id === borrowing.book);
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies += 1;
    }

    // Remove from user's borrowed books
    const userIndex = users.findIndex(u => u._id === borrowing.user);
    if (userIndex !== -1) {
      users[userIndex].borrowedBooks = users[userIndex].borrowedBooks.filter(
        id => id !== borrowing._id
      );
    }

    const userData = users.find(user => user._id === borrowing.user);
    const bookData = books.find(book => book._id === borrowing.book);
    
    const populatedBorrowing = {
      ...borrowing,
      tokenNumber: borrowing.tokenNumber || generateTokenNumber(),
      user: userData ? {
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        membershipId: userData.membershipId,
      } : null,
      book: bookData ? {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        coverImage: bookData.coverImage,
      } : null,
    };

    res.json(populatedBorrowing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update borrowing (extend due date, update fine, etc.)
router.put('/:id', (req, res) => {
  try {
    const borrowingIndex = borrowings.findIndex(b => b._id === req.params.id);
    if (borrowingIndex === -1) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    borrowings[borrowingIndex] = {
      ...borrowings[borrowingIndex],
      ...req.body,
      updatedAt: new Date(),
    };

    const borrowing = borrowings[borrowingIndex];
    const userData = users.find(user => user._id === borrowing.user);
    const bookData = books.find(book => book._id === borrowing.book);
    
    const populatedBorrowing = {
      ...borrowing,
      tokenNumber: borrowing.tokenNumber || generateTokenNumber(),
      user: userData ? {
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        membershipId: userData.membershipId,
      } : null,
      book: bookData ? {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        coverImage: bookData.coverImage,
      } : null,
    };

    res.json(populatedBorrowing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve a borrowing request (Admin only)
router.put('/:id/approve', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  try {
    const borrowingIndex = borrowings.findIndex(b => b._id === req.params.id);
    if (borrowingIndex === -1) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    const borrowing = borrowings[borrowingIndex];
    if (borrowing.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Check if book is available
    const bookIndex = books.findIndex(b => b._id === borrowing.book);
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[bookIndex];
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Update borrowing status and set borrow date
    borrowing.status = 'borrowed';
    borrowing.borrowDate = new Date();
    borrowing.updatedAt = new Date();

    // Update book availability (only now when approved)
    book.availableCopies -= 1;

    // Add to user's borrowed books
    const userIndex = users.findIndex(u => u._id === borrowing.user);
    if (userIndex !== -1) {
      users[userIndex].borrowedBooks.push(borrowing._id);
    }

    const userData = users.find(user => user._id === borrowing.user);
    const bookData = books.find(book => book._id === borrowing.book);
    
    const populatedBorrowing = {
      ...borrowing,
      tokenNumber: borrowing.tokenNumber || generateTokenNumber(),
      user: userData ? {
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        membershipId: userData.membershipId,
      } : null,
      book: bookData ? {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        coverImage: bookData.coverImage,
      } : null,
    };

    res.json(populatedBorrowing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject a borrowing request (Admin only)
router.put('/:id/reject', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  try {
    const borrowingIndex = borrowings.findIndex(b => b._id === req.params.id);
    if (borrowingIndex === -1) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    const borrowing = borrowings[borrowingIndex];
    if (borrowing.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Mark as rejected
    borrowing.status = 'rejected';
    borrowing.updatedAt = new Date();

    const userData = users.find(user => user._id === borrowing.user);
    const bookData = books.find(book => book._id === borrowing.book);
    
    const populatedBorrowing = {
      ...borrowing,
      tokenNumber: borrowing.tokenNumber || generateTokenNumber(),
      user: userData ? {
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        membershipId: userData.membershipId,
      } : null,
      book: bookData ? {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        coverImage: bookData.coverImage,
      } : null,
    };

    res.json(populatedBorrowing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a borrowing record
router.delete('/:id', (req, res) => {
  try {
    const borrowingIndex = borrowings.findIndex(b => b._id === req.params.id);
    if (borrowingIndex === -1) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    const borrowing = borrowings[borrowingIndex];

    // If book is still borrowed, return it first
    if (borrowing.status === 'borrowed') {
      const bookIndex = books.findIndex(b => b._id === borrowing.book);
      if (bookIndex !== -1) {
        books[bookIndex].availableCopies += 1;
      }

      const userIndex = users.findIndex(u => u._id === borrowing.user);
      if (userIndex !== -1) {
        users[userIndex].borrowedBooks = users[userIndex].borrowedBooks.filter(
          id => id !== borrowing._id
        );
      }
    }

    borrowings.splice(borrowingIndex, 1);
    res.json({ message: 'Borrowing record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate and apply fine for overdue borrowing (Admin only)
router.put('/:id/calculate-fine', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  try {
    const borrowingIndex = borrowings.findIndex(b => b._id === req.params.id);
    if (borrowingIndex === -1) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    const borrowing = borrowings[borrowingIndex];
    if (borrowing.status !== 'borrowed') {
      return res.status(400).json({ message: 'Fine can only be calculated for borrowed books' });
    }

    if (new Date(borrowing.dueDate) > new Date()) {
      return res.status(400).json({ message: 'Book is not overdue yet' });
    }

    // Calculate fine: $0.50 per day overdue
    const daysOverdue = Math.ceil((new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24));
    borrowing.fine = daysOverdue * 0.50;
    borrowing.updatedAt = new Date();

    const userData = users.find(user => user._id === borrowing.user);
    const bookData = books.find(book => book._id === borrowing.book);

    const populatedBorrowing = {
      ...borrowing,
      tokenNumber: borrowing.tokenNumber || generateTokenNumber(),
      user: userData ? {
        _id: userData._id,
        name: userData.name,
        phone: userData.phone,
        membershipId: userData.membershipId,
      } : null,
      book: bookData ? {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        coverImage: bookData.coverImage,
      } : null,
    };

    res.json(populatedBorrowing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, setDataReferences };