const mongoose = require('mongoose');
const connectDB = require('./db');
const Book = require('./models/Book');
const User = require('./models/User');
const Borrowing = require('./models/Borrowing');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Book.deleteMany({});
    await User.deleteMany({});
    await Borrowing.deleteMany({});

    // Create books
    const books = await Book.insertMany([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        genre: 'Fiction',
        publicationYear: 1925,
        publisher: 'Scribner',
        description: 'A classic American novel about the Jazz Age.',
        totalCopies: 5,
        availableCopies: 3,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        genre: 'Fiction',
        publicationYear: 1960,
        publisher: 'J.B. Lippincott & Co.',
        description: 'A gripping tale of racial injustice and childhood innocence.',
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-28423-4',
        genre: 'Dystopian',
        publicationYear: 1949,
        publisher: 'Secker & Warburg',
        description: 'A dystopian social science fiction novel about totalitarian control.',
        totalCopies: 3,
        availableCopies: 1,
      },
    ]);

    // Create users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        phone: '+1-555-0000',
        password: 'admin123',
        address: 'Library Admin Office',
        membershipType: 'staff',
        membershipId: 'ADMIN',
        role: 'admin',
      },
      {
        name: 'John Doe',
        phone: '+1-555-0123',
        password: 'admin123',
        address: '123 Main St, Anytown, USA',
        membershipType: 'student',
        membershipId: 'STUDENT001',
        role: 'user',
      },
      {
        name: 'Jane Smith',
        phone: '+1-555-0124',
        password: 'admin123',
        address: '456 Oak Ave, Somewhere, USA',
        membershipType: 'student',
        membershipId: 'STUDENT002',
        role: 'user',
      },
      {
        name: 'Mike Johnson',
        phone: '+1-555-0125',
        password: 'admin123',
        address: '789 Pine St, Elsewhere, USA',
        membershipType: 'staff',
        membershipId: 'STAFF001',
        role: 'user',
      },
    ]);

    // Create a sample borrowing
    await Borrowing.create({
      user: users[0]._id,
      book: books[2]._id, // 1984
      dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (overdue)
      status: 'overdue',
      fine: 6.00, // 6 days overdue * $1/day
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${books.length} books, ${users.length} users, and 1 borrowing record`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();