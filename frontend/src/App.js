import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import { DrawerProvider, useDrawer } from './components/Navbar';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Books from './components/Books';
import Users from './components/Users';
import Borrowings from './components/Borrowings';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';

// Protected Route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed', // Modern purple
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    background: {
      default: '#f8fafc', // Subtle gray background
      paper: '#ffffff',
    },
    success: {
      main: '#059669', // Emerald
      light: '#34d399',
      dark: '#047857',
    },
    warning: {
      main: '#d97706', // Amber
      light: '#fbbf24',
      dark: '#b45309',
    },
    error: {
      main: '#dc2626', // Red
      light: '#f87171',
      dark: '#b91c1c',
    },
    info: {
      main: '#0891b2', // Cyan
      light: '#22d3ee',
      dark: '#0e7490',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
      '@media (max-width:600px)': {
        fontSize: '0.8125rem',
        lineHeight: 1.4,
      },
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Remove uppercase from buttons
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 3px 12px rgba(37, 99, 235, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            boxShadow: '0 8px 28px rgba(37, 99, 235, 0.35)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 100%)',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.03), transparent)',
            transition: 'left 0.6s ease-in-out',
          },
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            transform: 'translateY(-6px) scale(1.01)',
            border: '1px solid rgba(25, 118, 210, 0.15)',
            '&::before': {
              left: '100%',
            },
          },
          '&:active': {
            transform: 'translateY(-2px) scale(0.99)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
        },
        elevation4: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: 16,
            paddingRight: 16,
          },
          '@media (min-width:600px) and (max-width:960px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        container: {
          margin: -8,
          width: 'calc(100% + 16px)',
          '& > .MuiGrid-item': {
            padding: 8,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.16)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(25, 118, 210, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          color: '#1976d2',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.15)',
          },
        },
      },
    },
  },
});

// Global styles for better responsive design
const globalStyles = `
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  /* Enhanced focus styles for accessibility */
  .MuiButton-root:focus-visible,
  .MuiTextField-root .MuiOutlinedInput-root:focus-visible,
  .MuiCard-root:focus-visible,
  .MuiListItemButton-root:focus-visible {
    outline: 3px solid #1976d2;
    outline-offset: 2px;
    border-radius: 8px;
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.2);
  }

  /* Better focus for navigation elements */
  .MuiDrawer-paper .MuiListItemButton-root:focus-visible {
    background-color: rgba(25, 118, 210, 0.1);
    outline: 2px solid #1976d2;
    outline-offset: -2px;
  }

  /* Smooth focus transitions */
  *:focus-visible {
    transition: outline 0.2s ease, box-shadow 0.2s ease;
  }

  /* Enhanced responsive design */
  @media (max-width: 960px) { /* Mobile and small tablets */
    .MuiContainer-root {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .MuiDrawer-paper {
      width: 300px !important;
      border-radius: 0 16px 16px 0 !important;
    }

    /* Improve touch targets on mobile */
    .MuiButton-root {
      min-height: 48px !important;
      padding: 12px 16px !important;
    }

    .MuiListItemButton-root {
      min-height: 56px !important;
      padding: 12px 16px !important;
    }

    /* Better text scaling for mobile */
    body {
      font-size: 16px;
      line-height: 1.5;
    }
  }

  @media (min-width: 960px) and (max-width: 1280px) { /* Tablets */
    .MuiContainer-root {
      padding-left: 32px !important;
      padding-right: 32px !important;
    }

    .MuiDrawer-paper {
      width: 280px !important;
    }
  }

  @media (min-width: 1280px) { /* Desktop */
    .MuiContainer-root {
      padding-left: 40px !important;
      padding-right: 40px !important;
    }

    .MuiDrawer-paper {
      width: 320px !important;
    }

    /* Enhanced hover effects for desktop */
    .MuiButton-root:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .MuiCard-root:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }
  }

  /* Ultra-wide screens */
  @media (min-width: 1920px) {
    .MuiContainer-root {
      max-width: 1800px !important;
      margin: 0 auto !important;
    }
  }

  /* Smooth transitions for theme changes */
  * {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  /* Loading animation */
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  .loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }

  /* Navbar slide-in animation */
  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateX(-20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Pulse animation for active states */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    }
  }

  .pulse-animation {
    animation: pulse 2s infinite;
  }

  /* Bounce animation for icons */
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-4px);
    }
    60% {
      transform: translateY(-2px);
    }
  }

  .bounce-animation {
    animation: bounce 2s infinite;
  }

  /* Spin animation for loading states */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .spin-animation {
    animation: spin 1s linear infinite;
  }
`;

// Main App Layout component
const AppLayout = () => {
  const theme = useTheme();
  useDrawer(); // Initialize drawer context

  // Calculate the margin left for the main content based on drawer state
  const mainMarginLeft = React.useMemo(() => {
    // Drawer is fixed positioned and overlays content, so no margin needed
    return 0;
  }, []);
  
  // Note: drawerState.tabletOpen is no longer needed since we always allocate drawer space


  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      height: '100vh',
      backgroundColor: '#fafafa',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      transition: theme.transitions.create(['background'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, // Remove padding that might be causing fullscreen gap
          // Add padding to inner content instead
          backgroundColor: '#fafafa',
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          mt: { xs: '64px', sm: '72px', md: 0, lg: 0, xl: 0 }, // Space for fixed AppBar on mobile/tablet
          ml: mainMarginLeft, // Proper margin for drawer that updates with collapse state
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: 300, // Smooth transition for drawer open/close
          }),
          minHeight: '100vh',
          height: '100vh',
          width: '100%',
          overflow: 'auto',
          position: 'relative',
          // Ensure content starts at top in fullscreen
          top: 0,
          // Fix fullscreen gap issue - simplify background and remove spacing in fullscreen
          '@media screen and (display-mode: fullscreen)': {
            marginTop: '0 !important',
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
            backgroundImage: 'none !important',
            background: '#fafafa !important',
          },
          // Also try the fullscreen pseudo-class
          '&:fullscreen': {
            marginTop: '0 !important',
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
            backgroundImage: 'none !important',
            background: '#fafafa !important',
          },
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 'none', // Allow full width to prevent centering issues
          pl: { xs: 2, sm: 2, md: 0, lg: 0, xl: 0 }, // No left padding in tablet/desktop since drawer margin provides spacing
          pr: { xs: 2, sm: 2, md: 2, lg: 3, xl: 4 }, // Keep right padding for visual balance
          pt: {
            xs: 9, // Mobile: account for 56px AppBar + padding (56/8 = 7, plus 2 more for spacing = 9)
            sm: 2.5, // Small tablets
            md: 3, // Medium tablets
            lg: 4, // Desktop
            xl: 5, // Large desktop
          },
          pb: {
            xs: 1.5, // Mobile: bottom padding
            sm: 2.5, // Small tablets
            md: 3, // Medium tablets
            lg: 4, // Desktop
            xl: 5, // Large desktop
          },
          // Remove padding in fullscreen mode
          '@media screen and (display-mode: fullscreen)': {
            py: '0 !important',
          },
          '&:fullscreen': {
            py: '0 !important',
          },
          // Add smooth scrolling and better content flow
          '& > *': {
            marginBottom: { xs: 2, sm: 3, md: 4 },
            '&:last-child': {
              marginBottom: 0,
            },
          },
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/users" element={<ProtectedRoute adminOnly={true}><Users /></ProtectedRoute>} />
            <Route path="/borrowings" element={<ProtectedRoute><Borrowings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{globalStyles}</style>
      <AuthProvider>
        <DrawerProvider>
          <Router basename="/library-management-system">
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </Router>
        </DrawerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
