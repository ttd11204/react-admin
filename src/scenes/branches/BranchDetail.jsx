import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Card, CardContent, CardMedia, Grid, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranchById, updateBranch } from '../../api/branchApi';
import Header from '../../components/Header';
import { storageDb } from '../../firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { v4 } from 'uuid';

const BranchDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const getBranchData = async () => {
      try {
        const data = await fetchBranchById(branchId);
        setBranch(data);
      } catch (err) {
        setError('Failed to fetch branch data');
      }
    };
    getBranchData();
  }, [branchId]);

  const handleFieldChange = (field, value) => {
    setBranch((prevBranch) => ({
      ...prevBranch,
      [field]: value,
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      if (file.size > 5 * 1024 * 1024) { // Limit 5MB
        console.error('File size exceeds 5MB');
        return;
      }
      setImage(file);
      setImageRef(ref(storageDb, `BranchImage/${v4()}`));
      const previewImage1 = URL.createObjectURL(file);
      setPreviewImage(previewImage1);
      console.log(previewImage1);
    } else {
      console.error('File is not a PNG, JPEG, or JPG image');
    }
  };

  const handleSave = async () => {
    try {
      let imageUrl = branch.branchPicture;

      if (image && imageRef) {
        if (branch.branchPicture) {
          const oldPath = branch.branchPicture.split('court-callers.appspot.com/o/')[1].split('?')[0];
          const imagebefore = ref(storageDb, decodeURIComponent(oldPath));
          await deleteObject(imagebefore);
        }
        const snapshot = await uploadBytes(imageRef, image);
        console.log('Uploaded a file!', snapshot);

        imageUrl = await getDownloadURL(imageRef);
      }

      await updateBranch(branchId, { ...branch, branchPicture: imageUrl });
      setBranch((prevBranch) => ({
        ...prevBranch,
        branchPicture: imageUrl,
      }));
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
      setEditMode(false);
    } catch (err) {
      setError(`Failed to update branch details: ${err.message}`);
    }
  };

  const handleEditToggle = () => {
    setEditMode((prevState) => !prevState);
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (error) {
    return (
      <Box m="20px">
        <Header title="Branch Detail" subtitle="Details of the branch" />
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!branch) {
    return (
      <Box m="20px">
        <Header title="Branch Detail" subtitle="Details of the branch" />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const imageUrl = previewImage || branch.branchPicture;
  console.log('Image URL:', imageUrl);

  return (
    <Box m="20px">
      <Header title="Branch Detail" subtitle="Details of the branch" />
      <Card sx={{ maxWidth: 1000, margin: '0 auto', mt: 4, backgroundColor: colors.primary[700], borderRadius: 2 }}>
        <Grid container>
          <Grid item xs={12} sm={5}>
            <CardMedia
              component="img"
              alt="Branch"
              height="100%"
              image={imageUrl}
              title="Branch"
              sx={{ borderRadius: '8px 0 0 8px', height: '100%', objectFit: 'cover' }}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <CardContent sx={{ p: 4 }}>
              <Typography gutterBottom variant="h4" component="div" color={colors.primary[100]} sx={{ mb: 2 }}>
                {editMode ? (
                  <TextField
                    fullWidth
                    value={branch.branchName}
                    onChange={(e) => handleFieldChange('branchName', e.target.value)}
                    size="small"
                  />
                ) : (
                  branch.branchName
                )}
              </Typography>
              {editMode ? (
                <>
                  <TextField
                    fullWidth
                    label="Branch Address"
                    value={branch.branchAddress}
                    onChange={(e) => handleFieldChange('branchAddress', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Branch Phone"
                    value={branch.branchPhone}
                    onChange={(e) => handleFieldChange('branchPhone', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={branch.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Open Time"
                    value={branch.openTime}
                    onChange={(e) => handleFieldChange('openTime', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Close Time"
                    value={branch.closeTime}
                    onChange={(e) => handleFieldChange('closeTime', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Open Day"
                    value={branch.openDay}
                    onChange={(e) => handleFieldChange('openDay', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Status"
                    value={branch.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Box mb={2}>
                    <Typography variant="h6">Branch Picture</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Branch ID:</strong> {branch.branchId}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Branch Address:</strong> {branch.branchAddress}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Branch Phone:</strong> {branch.branchPhone}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Description:</strong> {branch.description}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Open Time:</strong> {branch.openTime}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Close Time:</strong> {branch.closeTime}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Open Day:</strong> {branch.openDay}
                  </Typography>
                  <Typography variant="body1" color={colors.primary[200]}>
                    <strong>Status:</strong> {branch.status}
                  </Typography>
                </>
              )}
            </CardContent>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="center" m={2}>
          <Button
            variant="contained"
            onClick={handleBack}
            style={{
              backgroundColor: colors.blueAccent[500],
              color: colors.primary[900],
              marginRight: 8
            }}
          >
            Back
          </Button>
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
                color: colors.primary[900]
              }}
            >
              Save
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default BranchDetail;
