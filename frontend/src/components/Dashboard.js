import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Chip,
  useMediaQuery,
  useTheme,
  CardActionArea,
  Alert,
} from '@mui/material';
import {
  Book as BookIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  ShoppingCart as BorrowIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      },
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        filter: 'brightness(1.1)',
        '&::before': {
          opacity: 1,
        },
      },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant={{ xs: 'h5', sm: 'h4' }}
              component="div"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                fontSize: { xs: 40, sm: 48 },
                opacity: 0.8,
                transition: 'all 0.3s ease-in-out',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              }}
            >
              {icon}
            </Box>
            <ArrowIcon sx={{
              fontSize: { xs: 20, sm: 24 },
              opacity: 0.7,
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateX(4px)',
              },
            }} />
          </Box>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeBorrowings: 0,
    overdueBooks: 0,
    pendingRequests: 0,
  });
  const [userStats, setUserStats] = useState({
    myBorrowings: 0,
    overdueBooks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user !== undefined) {
      fetchStats();
    }
  }, [isAdmin, user]);

  const fetchStats = async () => {
    try {
      console.log('Dashboard: Fetching stats for user:', user, 'isAdmin:', isAdmin);

      if (isAdmin) {
        console.log('Dashboard: Fetching admin stats');
        const [booksRes, usersRes, borrowingsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.BOOKS.BASE),
          axios.get(API_ENDPOINTS.USERS.BASE),
          axios.get(API_ENDPOINTS.BORROWINGS.BASE),
        ]);

        console.log('Dashboard: Books response:', booksRes.data);
        console.log('Dashboard: Users response:', usersRes.data);
        console.log('Dashboard: Borrowings response:', borrowingsRes.data);

        setStats({
          totalBooks: booksRes.data?.length || 0,
          totalUsers: usersRes.data?.length || 0,
          activeBorrowings: (borrowingsRes.data || []).filter(b => b?.status === 'borrowed').length,
          overdueBooks: (borrowingsRes.data || []).filter(b => b?.status === 'overdue').length,
          pendingRequests: (borrowingsRes.data || []).filter(b => b?.status === 'pending').length,
        });
        console.log('Dashboard: Stats set:', {
          totalBooks: booksRes.data.length,
          totalUsers: usersRes.data.length,
          activeBorrowings: borrowingsRes.data.filter(b => b.status === 'borrowed').length,
          overdueBooks: borrowingsRes.data.filter(b => b.status === 'overdue').length,
          pendingRequests: borrowingsRes.data.filter(b => b.status === 'pending').length,
        });
      } else if (user && user._id) {
        console.log('Dashboard: Fetching user stats for user ID:', user._id);
        // User-specific stats
        const [, userBorrowingsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.BORROWINGS.BASE),
          axios.get(API_ENDPOINTS.USERS.BORROWINGS(user._id)),
        ]);

        setUserStats({
          myBorrowings: (userBorrowingsRes.data || []).filter(b => b?.status === 'borrowed').length,
          overdueBooks: (userBorrowingsRes.data || []).filter(b => b?.status === 'overdue').length,
        });
      }
    } catch (error) {
      console.error('Dashboard: Error fetching stats:', error);
      console.error('Dashboard: Error response:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{
        mt: { xs: 1, sm: 2, md: 4 },
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2 }
      }}>
        <Typography
          variant={{ xs: "h5", sm: "h4" }}
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: { xs: 2, sm: 3 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Welcome back, {user?.name}!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isAdmin ? (
          // Admin Dashboard
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: isMobile ? 3 : 4 }}>
              Here's an overview of your library's current status.
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <StatCard
                  title="Total Books"
                  value={stats.totalBooks}
                  icon={<BookIcon />}
                  color="#2196f3"
                  onClick={() => navigate('/books')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={<PeopleIcon />}
                  color="#4caf50"
                  onClick={() => navigate('/users')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <StatCard
                  title="Active Borrowings"
                  value={stats.activeBorrowings}
                  icon={<AssignmentIcon />}
                  color="#ff9800"
                  onClick={() => navigate('/borrowings')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <StatCard
                  title="Pending Requests"
                  value={stats.pendingRequests}
                  icon={<AssignmentIcon />}
                  color="#9c27b0"
                  onClick={() => navigate('/borrowings?status=pending')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <StatCard
                  title="Overdue Books"
                  value={stats.overdueBooks}
                  icon={<WarningIcon />}
                  color="#f44336"
                  onClick={() => navigate('/borrowings?status=overdue')}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: isMobile ? 4 : 6 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item xs={12} md={6}>
                  <CardActionArea onClick={() => navigate('/books')} sx={{ borderRadius: 2 }}>
                    <Card
                      sx={{
                        p: isMobile ? 2 : 3,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          filter: 'brightness(1.05)',
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Books Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add new books, update existing ones, and manage your library's collection.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover .arrow-icon': {
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="button" color="primary" sx={{ fontWeight: 'bold' }}>
                          Manage Books
                        </Typography>
                        <ArrowIcon
                          color="primary"
                          className="arrow-icon"
                          sx={{
                            transition: 'transform 0.2s ease-in-out',
                          }}
                        />
                      </Box>
                    </Card>
                  </CardActionArea>
                </Grid>
                <Grid item xs={12} md={6}>
                  <CardActionArea onClick={() => navigate('/users')} sx={{ borderRadius: 2 }}>
                    <Card
                      sx={{
                        p: isMobile ? 2 : 3,
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          filter: 'brightness(1.05)',
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom color="secondary.main">
                        User Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Register new users and manage membership information.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover .arrow-icon': {
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="button" color="secondary" sx={{ fontWeight: 'bold' }}>
                          Manage Users
                        </Typography>
                        <ArrowIcon
                          color="secondary"
                          className="arrow-icon"
                          sx={{
                            transition: 'transform 0.2s ease-in-out',
                          }}
                        />
                      </Box>
                    </Card>
                  </CardActionArea>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          // User Dashboard
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: isMobile ? 3 : 4 }}>
              Manage your borrowed books and explore our collection.
            </Typography>

            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={6} sm={6} md={3}>
                <CardActionArea onClick={() => navigate('/borrowings')} sx={{ borderRadius: 2 }}>
                  <StatCard
                    title="My Borrowings"
                    value={userStats.myBorrowings}
                    icon={<AssignmentIcon />}
                    color="#2196f3"
                  />
                </CardActionArea>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <CardActionArea onClick={() => navigate('/borrowings')} sx={{ borderRadius: 2 }}>
                  <StatCard
                    title="Overdue"
                    value={userStats.overdueBooks}
                    icon={<WarningIcon />}
                    color={userStats.overdueBooks > 0 ? "#f44336" : "#4caf50"}
                  />
                </CardActionArea>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', color: 'success.main' }}>
                  <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {user?.membershipType}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Membership Type
                        </Typography>
                        <Chip
                          label={user?.membershipId}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <BorrowIcon sx={{ fontSize: isMobile ? 32 : 48, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: isMobile ? 4 : 6 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item xs={12} md={6}>
                  <CardActionArea onClick={() => navigate('/books')} sx={{ borderRadius: 2 }}>
                    <Card
                      sx={{
                        p: isMobile ? 2 : 3,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          filter: 'brightness(1.05)',
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Browse Books
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Explore our collection and borrow books you're interested in.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover .arrow-icon': {
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="button" color="primary" sx={{ fontWeight: 'bold' }}>
                          Browse Books
                        </Typography>
                        <ArrowIcon
                          color="primary"
                          className="arrow-icon"
                          sx={{
                            transition: 'transform 0.2s ease-in-out',
                          }}
                        />
                      </Box>
                    </Card>
                  </CardActionArea>
                </Grid>
                <Grid item xs={12} md={6}>
                  <CardActionArea onClick={() => navigate('/borrowings')} sx={{ borderRadius: 2 }}>
                    <Card
                      sx={{
                        p: isMobile ? 2 : 3,
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          filter: 'brightness(1.05)',
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom color="warning.main">
                        My Borrowings
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        View and manage your currently borrowed books.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover .arrow-icon': {
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="button" color="warning" sx={{ fontWeight: 'bold' }}>
                          View Borrowings
                        </Typography>
                        <ArrowIcon
                          color="warning"
                          className="arrow-icon"
                          sx={{
                            transition: 'transform 0.2s ease-in-out',
                          }}
                        />
                      </Box>
                    </Card>
                  </CardActionArea>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;