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

// Responsive drawer widths with smooth transitions
const getDrawerWidth = (isMobile, isTablet, isDesktop, isCollapsed = false) => {
  if (isCollapsed && isDesktop) return 72; // Icon-only mode for desktop
  if (isMobile) return 300; // Full mobile width
  if (isTablet) return 280; // Tablet width
  return isDesktop ? 320 : 280; // Desktop width
};

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
  const [tabletOpen, setTabletOpen] = useState(true); // Default open for tablets
  const [desktopCollapsed, setDesktopCollapsed] = useState(false); // Collapsible desktop sidebar

  // Updated responsive breakpoints for better UX
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Mobile: < 960px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // Tablet: 960px - 1280px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // Desktop: > 1280px

  const drawerWidth = getDrawerWidth(isMobile, isTablet, isDesktop, desktopCollapsed && isDesktop);

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
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else if (isTablet) {
      setTabletOpen(!tabletOpen);
    } else if (isDesktop) {
      setDesktopCollapsed(!desktopCollapsed);
    }
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
      <Toolbar sx={{
        justifyContent: desktopCollapsed && isDesktop ? 'center' : 'center',
        py: isMobile ? 2 : 2.5,
        flexDirection: 'column',
        minHeight: 'auto',
        px: isMobile ? 1.5 : 2.5,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: desktopCollapsed && isDesktop ? '60%' : '80%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }}>
        <Box
          component={Link}
          to="/"
          onClick={() => (isMobile || isTablet) && handleDrawerToggle()}
          sx={{
            display: 'flex',
            alignItems: desktopCollapsed && isDesktop ? 'center' : 'center',
            flexDirection: desktopCollapsed && isDesktop ? 'column' : 'row',
            gap: desktopCollapsed && isDesktop ? 0.75 : 1.25,
            mb: 1.5,
            textDecoration: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: 2,
            p: desktopCollapsed && isDesktop ? 1 : 0.75,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'scale(1.05) translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },
            '&:active': {
              transform: 'scale(0.98) translateY(0px)',
            }
          }}
        >
          <LibraryIcon sx={{
            fontSize: desktopCollapsed && isDesktop ? 32 : (isMobile ? 32 : isTablet ? 36 : 40),
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} />
          {(!desktopCollapsed || !isDesktop) && (
            <Typography
              variant={isMobile ? "h6" : isTablet ? "h5" : "h5"}
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {isMobile ? "Library" : isTablet ? "Lib MS" : "Library MS"}
            </Typography>
          )}
        </Box>

        {/* User Info Section */}
        {user && (
          <Box
            component={Link}
            to="/profile"
            onClick={(e) => {
              if (isMobile || isTablet) {
                handleDrawerToggle();
              }
            }}
            sx={{
              display: desktopCollapsed && isDesktop ? 'flex' : 'flex',
              alignItems: 'center',
              justifyContent: desktopCollapsed && isDesktop ? 'center' : 'flex-start',
              flexDirection: desktopCollapsed && isDesktop ? 'column' : 'row',
              gap: desktopCollapsed && isDesktop ? 0.75 : 1.25,
              mt: 1.5,
              textDecoration: 'none',
              color: 'white',
              cursor: 'pointer',
              width: '100%',
              px: isMobile ? 1 : 1.25,
              py: 1,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                transition: 'left 0.5s ease-in-out',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                '&::before': {
                  left: '100%',
                }
              },
              '&:active': {
                transform: 'translateY(-1px) scale(0.98)',
              }
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleProfileMenuOpen(e);
              }}
              sx={{
                color: 'white',
                p: isMobile ? 0.5 : 0.75,
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }}
            >
              <Avatar sx={{
                width: desktopCollapsed && isDesktop ? 36 : (isMobile ? 32 : isTablet ? 36 : 40),
                height: desktopCollapsed && isDesktop ? 36 : (isMobile ? 32 : isTablet ? 36 : 40),
                bgcolor: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                fontSize: isMobile ? '1rem' : '1.125rem',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            {(!desktopCollapsed || !isDesktop) && (
              <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <Typography
                  variant={isMobile ? "body2" : "body2"}
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.3,
                    fontSize: isMobile ? '0.875rem' : '0.95rem',
                    textAlign: desktopCollapsed && isDesktop ? 'center' : 'left',
                    letterSpacing: '-0.01em',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                  noWrap
                >
                  {user.name}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: desktopCollapsed && isDesktop ? 'center' : 'flex-start',
                  gap: 0.75,
                  mt: 0.25
                }}>
                  {isAdmin && <AdminIcon sx={{
                    fontSize: isMobile ? 12 : 14,
                    color: '#ffd700',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }} />}
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.9,
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      fontWeight: 500,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      color: isAdmin ? '#ffd700' : 'rgba(255,255,255,0.9)'
                    }}
                  >
                    {isAdmin ? 'Administrator' : 'Member'}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

      <List sx={{
        pt: isMobile ? 1.5 : 3,
        flexGrow: 1,
        px: isMobile ? 1 : 1.5,
        '& .MuiListItem-root': {
          mb: isMobile ? 0.5 : 0.75,
        }
      }}>
        {filteredMenuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{
            animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
          }}>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 3,
                py: isMobile ? 1.25 : 1.5,
                px: isMobile ? 1.25 : 1.75,
                justifyContent: desktopCollapsed && isDesktop ? 'center' : 'flex-start',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.4s ease-in-out',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  transform: 'translateX(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateX(6px)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    backgroundColor: '#ffd700',
                    borderRadius: '2px 0 0 2px',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateX(6px) scale(1.02)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  '&::before': {
                    left: '100%',
                  }
                },
                '&:active': {
                  transform: 'translateX(4px) scale(0.98)',
                }
              }}
            >
              <ListItemIcon sx={{
                color: 'white',
                minWidth: desktopCollapsed && isDesktop ? 48 : (isMobile ? 48 : isTablet ? 52 : 56),
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                '& .MuiSvgIcon-root': {
                  fontSize: desktopCollapsed && isDesktop ? 24 : (isMobile ? 24 : isTablet ? 26 : 28),
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }
              }}>
                {item.icon}
              </ListItemIcon>
              {(!desktopCollapsed || !isDesktop) && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: isMobile ? '0.95rem' : isTablet ? '1rem' : '1.1rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    letterSpacing: '-0.01em',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Auth Buttons */}
      <Box sx={{
        p: isMobile ? 2 : 2.5,
        pt: isMobile ? 1.5 : 2.5,
        pb: isMobile ? 3 : 4
      }}>
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.4)',
              borderWidth: 2,
              py: isMobile ? 1.25 : 1.5,
              fontSize: isMobile ? '0.9rem' : '1.05rem',
              fontWeight: 600,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255,107,107,0.1)',
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 8px 25px rgba(255,107,107,0.3)',
                color: '#ff6b6b'
              },
              '&:active': {
                transform: 'translateY(0) scale(0.98)',
              },
              '& .MuiButton-startIcon': {
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '&:hover .MuiButton-startIcon': {
                transform: 'rotate(90deg)',
              }
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
              if (isMobile || isTablet) handleDrawerToggle();
            }}
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              color: 'white',
              py: isMobile ? 1.25 : 1.5,
              fontSize: isMobile ? '0.9rem' : '1.05rem',
              fontWeight: 600,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.2))',
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              },
              '&:active': {
                transform: 'translateY(0) scale(0.98)',
              }
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
      {/* Mobile and Tablet App Bar */}
      {(isMobile || isTablet) && (
        <AppBar
          position="fixed"
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            transition: theme.transitions.create(['margin', 'width', 'box-shadow'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(isTablet && tabletOpen && {
              marginLeft: drawerWidth,
              width: `calc(100% - ${drawerWidth}px)`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }),
          }}
        >
          <Toolbar sx={{
            minHeight: isMobile ? 64 : 72,
            px: isMobile ? 2 : 3
          }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: isMobile ? 1.5 : 2.5,
                p: 1.5,
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1) rotate(180deg)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }}
            >
              <MenuIcon sx={{
                fontSize: isMobile ? 24 : 28,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </IconButton>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 1.25 : 1.5,
                textDecoration: 'none',
                color: 'white',
                flexGrow: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 2,
                p: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.02)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                }
              }}
            >
              <LibraryIcon sx={{
                fontSize: isMobile ? 32 : 36,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }} />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {isMobile ? "Library" : "Lib MS"}
              </Typography>
            </Box>
            {user && (
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  color: 'white',
                  p: 1.25,
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
              >
                <Avatar sx={{
                  width: isMobile ? 36 : 42,
                  height: isMobile ? 36 : 42,
                  bgcolor: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  fontSize: isMobile ? '1rem' : '1.125rem',
                  fontWeight: 600,
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop and Tablet Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={isTablet ? tabletOpen : true}
          sx={{
            width: (isTablet && !tabletOpen) ? 0 : drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              transition: theme.transitions.create(['width', 'transform'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              ...(isTablet && !tabletOpen && {
                transform: 'translateX(-100%)',
              }),
              // Add collapse button for desktop
              position: 'relative',
              '&::before': isDesktop ? {
                content: '""',
                position: 'absolute',
                top: '50%',
                right: -12,
                width: 24,
                height: 48,
                backgroundColor: '#1976d2',
                borderRadius: '0 12px 12px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-50%)',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                zIndex: 1000,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  transform: 'translateY(-50%) scale(1.05)',
                }
              } : {},
            },
          }}
        >
          {drawerContent}
          {/* Collapse toggle button for desktop */}
          {isDesktop && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                top: 16,
                right: desktopCollapsed ? 12 : -12,
                width: 24,
                height: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                zIndex: 1001,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {desktopCollapsed ? <MenuIcon sx={{ fontSize: 14 }} /> : <CloseIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          )}
        </Drawer>
      )}

      {/* Mobile and Tablet Drawer */}
      {(isMobile || isTablet) && (
        <Drawer
          variant="temporary"
          open={isMobile ? mobileOpen : tabletOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRight: 'none',
              boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
            },
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: isMobile ? 1 : 1.5,
            pb: 0
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', opacity: 0.9 }}>
              {isMobile ? "Menu" : "Navigation"}
            </Typography>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
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