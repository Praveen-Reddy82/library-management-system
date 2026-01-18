import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  AppBar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  LibraryBooks as LibraryIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  AccountCircle as AccountIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    text: 'Books',
    icon: <BookIcon />,
    path: '/books',
  },
  {
    text: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
    adminOnly: true,
  },
  {
    text: 'Borrowings',
    icon: <AssignmentIcon />,
    path: '/borrowings',
    requiresAuth: true,
  },
  {
    text: 'Profile',
    icon: <AccountIcon />,
    path: '/profile',
    requiresAuth: true,
  },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Filter menu items based on user role and authentication
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.requiresAuth && !user) return false;
    return true;
  });

  // Drawer content component
  const drawerContent = (
    <>
      <Toolbar sx={{ justifyContent: 'center', py: 2, flexDirection: 'column', minHeight: 'auto' }}>
        <Box
          component={Link}
          to="/"
          onClick={() => isMobile && setMobileOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
            textDecoration: 'none',
            color: 'white',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          <LibraryIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
          <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
            {isMobile ? "Library" : "Library MS"}
          </Typography>
        </Box>

        {/* User Info Section */}
        {user && (
          <Box
            component={Link}
            to="/profile"
            onClick={(e) => {
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              textDecoration: 'none',
              color: 'white',
              cursor: 'pointer',
              width: '100%',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleProfileMenuOpen(e);
              }}
              sx={{ color: 'white', p: 0.5 }}
            >
              <Avatar sx={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }} noWrap>
                {user.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isAdmin && <AdminIcon sx={{ fontSize: 12 }} />}
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {isAdmin ? 'Admin' : 'Member'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

      <List sx={{ pt: 2, flexGrow: 1, px: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: isMobile ? 40 : 45 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'medium',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Auth Buttons */}
      <Box sx={{ p: 2 }}>
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Logout
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => {
              navigate('/login');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Login
          </Button>
        )}
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                color: 'white',
                flexGrow: 1,
              }}
            >
              <LibraryIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Library
              </Typography>
            </Box>
            {user && (
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ color: 'white' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {drawerContent}
        </Drawer>
      )}

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;