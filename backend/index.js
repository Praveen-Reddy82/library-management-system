const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://praveen-reddy82.github.io',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, 'uploads');
    if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(__dirname, 'uploads', 'pdfs');
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for all files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const pdfsDir = path.join(__dirname, 'uploads', 'pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

// Connect to MongoDB
connectDB();

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Import models
const Book = require('./models/Book');
const User = require('./models/User');
const Borrowing = require('./models/Borrowing');

// Import seed function
const seedData = require('./seed');

// Set up data references for routes
const dataRefs = { Book, User, Borrowing, seedData };

// Simple seed API endpoint for testing (temporary)
app.get('/api/seed-simple', async (req, res) => {
  console.log('Simple seed endpoint called');

  try {
    console.log('Testing database connection...');

    // Test basic database operations
    const userCount = await User.countDocuments();
    console.log(`Current user count: ${userCount}`);

    // Create a simple test user
    const testUser = new User({
      name: 'Test Admin',
      phone: '+1-555-9999',
      password: 'test123',
      membershipType: 'staff',
      membershipId: 'TESTADMIN',
      role: 'admin',
    });

    await testUser.save();
    console.log('Test user created successfully');

    res.json({
      message: 'Simple seed successful!',
      userCreated: 'TESTADMIN',
      password: 'test123',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simple seed error:', error);
    res.status(500).json({
      message: 'Simple seed failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Quick seed API endpoint (temporary - remove after seeding)
app.get('/api/seed-quick', async (req, res) => {
  console.log('Quick seed endpoint called at:', new Date().toISOString());

  try {
    console.log('Starting quick database seeding...');
    const bcrypt = require('bcryptjs');

    // Clear existing data
    await Book.deleteMany({});
    await User.deleteMany({});
    await Borrowing.deleteMany({});

    // Hash password manually
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // Create admin user with pre-hashed password
    const adminUser = new User({
      name: 'Admin User',
      phone: '+1-555-0000',
      password: adminPasswordHash,
      address: 'Library Admin Office',
      membershipType: 'staff',
      membershipId: 'ADMIN',
      role: 'admin',
    });
    await adminUser.save();

    // Create one book
    const book = new Book({
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      genre: 'Fiction',
      publicationYear: 1925,
      publisher: 'Scribner',
      description: 'A classic American novel about the Jazz Age.',
      totalCopies: 5,
      availableCopies: 3,
    });
    await book.save();

    console.log('Quick database seeding completed successfully');
    res.json({
      message: 'Quick database seeded successfully!',
      timestamp: new Date().toISOString(),
      data: {
        adminUser: 'ADMIN',
        password: 'admin123',
        booksCount: 1,
        usersCount: 1
      }
    });
  } catch (error) {
    console.error('Quick seeding error:', error);
    res.status(500).json({
      message: 'Quick seeding failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to verify backend is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Initialize routes with data references
const authRoute = require('./routes/auth');
const booksRoute = require('./routes/books');
const usersRoute = require('./routes/users');
const borrowingsRoute = require('./routes/borrowings');
const authMiddleware = require('./middleware/auth');

authRoute.setDataReferences(dataRefs);
booksRoute.setDataReferences(dataRefs);
usersRoute.setDataReferences(dataRefs);
borrowingsRoute.setDataReferences(dataRefs);
authMiddleware.setDataReferences(dataRefs);

// Routes
app.use('/api/auth', authRoute.router);
app.use('/api/books', booksRoute.router);
app.use('/api/users', usersRoute.router);
app.use('/api/borrowings', borrowingsRoute.router);

// Image upload route
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  res.json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

// PDF upload route
app.post('/api/upload/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file uploaded' });
  }
  res.json({
    message: 'PDF uploaded successfully',
    filename: req.file.filename,
    url: `/uploads/pdfs/${req.file.filename}`
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Library Management System API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});