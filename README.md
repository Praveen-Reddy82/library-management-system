# 📚 Library Management System

A modern, visually appealing library management system built with React.js, Node.js, and Express.js. This application provides comprehensive management of books, users, and borrowing transactions with a beautiful, responsive interface. Features user authentication, file uploads, and a request-based borrowing system with admin approval workflow.

## ✨ Features

### 🔐 Authentication & Authorization
- User login and registration system
- JWT-based authentication
- Role-based access control (Admin/Student/Staff)
- Protected routes and admin-only features

### 📖 Book Management
- Add, edit, and delete books with cover images and PDFs
- Track book availability and copies
- Search books by title, author, or ISBN
- Categorize books by genre
- File upload support (cover images and PDF documents)
- Store publication details and descriptions

### 👥 User Management
- Register and manage library users
- Membership types: Student and Staff
- Auto-generated unique User IDs with availability checking
- User search and filtering by name, phone, or User ID
- Contact information management (phone numbers)

### 🔄 Borrowing System (Request-Based)
- **Request Workflow**: Users request books (pending admin approval)
- **Admin Approval**: Administrators approve or reject borrowing requests
- **Token System**: Unique token numbers for easy request tracking
- **Due Date Management**: Automatic due date calculation (14 days)
- **Return & Fines**: Book returns with automatic fine calculation
- **Status Tracking**: Pending, Approved, Borrowed, Returned, Overdue, Rejected
- Borrowing history and comprehensive status tracking

### 📊 Dashboard
- Overview statistics (total books, users, borrowings, overdue items)
- Quick access to pending requests and overdue books
- Real-time status updates and navigation shortcuts

### 📁 File Management
- Image upload for book covers (PNG, JPG, GIF up to 5MB)
- PDF document upload for books (up to 50MB)
- Automatic file organization and serving

## 🛠️ Technology Stack

- **Frontend**: React.js with Material-UI components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas (cloud database)
- **ODM**: Mongoose for MongoDB object modeling
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Handling**: Multer for file uploads (images and PDFs)
- **HTTP Client**: Axios for API communication
- **Styling**: Material-UI with custom theming and responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier available)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

   This will install dependencies for both backend and frontend.

3. **Set up MongoDB Atlas**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier is sufficient)
   - Create a database user with read/write permissions
   - Get your connection string from the "Connect" section

4. **Environment Configuration**

   **Backend:** Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-secret-key-here
   ```

   **Frontend:** Create a `.env` file in the `frontend/` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

5. **Seed the database (Optional)**
   ```bash
   npm run seed
   ```

   This will populate your database with sample books, users, and borrowing records.

### Running the Application

#### Development Mode (Recommended)
Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

#### Manual Start
Start backend:
```bash
cd backend && npm start
```

Start frontend (in a new terminal):
```bash
cd frontend && npm start
```

#### Demo Login
After running the seed command, you can use these accounts:
- **Admin Account**: User ID: `ADMIN001`, Password: `admin123`
- **Sample Users**: User ID: `STUDENT001`, Password: `admin123`

## 📱 Usage

### Dashboard
- View overview statistics
- Monitor active borrowings and overdue books
- Quick navigation to different sections

### Books Management
- **Add Book**: Click "Add Book" to create new book entries
- **Edit Book**: Click the edit icon on any book row
- **Delete Book**: Click the delete icon (only if book is not currently borrowed)
- **Search**: Use the search bar to find books by title, author, or ISBN

### Users Management
- **Add User**: Click "Add User" to register new members
- **Edit User**: Click the edit icon to update user information
- **Delete User**: Click the delete icon (only if user has no active borrowings)
- **Filter**: Filter users by membership type (Student/Staff)
- **Search**: Search by name, phone number, or User ID
- **User ID Generation**: Automatic User ID generation with availability checking

### Borrowings Management
- **New Borrowing Request**: Users submit borrowing requests (pending admin approval)
- **Admin Approval**: Administrators review and approve/reject requests
- **Token System**: Each request gets a unique token number for tracking
- **Status Management**: Track requests through Pending → Approved → Borrowed → Returned
- **Return Books**: Process book returns with automatic fine calculation
- **Overdue Management**: Automatic overdue detection and fine calculation ($1/day)
- **Extend Due Dates**: Admin ability to extend due dates for special cases

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface using Material-UI
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Sidebar navigation with clear section indicators
- **Visual Feedback**: Color-coded status indicators and alerts
- **Smooth Interactions**: Loading states, confirmations, and error handling
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change user password

### Books
- `GET /api/books` - Get all books (with optional search/filter)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Users
- `GET /api/users` - Get all users (with optional search/filter)
- `GET /api/users/:id` - Get single user
- `GET /api/users/:id/borrowings` - Get user's borrowing history
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Borrowings
- `GET /api/borrowings` - Get all borrowings (with optional status filter)
- `GET /api/borrowings/:id` - Get single borrowing
- `POST /api/borrowings` - Create new borrowing request
- `PUT /api/borrowings/:id/approve` - Approve borrowing request
- `PUT /api/borrowings/:id/reject` - Reject borrowing request
- `PUT /api/borrowings/:id/return` - Return a book
- `PUT /api/borrowings/:id/extend-due-date` - Extend due date
- `GET /api/borrowings/:id/calculate-fine` - Calculate overdue fine

### File Uploads
- `POST /api/upload/image` - Upload book cover images
- `POST /api/upload/pdf` - Upload book PDF documents

## 📂 Project Structure

```
library-management-system/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── users.js
│   │   └── borrowings.js
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Books.js
│   │   │   ├── Users.js
│   │   │   ├── Borrowings.js
│   │   │   ├── Profile.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## 💡 Implementation Notes

- **Database**: Uses MongoDB Atlas for persistent data storage
- **Data Models**: Mongoose schemas for Books, Users, and Borrowings with proper relationships
- **File Uploads**: Supports image and PDF uploads with automatic organization
- **Authentication**: JWT-based auth with role-based access control (Admin/User)
- **Borrowing Workflow**: Request-based system with admin approval and token tracking
- **Seed Data**: Run `npm run seed` to populate database with sample data

## 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For a pre-deployment checklist, see [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Reading! 📖✨**