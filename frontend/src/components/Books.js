import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Box,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardMedia,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Book as BookIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  ShoppingCart as BorrowIcon,
  Download as DownloadIcon,
  FilterList,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Books = () => {
  const { isAdmin, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetailOpen, setBookDetailOpen] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publicationYear: '',
    totalCopies: 1,
    availableCopies: 1,
    coverImage: '',
    pdfFile: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, genreFilter, availabilityFilter]);

  const fetchBooks = async () => {
    try {
      console.log('Books: Fetching books from:', API_ENDPOINTS.BOOKS.BASE);
      const response = await axios.get(API_ENDPOINTS.BOOKS.BASE);
      console.log('Books: Response data:', response.data);
      setBooks(response.data);
    } catch (error) {
      console.error('Books: Error fetching books:', error);
      console.error('Books: Error response:', error.response);
      showAlert('error', 'Failed to fetch books: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...(books || [])];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.isbn && book.isbn.toLowerCase().includes(searchLower))
      );
    }

    if (genreFilter) {
      filtered = filtered.filter(book => book.genre === genreFilter);
    }

    if (availabilityFilter) {
      if (availabilityFilter === 'available') {
        filtered = filtered.filter(book => book.availableCopies > 0);
      } else if (availabilityFilter === 'unavailable') {
        filtered = filtered.filter(book => book.availableCopies === 0);
      }
    }

    // Sort books
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'author':
          aValue = (a.author || '').toLowerCase();
          bValue = (b.author || '').toLowerCase();
          break;
        case 'genre':
          aValue = (a.genre || '').toLowerCase();
          bValue = (b.genre || '').toLowerCase();
          break;
        case 'year':
          aValue = a.publicationYear || 0;
          bValue = b.publicationYear || 0;
          break;
        default:
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredBooks(filtered);
  };

  // Image upload functionality
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploadingImage(true);
    try {
      const response = await axios.post(API_ENDPOINTS.UPLOAD.IMAGE, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({
        ...prev,
        coverImage: response.data.url,
      }));

      showAlert('success', 'Image uploaded successfully');
    } catch (error) {
      showAlert('error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const onPdfDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('pdf', file);

    setUploadingPdf(true);
    try {
      const response = await axios.post(API_ENDPOINTS.UPLOAD.PDF, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({
        ...prev,
        pdfFile: response.data.url,
      }));

      showAlert('success', 'PDF uploaded successfully');
    } catch (error) {
      showAlert('error', 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
    noClick: false,
    noKeyboard: false,
    multiple: false,
    disabled: uploadingImage,
  });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onPdfDrop(acceptedFiles);
      }
    },
    noClick: false,
    noKeyboard: false,
    multiple: false,
    disabled: uploadingPdf,
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        publicationYear: book.publicationYear,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        coverImage: book.coverImage || '',
        pdfFile: book.pdfFile || '',
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        publicationYear: '',
        totalCopies: 1,
        availableCopies: 1,
        coverImage: '',
        pdfFile: '',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingBook(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await axios.put(API_ENDPOINTS.BOOKS.BY_ID(editingBook._id), formData);
        showAlert('success', 'Book updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.BOOKS.BASE, formData);
        showAlert('success', 'Book added successfully');
      }
      fetchBooks();
      handleCloseDialog();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to save book');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(API_ENDPOINTS.BOOKS.BY_ID(id));
        showAlert('success', 'Book deleted successfully');
        fetchBooks();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setBookDetailOpen(true);
  };

  const handleBorrowBook = async (bookId) => {
    if (!bookId) {
      showAlert('error', 'Invalid book selected');
      return;
    }

    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    try {

      await axios.post(API_ENDPOINTS.BORROWINGS.BASE, {
        userId: user._id,
        bookId: bookId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending', // Request status
      });

      showAlert('success', 'Borrow request submitted! Waiting for admin approval.');
      fetchBooks();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to submit borrow request');
    }
  };

  const handleImageError = (bookId) => {
    setImageErrors(prev => ({
      ...prev,
      [bookId]: true
    }));
  };




  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {isAdmin ? 'Books Management' : 'Browse Books'}
          </Typography>
          {isAdmin === true && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ borderRadius: 2 }}
            >
              Add Book
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
            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Filter and Sort Bar */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                '& > *': {
                  flex: { xs: '1 1 100%', sm: '1 1 auto' },
                  minWidth: { xs: '100%', sm: 200 },
                },
              }}
            >
              {/* Genre Filter */}
              <FormControl sx={{ flex: '1 1 250px' }}>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={genreFilter}
                  label="Genre"
                  onChange={(e) => setGenreFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Genres</MenuItem>
                  <MenuItem value="Fiction">Fiction</MenuItem>
                  <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                  <MenuItem value="Mystery">Mystery</MenuItem>
                  <MenuItem value="Romance">Romance</MenuItem>
                  <MenuItem value="Science Fiction">Science Fiction</MenuItem>
                  <MenuItem value="Fantasy">Fantasy</MenuItem>
                  <MenuItem value="Biography">Biography</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                  <MenuItem value="Dystopian">Dystopian</MenuItem>
                  <MenuItem value="Thriller">Thriller</MenuItem>
                  <MenuItem value="Horror">Horror</MenuItem>
                  <MenuItem value="Adventure">Adventure</MenuItem>
                  <MenuItem value="Poetry">Poetry</MenuItem>
                  <MenuItem value="Drama">Drama</MenuItem>
                  <MenuItem value="Comedy">Comedy</MenuItem>
                  <MenuItem value="Philosophy">Philosophy</MenuItem>
                  <MenuItem value="Religion">Religion</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Art">Art</MenuItem>
                  <MenuItem value="Music">Music</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Cooking">Cooking</MenuItem>
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Law">Law</MenuItem>
                  <MenuItem value="Politics">Politics</MenuItem>
                </Select>
              </FormControl>

              {/* Availability Filter */}
              <FormControl sx={{ flex: '1 1 220px' }}>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={availabilityFilter}
                  label="Availability"
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <MenuItem value="">All Books</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>

              {/* Sort Controls */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '1 1 300px' }}>
                <Typography variant="body2" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                  Sort by:
                </Typography>

                <FormControl sx={{ minWidth: 140 }} size="small">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="author">Author</MenuItem>
                    <MenuItem value="genre">Genre</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    variant={sortOrder === 'asc' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSortOrder('asc')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    ↑ Asc
                  </Button>
                  <Button
                    variant={sortOrder === 'desc' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSortOrder('desc')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    ↓ Desc
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Books Grid View */}
        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography variant="h6">Loading books...</Typography>
              </Box>
            </Grid>
          ) : filteredBooks.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BookIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No books found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.03), transparent)',
                      transition: 'left 0.5s ease-in-out',
                    },
                    '&:hover': {
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      transform: 'translateY(-8px) scale(1.02)',
                      border: '1px solid rgba(37, 99, 235, 0.15)',
                      '&::before': {
                        left: '100%',
                      },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imageErrors[book._id] ? '/placeholder-book.jpg' : (book.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${book.coverImage}` : '/placeholder-book.jpg')}
                      alt={book.title}
                      sx={{
                        objectFit: 'cover',
                        bgcolor: 'grey.100',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                      onError={() => handleImageError(book._id)}
                    />
                    {isAdmin === true && (
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <IconButton
                          size="small"
                          onClick={() => book._id && handleOpenDialog(book)}
                          sx={{ bgcolor: 'rgba(255,255,255,0.8)', mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => book._id && handleDelete(book._id)}
                          sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ flex: 1, p: 3, pb: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.3,
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'text.primary',
                        }}
                      >
                        {book.title || 'Untitled Book'}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 2,
                        }}
                      >
                        by {book.author || 'Unknown Author'}
                      </Typography>
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 2,
                    }}>
                      {book.genre && (
                        <Chip
                          label={book.genre}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 28,
                            borderColor: 'rgba(37, 99, 235, 0.3)',
                            color: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'rgba(37, 99, 235, 0.04)',
                            }
                          }}
                        />
                      )}
                      {book.pdfFile && book.pdfFile.trim() && (
                        <Chip
                          label="📄 PDF"
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            backgroundColor: 'secondary.main',
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      mt: 'auto',
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            lineHeight: 1.3,
                          }}
                        >
                          {book.publicationYear ? `${book.publicationYear} • ` : ''}
                          ISBN: {book.isbn || 'N/A'}
                        </Typography>
                      </Box>

                      <Box sx={{
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                      }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: book.availableCopies > 0 ? 'success.main' : 'warning.main',
                            lineHeight: 1.2,
                          }}
                        >
                          {book.availableCopies || 0} available
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                            lineHeight: 1.2,
                          }}
                        >
                          of {book.totalCopies || 0} total
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ pt: 0, px: 2, pb: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBook(book);
                        }}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 2,
                          },
                        }}
                      >
                        View
                      </Button>
                      {book.pdfFile && book.pdfFile.trim() && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (book.pdfFile) {
                              window.open(`${API_ENDPOINTS.UPLOADS.BASE}${book.pdfFile}`, '_blank');
                            }
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2,
                            },
                          }}
                        >
                          <DownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          PDF
                        </Button>
                      )}
                    </Box>
                    {!isAdmin && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<BorrowIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (book._id) {
                            handleBorrowBook(book._id);
                          }
                        }}
                        disabled={book.availableCopies === 0}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 2,
                          },
                          opacity: book.availableCopies === 0 ? 0.6 : 1,
                        }}
                      >
                        Request
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Book Detail Modal */}
        <Dialog
          open={bookDetailOpen}
          onClose={() => setBookDetailOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          {selectedBook ? (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedBook.title || 'Unknown Title'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  by {selectedBook.author || 'Unknown Author'}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={selectedBook.coverImage ? `${API_ENDPOINTS.UPLOADS.BASE}${selectedBook.coverImage}` : '/placeholder-book.jpg'}
                      alt={selectedBook.title || 'Book cover'}
                      sx={{
                        objectFit: 'cover',
                        borderRadius: 2,
                        bgcolor: 'grey.100'
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-book.jpg';
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Book Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">ISBN</Typography>
                          <Typography variant="body1">{selectedBook.isbn || 'Not available'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Genre</Typography>
                          <Chip label={selectedBook.genre || 'Not specified'} size="small" color="primary" />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Publication Year</Typography>
                          <Typography variant="body1">{selectedBook.publicationYear || 'Not specified'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Publisher</Typography>
                          <Typography variant="body1">{selectedBook.publisher || 'Not specified'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Total Copies</Typography>
                          <Typography variant="body1">{selectedBook.totalCopies || 0}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Available Copies</Typography>
                          <Typography variant="body1" color={(selectedBook.availableCopies || 0) > 0 ? 'success.main' : 'error.main'}>
                            {selectedBook.availableCopies || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {(selectedBook.description) && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {selectedBook.description}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {selectedBook.pdfFile && selectedBook.pdfFile.trim() && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            if (selectedBook.pdfFile) {
                              window.open(`${API_ENDPOINTS.UPLOADS.BASE}${selectedBook.pdfFile}`, '_blank');
                            }
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          📄 Download PDF
                        </Button>
                      )}
                      {!isAdmin && (selectedBook.availableCopies || 0) > 0 && (
                        <Button
                          variant="contained"
                          startIcon={<BorrowIcon />}
                          onClick={() => {
                            handleBorrowBook(selectedBook._id);
                            setBookDetailOpen(false);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          Request This Book
                        </Button>
                      )}
                      {isAdmin === true && (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              handleOpenDialog(selectedBook);
                              setBookDetailOpen(false);
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            Edit Book
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              handleDelete(selectedBook._id);
                              setBookDetailOpen(false);
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            Delete Book
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setBookDetailOpen(false)}>Close</Button>
              </DialogActions>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">Loading book details...</Typography>
            </Box>
          )}
        </Dialog>

        {/* Add/Edit Book Dialog */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Simple Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Book Files</Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        {...getRootProps()}
                        sx={{
                          border: '2px dashed',
                          borderColor: formData.coverImage ? 'success.main' : (isDragActive ? 'primary.main' : 'grey.400'),
                          borderRadius: 1,
                          p: 1.5,
                          textAlign: 'center',
                          cursor: uploadingImage ? 'not-allowed' : 'pointer',
                          backgroundColor: formData.coverImage ? 'success.50' : (isDragActive ? 'primary.50' : 'grey.50'),
                          minHeight: 90,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: formData.coverImage ? 'success.main' : 'primary.main',
                            backgroundColor: formData.coverImage ? 'success.50' : 'primary.50',
                          },
                        }}
                      >
                        <input {...getInputProps()} />
                        {formData.coverImage ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}>
                              📖 Cover Image
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                              {formData.coverImage.split('/').pop()}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <UploadIcon sx={{ fontSize: 24, color: 'grey.500', mb: 0.5 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              {uploadingImage ? 'Uploading...' : 'Cover Image'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        {...getPdfRootProps()}
                        sx={{
                          border: '2px dashed',
                          borderColor: formData.pdfFile ? 'success.main' : (isPdfDragActive ? 'secondary.main' : 'grey.400'),
                          borderRadius: 1,
                          p: 1.5,
                          textAlign: 'center',
                          cursor: uploadingPdf ? 'not-allowed' : 'pointer',
                          backgroundColor: formData.pdfFile ? 'success.50' : (isPdfDragActive ? 'secondary.50' : 'grey.50'),
                          minHeight: 90,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: formData.pdfFile ? 'success.main' : 'secondary.main',
                            backgroundColor: formData.pdfFile ? 'success.50' : 'secondary.50',
                          },
                        }}
                      >
                        <input {...getPdfInputProps()} />
                        {formData.pdfFile ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}>
                              📄 PDF Document
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                              {formData.pdfFile.split('/').pop()}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <UploadIcon sx={{ fontSize: 24, color: 'grey.500', mb: 0.5 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              {uploadingPdf ? 'Uploading...' : 'PDF (Optional)'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>


                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Author"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="ISBN"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Genre</InputLabel>
                    <Select
                      value={formData.genre}
                      label="Genre"
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      required
                    >
                      <MenuItem value="Fiction">Fiction</MenuItem>
                      <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                      <MenuItem value="Mystery">Mystery</MenuItem>
                      <MenuItem value="Romance">Romance</MenuItem>
                      <MenuItem value="Science Fiction">Science Fiction</MenuItem>
                      <MenuItem value="Fantasy">Fantasy</MenuItem>
                      <MenuItem value="Biography">Biography</MenuItem>
                      <MenuItem value="History">History</MenuItem>
                      <MenuItem value="Dystopian">Dystopian</MenuItem>
                      <MenuItem value="Thriller">Thriller</MenuItem>
                      <MenuItem value="Horror">Horror</MenuItem>
                      <MenuItem value="Adventure">Adventure</MenuItem>
                      <MenuItem value="Poetry">Poetry</MenuItem>
                      <MenuItem value="Drama">Drama</MenuItem>
                      <MenuItem value="Comedy">Comedy</MenuItem>
                      <MenuItem value="Philosophy">Philosophy</MenuItem>
                      <MenuItem value="Religion">Religion</MenuItem>
                      <MenuItem value="Science">Science</MenuItem>
                      <MenuItem value="Technology">Technology</MenuItem>
                      <MenuItem value="Art">Art</MenuItem>
                      <MenuItem value="Music">Music</MenuItem>
                      <MenuItem value="Sports">Sports</MenuItem>
                      <MenuItem value="Travel">Travel</MenuItem>
                      <MenuItem value="Cooking">Cooking</MenuItem>
                      <MenuItem value="Health">Health</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="Business">Business</MenuItem>
                      <MenuItem value="Law">Law</MenuItem>
                      <MenuItem value="Politics">Politics</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Publication Year"
                    type="number"
                    required
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Total Copies"
                    type="number"
                    required
                    value={formData.totalCopies}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        totalCopies: total,
                        availableCopies: editingBook ? formData.availableCopies : total
                      });
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Available Copies"
                    type="number"
                    required
                    value={formData.availableCopies}
                    onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) })}
                    disabled={!editingBook}
                    helperText={editingBook ? "" : "Automatically set to Total Copies"}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingBook ? 'Update' : 'Add'} Book
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Floating Action Button for Admins */}
        {isAdmin === true && (
          <Fab
            color="primary"
            aria-label="add book"
            onClick={() => handleOpenDialog()}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <AddIcon />
          </Fab>
        )}
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
            Please log in to request books from the library.
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
              navigate('/login');
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

export default Books;