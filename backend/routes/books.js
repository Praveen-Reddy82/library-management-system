const express = require('express');

// Access the Mongoose models from main server
let Book, Borrowing;

const setDataReferences = (dataRefs) => {
  Book = dataRefs.Book;
  Borrowing = dataRefs.Borrowing;
};

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const { search, genre, available } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (genre) {
      query.genre = new RegExp(genre, 'i');
    }

    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new book (Admin only)
router.post('/', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a book (Admin only)
router.put('/:id', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a book (Admin only)
router.delete('/:id', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, async (req, res) => {
  try {
    // Check if book is currently borrowed
    const activeBorrowings = await Borrowing.find({
      book: req.params.id,
      status: 'borrowed'
    });

    if (activeBorrowings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete book that is currently borrowed'
      });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully', book: deletedBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, setDataReferences };