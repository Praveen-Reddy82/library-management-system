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

// Seed API endpoint (temporary - remove after seeding)
app.post('/api/seed', async (req, res) => {
  try {
    console.log('Starting database seeding...');
    await seedData();
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
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