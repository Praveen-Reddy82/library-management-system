const jwt = require('jsonwebtoken');

// Access the Mongoose models from main server
let User;

const setDataReferences = (dataRefs) => {
  User = dataRefs.User;
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here', async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    try {
      // Verify user still exists in database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = {
        id: user._id,
        membershipId: user.membershipId,
        role: user.role
      };
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authentication error' });
    }
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const requireAdmin = requireRole('admin');

module.exports = {
  authenticateToken,
  requireAdmin,
  setDataReferences
};