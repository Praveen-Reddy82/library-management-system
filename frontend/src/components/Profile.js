import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Avatar,
  Chip,
  Divider,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  LibraryBooks as LibraryIcon,
  Edit as EditIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';

const Profile = () => {
  const { user, isAdmin, updateProfile } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.BY_ID(user._id));
      setUserDetails(response.data);
    } catch (error) {
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    const displayUser = userDetails || user;
    setFormData({
      name: displayUser.name || '',
      phone: displayUser.phone || '',
      address: displayUser.address || '',
    });
    setEditOpen(true);
    setError('');
    setSuccess('');
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        await fetchUserDetails();
        setTimeout(() => {
          handleEditClose();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordClick = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordOpen(true);
    setError('');
    setSuccess('');
  };

  const handlePasswordClose = () => {
    setPasswordOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setChangingPassword(false);
      return;
    }

    try {
      const response = await axios.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        handlePasswordClose();
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  const displayUser = userDetails || user;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            My Profile
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handlePasswordClick}
              sx={{ borderRadius: 2 }}
            >
              Change Password
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{ borderRadius: 2 }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>

        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mb: 2,
                  boxShadow: 3,
                }}
              >
                {displayUser.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {displayUser.name || 'Unknown User'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {isAdmin && (
                  <Chip
                    icon={<AdminIcon />}
                    label="Administrator"
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                <Chip
                  label={`${displayUser.membershipType ? displayUser.membershipType.charAt(0).toUpperCase() + displayUser.membershipType.slice(1) : 'Member'}`}
                  color={displayUser.membershipType === 'staff' ? 'primary' : displayUser.membershipType === 'student' ? 'secondary' : 'default'}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BadgeIcon color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      User ID
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      color: 'primary.main',
                    }}
                  >
                    {displayUser.membershipId || 'N/A'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Mobile Number
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {displayUser.phone || 'N/A'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Member Since
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {formatDate(displayUser.joinDate)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LibraryIcon color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Status
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {displayUser.isActive ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip label="Inactive" color="default" size="small" />
                    )}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Phone
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {displayUser.phone || 'Not provided'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {displayUser.address || 'Not provided'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    helperText="Optional: Enter your phone number"
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    helperText="Optional: Enter your address"
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
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={passwordOpen} onClose={handlePasswordClose} maxWidth="sm" fullWidth>
          <form onSubmit={handlePasswordSubmit}>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    helperText="Must be at least 6 characters long"
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordData.newPassword !== '' && passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                    helperText={
                      passwordData.newPassword !== '' && passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword
                        ? 'Passwords do not match'
                        : 'Re-enter your new password'
                    }
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
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePasswordClose} disabled={changingPassword}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={changingPassword}>
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Profile;
