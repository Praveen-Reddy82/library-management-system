const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['student', 'staff'],
    default: 'student'
  },
  membershipId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  borrowedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrowing'
  }]
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ name: 'text', phone: 'text', membershipId: 'text' });

// Hash password before saving
// Temporarily disabled to debug password hashing
// userSchema.pre('save', function(next) {
//   if (!this.isModified('password')) return next();

//   // Use callback style for Mongoose middleware
//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) return next(err);

//     bcrypt.hash(this.password, salt, (err, hash) => {
//       if (err) return next(err);

//       this.password = hash;
//       next();
//     });
//   });
// });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full membership info
userSchema.virtual('membershipInfo').get(function() {
  return `${this.membershipId} (${this.membershipType})`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);