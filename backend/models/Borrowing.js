const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  tokenNumber: {
    type: String,
    required: true,
    unique: true
  },
  borrowDate: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'borrowed', 'returned', 'overdue', 'rejected'],
    default: 'pending'
  },
  fine: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
borrowingSchema.index({ user: 1, status: 1 });
borrowingSchema.index({ book: 1, status: 1 });
borrowingSchema.index({ status: 1, createdAt: -1 });
borrowingSchema.index({ tokenNumber: 1 });

// Virtual for overdue status
borrowingSchema.virtual('isOverdue').get(function() {
  return this.status === 'borrowed' && new Date() > this.dueDate;
});

// Virtual for days overdue
borrowingSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const now = new Date();
  const diffTime = now - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate token number
borrowingSchema.pre('save', async function(next) {
  if (this.isNew && !this.tokenNumber) {
    // Generate unique token number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.tokenNumber = `LIB${timestamp}${random}`;
  }
  next();
});

// Ensure virtual fields are serialized
borrowingSchema.set('toJSON', { virtuals: true });
borrowingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Borrowing', borrowingSchema);