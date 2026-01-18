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
  Chip,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  AssignmentReturn as ReturnIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  ShoppingCart as BorrowIcon,
  Book as BookIcon,
  Check as ApproveIcon,
  Clear as RejectIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Borrowings = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(isAdmin ? '' : 'borrowed');
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    userId: undefined,
    bookId: undefined,
    dueDate: '',
  });

  const [extendDialog, setExtendDialog] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [isAdmin, user]);

  // Set default user for non-admin users
  useEffect(() => {
    if (!isAdmin && user && !formData.userId) {
      setFormData(prev => ({ ...prev, userId: user }));
    }
  }, [isAdmin, user]);

  useEffect(() => {
    fetchBorrowings();
  }, [statusFilter, isAdmin]);

  const fetchData = async () => {
    try {
      if (isAdmin) {
        const [borrowingsRes, booksRes, usersRes] = await Promise.all([
          axios.get('API_ENDPOINTS.BORROWINGS.BASE'),
          axios.get(`${API_ENDPOINTS.BOOKS.BASE}?available=true`),
          axios.get(API_ENDPOINTS.USERS.BASE),
        ]);

        setBorrowings(borrowingsRes.data || []);
        setBooks(booksRes.data || []);
        setUsers(usersRes.data || []);
      } else {
        // For regular users, fetch their own borrowings and available books
        if (!user || !user._id) {
          showAlert('error', 'User not found. Please log in.');
          setLoading(false);
          return;
        }
        const [borrowingsRes, booksRes] = await Promise.all([
          axios.get(API_ENDPOINTS.USERS.BORROWINGS(user._id)),
          axios.get(`${API_ENDPOINTS.BOOKS.BASE}?available=true`),
        ]);

        setBorrowings(borrowingsRes.data || []);
        setBooks(booksRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowings = async () => {
    try {
      if (isAdmin) {
        const url = statusFilter 
          ? `API_ENDPOINTS.BORROWINGS.BASE?status=${statusFilter}`
          : 'API_ENDPOINTS.BORROWINGS.BASE';
        const response = await axios.get(url);
        setBorrowings(response.data);
      } else {
        // For users, show their own borrowings
        if (!user || !user._id) {
          showAlert('error', 'User not found. Please log in.');
          return;
        }
        const response = await axios.get(API_ENDPOINTS.USERS.BORROWINGS(user._id));
        setBorrowings(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch borrowings';
      showAlert('error', errorMessage);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleOpenDialog = () => {
    setFormData({
      userId: undefined,
      bookId: undefined,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    // Validate form data
    if (!formData.bookId) {
      showAlert('error', 'Please select a book to borrow');
      return;
    }

    if (isAdmin && !formData.userId) {
      showAlert('error', 'Please select a user for the borrowing request');
      return;
    }

    try {
      const requestData = {
        userId: isAdmin ? formData.userId._id : user._id,
        bookId: formData.bookId._id,
        dueDate: formData.dueDate,
      };

      const response = await axios.post('API_ENDPOINTS.BORROWINGS.BASE', requestData);

      if (isAdmin) {
        showAlert('success', `Borrowing request created. Token: ${response.data.tokenNumber}`);
      } else {
        showAlert('success', `Borrowing request submitted! Token: ${response.data.tokenNumber}. Waiting for admin approval.`);
      }
      fetchData();
      fetchBorrowings();
      handleCloseDialog();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to submit borrow request');
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        await axios.put(`API_ENDPOINTS.BORROWINGS.BASE/${id}/return`);
        showAlert('success', 'Book returned successfully');
        fetchData();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Failed to return book');
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this borrowing request?')) {
      try {
        await axios.put(`API_ENDPOINTS.BORROWINGS.BASE/${id}/approve`);
        showAlert('success', 'Borrowing request approved');
        fetchData();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Failed to approve request');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this borrowing request?')) {
      try {
        await axios.put(`API_ENDPOINTS.BORROWINGS.BASE/${id}/reject`);
        showAlert('success', 'Borrowing request rejected');
        fetchData();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Failed to reject request');
      }
    }
  };

  const handleExtendDueDate = async () => {
    if (!newDueDate) {
      showAlert('error', 'Please select a new due date');
      return;
    }

    if (new Date(newDueDate) <= new Date()) {
      showAlert('error', 'New due date must be in the future');
      return;
    }

    try {
      await axios.put(`API_ENDPOINTS.BORROWINGS.BASE/${selectedBorrowing._id}`, {
        dueDate: newDueDate,
      });
      showAlert('success', 'Due date extended successfully');
      setExtendDialog(false);
      setSelectedBorrowing(null);
      setNewDueDate('');
      fetchData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to extend due date');
    }
  };

  const handleCalculateFine = async (id) => {
    if (window.confirm('Calculate fine for this overdue book?')) {
      try {
        await axios.put(`API_ENDPOINTS.BORROWINGS.BASE/${id}/calculate-fine`);
        showAlert('success', 'Fine calculated and applied');
        fetchData();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Failed to calculate fine');
      }
    }
  };

  const openExtendDialog = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setNewDueDate(borrowing.dueDate);
    setExtendDialog(true);
  };

  const closeExtendDialog = () => {
    setExtendDialog(false);
    setSelectedBorrowing(null);
    setNewDueDate('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed': return 'primary';
      case 'returned': return 'success';
      case 'overdue': return 'error';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4, px: isMobile ? 1 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isMobile ? 2 : 3, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {isAdmin ? 'Borrowings Management' : 'My Borrowing Requests'}
          </Typography>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<BorrowIcon />}
              onClick={() => navigate('/books')}
              sx={{ borderRadius: 2, width: isMobile ? '100%' : 'auto' }}
            >
              Request a Book
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<BorrowIcon />}
              onClick={handleOpenDialog}
              sx={{ borderRadius: 2, width: isMobile ? '100%' : 'auto' }}
            >
              New Borrowing
            </Button>
          )}
        </Box>

        {alert.show && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <FormControl sx={{ minWidth: 280, width: isMobile ? '100%' : 280 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All {isAdmin ? 'Borrowings' : 'Requests'}</MenuItem>
                <MenuItem value="pending">Pending {isAdmin ? 'Requests' : 'My Requests'}</MenuItem>
                <MenuItem value="borrowed">Currently Borrowed</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Mobile Card View */}
        {isMobile ? (
          <Grid container spacing={2}>
            {loading ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography>Loading...</Typography>
                </Box>
              </Grid>
            ) : borrowings.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No borrowings found
                  </Typography>
                </Box>
              </Grid>
            ) : (
              borrowings.map((borrowing) => (
                <Grid item xs={12} key={borrowing._id}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                          <Avatar
                            variant="rounded"
                            src={borrowing.book?.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${borrowing.book.coverImage}` : undefined}
                            sx={{ width: 50, height: 70, bgcolor: 'grey.300' }}
                          >
                            <BookIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {borrowing.book?.title}
                            </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            by {borrowing.book?.author}
                          </Typography>
                          {isAdmin && (
                            <Typography variant="body2" color="text.secondary">
                              Borrower: {borrowing.user?.name}
                            </Typography>
                          )}
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Token No.
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                            {borrowing.tokenNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {borrowing.borrowDate ? `Borrowed: ${formatDate(borrowing.borrowDate)}` : 'Request Date: ' + formatDate(borrowing.createdAt)}
                          </Typography>
                          <Typography variant="body2">
                            Due: {formatDate(borrowing.dueDate)}
                            {borrowing.status === 'borrowed' && isOverdue(borrowing.dueDate) && (
                              <WarningIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                        </Box>
                        <Chip
                          label={borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                          size="small"
                          color={getStatusColor(borrowing.status)}
                          variant="outlined"
                        />
                      </Box>

                      {borrowing.fine > 0 && (
                        <Typography color="error.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Fine: ${borrowing.fine.toFixed(2)}
                        </Typography>
                      )}

                      {borrowing.status === 'borrowed' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ReturnIcon />}
                            onClick={() => handleReturn(borrowing._id)}
                            color="success"
                            sx={{ borderRadius: 2 }}
                          >
                            Return Book
                          </Button>
                          {isAdmin && isOverdue(borrowing.dueDate) && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => openExtendDialog(borrowing)}
                                color="warning"
                                sx={{ borderRadius: 2 }}
                              >
                                Extend Due Date
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleCalculateFine(borrowing._id)}
                                color="error"
                                sx={{ borderRadius: 2 }}
                              >
                                Calculate Fine
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}
                      {borrowing.status === 'pending' && isAdmin && (
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleApprove(borrowing._id)}
                            color="success"
                            sx={{ borderRadius: 2 }}
                          >
                            Approve
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<RejectIcon />}
                            onClick={() => handleReject(borrowing._id)}
                            color="error"
                            sx={{ borderRadius: 2 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        ) : (
          /* Desktop Table View */
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Token</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cover</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold' }}>Borrow Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fine</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 9 : 8} align="center">Loading...</TableCell>
                  </TableRow>
                ) : borrowings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 9 : 8} align="center">
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No borrowings found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  borrowings.map((borrowing) => (
                    <TableRow key={borrowing._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                          {borrowing.tokenNumber || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={borrowing.book?.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${borrowing.book.coverImage}` : undefined}
                          sx={{ width: 40, height: 60, bgcolor: 'grey.300' }}
                        >
                          <BookIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      </TableCell>
                      <TableCell>{borrowing.book?.title}</TableCell>
                      {isAdmin && <TableCell>{borrowing.user?.name}</TableCell>}
                      <TableCell>{formatDate(borrowing.borrowDate)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {formatDate(borrowing.dueDate)}
                          {borrowing.status === 'borrowed' && isOverdue(borrowing.dueDate) && (
                            <WarningIcon color="error" fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                          size="small"
                          color={getStatusColor(borrowing.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {borrowing.fine > 0 ? (
                          <Typography color="error.main" sx={{ fontWeight: 'bold' }}>
                            ${borrowing.fine.toFixed(2)}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {borrowing.status === 'borrowed' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ReturnIcon />}
                              onClick={() => handleReturn(borrowing._id)}
                              color="success"
                            >
                              Return
                            </Button>
                            {isAdmin && isOverdue(borrowing.dueDate) && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => openExtendDialog(borrowing)}
                                  color="warning"
                                >
                                  Extend
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleCalculateFine(borrowing._id)}
                                  color="error"
                                >
                                  Fine
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )}
                        {borrowing.status === 'pending' && isAdmin && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleApprove(borrowing._id)}
                              color="success"
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<RejectIcon />}
                              onClick={() => handleReject(borrowing._id)}
                              color="error"
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Extend Due Date Dialog */}
        <Dialog open={extendDialog} onClose={closeExtendDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Extend Due Date</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Current due date: {selectedBorrowing ? formatDate(selectedBorrowing.dueDate) : ''}
              </Typography>
              <TextField
                fullWidth
                label="New Due Date"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderWidth: 2 },
                    '&:hover fieldset': { borderWidth: 2 },
                    '&.Mui-focused fieldset': { borderWidth: 2 },
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeExtendDialog}>Cancel</Button>
            <Button onClick={handleExtendDueDate} variant="contained" color="primary">
              Extend Due Date
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Borrowing Dialog */}
        <Dialog
          open={open}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {isAdmin ? 'New Book Borrowing' : 'Borrow a Book'}
            </DialogTitle>
            <DialogContent sx={{ px: 3, py: 1 }}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {isAdmin && (
                  <Grid item xs={12}>
                    <Autocomplete
                      fullWidth
                      options={users}
                      getOptionLabel={(option) => `${option.name} (${option.membershipId})`}
                      value={formData.userId}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({ ...prev, userId: newValue }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Choose borrower"
                          placeholder="Search and select a library member"
                          required
                          sx={{ minWidth: 400 }}
                        />
                      )}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            minWidth: 300,
                            maxWidth: 400,
                            '& .MuiMenuItem-root': {
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              py: 1.5,
                              px: 2,
                            },
                          },
                        },
                      }}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          sx={{
                            py: 1.5,
                            px: 2,
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                          }}
                        >
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {option.membershipId} • {option.membershipType}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Autocomplete
                    fullWidth
                    options={books}
                    getOptionLabel={(option) => `${option.title} by ${option.author}`}
                    value={formData.bookId}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, bookId: newValue }));
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 450,
                          maxWidth: 600,
                          '& .MuiMenuItem-root': {
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                          },
                        },
                      },
                    }}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          py: 2,
                          px: 3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                          minWidth: 450,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar
                            variant="rounded"
                            src={option.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${option.coverImage}` : undefined}
                            sx={{ width: 50, height: 70, bgcolor: 'grey.300', flexShrink: 0 }}
                          >
                            <BookIcon sx={{ fontSize: 24 }} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {option.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              by {option.author}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={option.genre}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {option.availableCopies} available
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Choose book to borrow"
                        placeholder="Search and select a book from the library"
                        required
                        sx={{
                          minWidth: 400,
                          '& .MuiInputBase-root': {
                            minHeight: 56,
                          },
                        }}
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          minWidth: '600px',
                          maxWidth: '800px',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Books are typically borrowed for 2 weeks"
                  />
                </Grid>
                {formData.bookId && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={formData.bookId.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${formData.bookId.coverImage}` : undefined}
                          sx={{ width: 60, height: 80, bgcolor: 'grey.300' }}
                        >
                          <BookIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{formData.bookId.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            by {formData.bookId.author}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ISBN: {formData.bookId.isbn}
                          </Typography>
                          <Chip
                            label={`${formData.bookId.availableCopies} available`}
                            size="small"
                            color="success"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleCloseDialog} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!formData.bookId || (!isAdmin && !formData.userId) || !formData.dueDate}
              >
                Borrow Book
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>

      {/* Login Dialog */}
      <Dialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          Login Required
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please log in to borrow books from the library.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You need to be a registered member to borrow books.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setLoginDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLoginDialogOpen(false);
              window.location.href = '/login';
            }}
            variant="contained"
            color="primary"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Borrowings;