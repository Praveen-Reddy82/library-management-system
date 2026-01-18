import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  InputAdornment,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [userIdAvailability, setUserIdAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    membershipType: 'student',
    membershipId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, membershipFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.BASE);
      setUsers(response.data);
    } catch (error) {
      showAlert('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (membershipFilter) {
      filtered = filtered.filter(user => user.membershipType === membershipFilter);
    }

    setFilteredUsers(filtered);
  };

  const generateMembershipId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `LIB${timestamp}${random}`;
  };

  const generateSuggestions = (baseId) => {
    const suggestions = [];
    // Add numeric suffixes
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${baseId}${i}`);
    }
    // Add timestamp-based
    const timestamp = Date.now().toString().slice(-4);
    suggestions.push(`${baseId}${timestamp}`);
    // Add random suffix
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    suggestions.push(`${baseId}${random}`);
    return suggestions.filter((id, index, self) => self.indexOf(id) === index).slice(0, 5);
  };

  const checkUserIdAvailability = async (userId) => {
    if (!userId || userId.trim() === '') {
      setUserIdAvailability(null);
      setSuggestions([]);
      return;
    }

    setCheckingAvailability(true);
    const normalizedId = userId.trim().toUpperCase();
    
    // Check against existing users
    const existingUser = users.find(user => 
      user.membershipId.toLowerCase() === normalizedId.toLowerCase()
    );

    if (existingUser) {
      setUserIdAvailability(false);
      const baseId = normalizedId.replace(/\d+$/, '') || normalizedId;
      const newSuggestions = generateSuggestions(baseId).filter(sugg => {
        return !users.some(u => u.membershipId.toLowerCase() === sugg.toLowerCase());
      });
      setSuggestions(newSuggestions.length > 0 ? newSuggestions : [generateMembershipId()]);
    } else {
      setUserIdAvailability(true);
      setSuggestions([]);
    }
    
    setCheckingAvailability(false);
  };

  // Debounce userId availability check
  useEffect(() => {
    if (!editingUser && formData.membershipId) {
      const timeoutId = setTimeout(() => {
        checkUserIdAvailability(formData.membershipId);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUserIdAvailability(null);
      setSuggestions([]);
    }
  }, [formData.membershipId, editingUser]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        phone: user.phone,
        password: '',
        membershipType: user.membershipType,
        membershipId: user.membershipId,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        phone: '',
        password: '',
        membershipType: 'student',
        membershipId: '',
      });
      setUserIdAvailability(null);
      setSuggestions([]);
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(API_ENDPOINTS.USERS.BY_ID(editingUser._id), formData);
        showAlert('success', 'User updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.USERS.BASE, formData);
        showAlert('success', 'User added successfully');
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(API_ENDPOINTS.USERS.BY_ID(id));
        showAlert('success', 'User deleted successfully');
        fetchUsers();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getMembershipColor = (type) => {
    switch (type) {
      case 'student': return 'secondary';
      case 'staff': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Users Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add User
          </Button>
        </Box>

        {alert.show && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Search users by name, email, or membership ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      px: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Membership Type</InputLabel>
                  <Select
                    value={membershipFilter}
                    label="Membership Type"
                    onChange={(e) => setMembershipFilter(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1.5,
                        px: 2,
                      },
                      '&:focus': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            py: 1.5,
                            px: 2,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Membership ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.membershipId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.membershipType.charAt(0).toUpperCase() + user.membershipType.slice(1)}
                        size="small"
                        color={getMembershipColor(user.membershipType)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit User Dialog */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +1-555-0123"
                    sx={{ mb: 2 }}
                  />
                  {!editingUser && (
                    <TextField
                      fullWidth
                      label="User ID"
                      required
                      value={formData.membershipId}
                      onChange={(e) => setFormData({ ...formData, membershipId: e.target.value.toUpperCase() })}
                      error={userIdAvailability === false}
                      helperText={
                        checkingAvailability
                          ? 'Checking availability...'
                          : userIdAvailability === true
                          ? 'User ID is available'
                          : userIdAvailability === false
                          ? 'User ID is not available'
                          : 'Enter a unique User ID for login'
                      }
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: userIdAvailability === true ? (
                          <InputAdornment position="end">
                            <CheckCircleIcon color="success" />
                          </InputAdornment>
                        ) : userIdAvailability === false ? (
                          <InputAdornment position="end">
                            <CancelIcon color="error" />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  )}
                  {userIdAvailability === false && suggestions.length > 0 && !editingUser && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Suggested User IDs:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            onClick={() => {
                              setFormData({ ...formData, membershipId: suggestion });
                              setSuggestions([]);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  {!editingUser && (
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      helperText="Password required for user to log in"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Membership Type</InputLabel>
                    <Select
                      value={formData.membershipType}
                      label="Membership Type"
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      required
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingUser ? 'Update' : 'Add'} User
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Users;