const mongoose = require('mongoose');
const connectDB = require('./db');
const Book = require('./models/Book');
const User = require('./models/User');
const Borrowing = require('./models/Borrowing');

const seedData = async () => {
  try {
    console.log('Starting database seeding process...');

    // Note: Don't call connectDB() here as the main server already connects

    console.log('Clearing existing data...');
    await Book.deleteMany({});
    await User.deleteMany({});
    await Borrowing.deleteMany({});
    console.log('Existing data cleared');

    // Create books one by one to avoid insertMany issues
    console.log('Creating books...');
    const book1 = new Book({
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
    await book1.save();

    const book2 = new Book({
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      genre: 'Fiction',
      publicationYear: 1960,
      publisher: 'J.B. Lippincott & Co.',
      description: 'A gripping tale of racial injustice and childhood innocence.',
      totalCopies: 4,
      availableCopies: 4,
    });
    await book2.save();

    const book3 = new Book({
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-452-28423-4',
      genre: 'Dystopian',
      publicationYear: 1949,
      publisher: 'Secker & Warburg',
      description: 'A dystopian social science fiction novel about totalitarian control.',
      totalCopies: 3,
      availableCopies: 1,
    });
    await book3.save();

    const books = [book1, book2, book3];
    console.log('Books created successfully');

    console.log('Creating users...');
    try {
      // Hash passwords manually to ensure they work
      const bcrypt = require('bcryptjs');
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const userPasswordHash = await bcrypt.hash('user123', 10);

      // Create users with pre-hashed passwords
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
      console.log('Admin user created');

      const user1 = new User({
        name: 'John Doe',
        phone: '+1-555-0123',
        password: userPasswordHash,
        address: '123 Main St, Anytown, USA',
        membershipType: 'student',
        membershipId: 'STUDENT001',
        role: 'user',
      });
      await user1.save();

      const user2 = new User({
        name: 'Jane Smith',
        phone: '+1-555-0124',
        password: userPasswordHash,
        address: '456 Oak Ave, Somewhere, USA',
        membershipType: 'student',
        membershipId: 'STUDENT002',
        role: 'user',
      });
      await user2.save();

      const user3 = new User({
        name: 'Mike Johnson',
        phone: '+1-555-0125',
        password: userPasswordHash,
        address: '789 Pine St, Elsewhere, USA',
        membershipType: 'staff',
        membershipId: 'STAFF001',
        role: 'user',
      });
      await user3.save();

      const users = [adminUser, user1, user2, user3];
      console.log('All users created successfully');
    } catch (userError) {
      console.error('Error creating users:', userError);
      throw userError;
    }

    // Create a sample borrowing
    await Borrowing.create({
      user: adminUser._id,
      book: books[2]._id, // 1984
      dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (overdue)
      status: 'overdue',
      fine: 6.00, // 6 days overdue * $1/day
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${books.length} books, 4 users, and 1 borrowing record`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Export for API usage
module.exports = seedData;

// Run if called directly
if (require.main === module) {
  seedData();
}