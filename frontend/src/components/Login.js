import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { LibraryBooks as LibraryIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.name === 'userId' 
      ? e.target.value.toUpperCase() 
      : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.userId, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LibraryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Library Login
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Sign in to access your library account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="userId"
            label="User ID"
            name="userId"
            autoComplete="username"
            autoFocus
            value={formData.userId}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={<LoginIcon />}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Contact administrator to create an account
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;