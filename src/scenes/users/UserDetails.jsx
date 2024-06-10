import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, Avatar, Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { fetchUserDetail, updateUserDetail } from '../../api/userApi';
import Header from '../../components/Header';

const UserDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserDetail = async () => {
      try {
        const data = await fetchUserDetail(id);
        setUser(data);
      } catch (err) {
        setError(`Failed to fetch user details: ${err.message}`);
      }
    };
    getUserDetail();
  }, [id]);

  const handleFieldChange = (field, value) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserDetail(id, user);
      setEditMode(false);
    } catch (err) {
      setError(`Failed to update user details: ${err.message}`);
    }
  };

  const handleEditToggle = () => {
    setEditMode((prevState) => !prevState);
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box m="20px">
      <Header title="USER DETAILS" subtitle={`Details for User ID: ${id}`} />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Button
                variant="contained"
                onClick={handleBack}
                style={{
                  backgroundColor: colors.blueAccent[500],
                  color: colors.primary[900],
                }}
              >
                Back
              </Button>
              <Box>
                <Button
                  variant="contained"
                  onClick={handleEditToggle}
                  style={{
                    backgroundColor: colors.greenAccent[400],
                    color: colors.primary[900],
                    marginRight: 8
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
                {editMode && (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    style={{
                      backgroundColor: colors.greenAccent[400],
                      color: colors.primary[900],
                    }}
                  >
                    Save
                  </Button>
                )}
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} display="flex" justifyContent="center" alignItems="center">
                <Avatar src={user.profilePicture} alt="Profile Picture" sx={{ width: 150, height: 150 }} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box mb={2}>
                  <Typography variant="h6">Full Name</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.fullName || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Email</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.email || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Phone Number</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.phoneNumber || ''}
                      onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.phoneNumber || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Year of Birth</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.yearOfBirth || ''}
                      onChange={(e) => handleFieldChange('yearOfBirth', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.yearOfBirth || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Address</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.address || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Balance</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.balance || ''}
                      onChange={(e) => handleFieldChange('balance', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.balance || 'N/A'}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserDetails;
