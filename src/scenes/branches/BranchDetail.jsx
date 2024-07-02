import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, CardMedia, Grid, Modal, IconButton, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { fetchBranchById, updateBranch, fetchPricesByBranchId } from '../../api/branchApi';
import Header from '../../components/Header';
import { storageDb } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const BranchDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [prices, setPrices] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getBranchData = async () => {
      try {
        const branchData = await fetchBranchById(branchId);
        if (branchData.branchPicture) {
          branchData.branchPicture = JSON.parse(branchData.branchPicture); // Parse branchPicture to an array
        }
        setBranch(branchData);
        setPreviewImages(branchData.branchPicture || []);

        const pricesData = await fetchPricesByBranchId(branchId);
        setPrices(pricesData);
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
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      console.error('Some files were not valid');
    }

    setImages(prevImages => [...prevImages, ...validFiles]);
    setPreviewImages(prevPreviewImages => [...prevPreviewImages, ...validFiles.map(file => URL.createObjectURL(file))]);
  };

  const handleSave = async () => {
    try {
      let imageUrls = [];

      if (images.length > 0) {
        const uploadImageTasks = images.map(async (image) => {
          const imageRef = ref(storageDb, `BranchImage/${v4()}`);
          await uploadBytes(imageRef, image);
          const url = await getDownloadURL(imageRef);
          return url;
        });

        const newImageUrls = await Promise.all(uploadImageTasks);
        const existingImageUrls = Array.isArray(branch.branchPicture) ? branch.branchPicture : JSON.parse(branch.branchPicture || '[]');
        imageUrls = [...existingImageUrls, ...newImageUrls];
      } else {
        imageUrls = Array.isArray(branch.branchPicture) ? branch.branchPicture : JSON.parse(branch.branchPicture || '[]');
      }

      const branchData = {
        ...branch,
        branchPicture: JSON.stringify(imageUrls),
      };

      const formData = new FormData();
      Object.keys(branchData).forEach(key => {
        if (key === 'openDay') {
          formData.append(key, branchData[key]);
        } else if (key !== 'branchPictures') {
          formData.append(key, branchData[key]);
        }
      });

      if (images.length > 0) {
        images.forEach(file => {
          formData.append('BranchPictures', file, file.name);
        });
      }

      await updateBranch(branchId, formData);

      setBranch((prevBranch) => ({
        ...prevBranch,
        branchPicture: imageUrls,
      }));
      setImages([]);
      setPreviewImages(imageUrls);
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

  const handleOpenModal = (index) => {
    setCurrentImageIndex(index);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? previewImages.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === previewImages.length - 1 ? 0 : prevIndex + 1));
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

  const currentImageUrl = previewImages[currentImageIndex] || '';

  const groupedPrices = prices.reduce((acc, price) => {
    if (price.type === 'By day') {
      if (price.isWeekend) {
        acc['By day'] = acc['By day'] || {};
        acc['By day'].weekend = price.slotPrice;
      } else {
        acc['By day'] = acc['By day'] || {};
        acc['By day'].weekday = price.slotPrice;
      }
    } else {
      acc[price.type] = price.slotPrice;
    }
    return acc;
  }, {});

  return (
    <Box m="20px">
      <Header title="Branch Detail" subtitle="Details of the branch" />
      <Card sx={{ maxWidth: 1000, margin: '0 auto', mt: 4, backgroundColor: colors.primary[700], borderRadius: 2 }}>
        <Grid container>
          <Grid item xs={12} sm={5} position="relative">
            <IconButton
              onClick={handlePrevImage}
              sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', zIndex: 1 }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <CardMedia
              component="img"
              alt="Branch"
              height="100%"
              image={currentImageUrl}
              title="Branch"
              sx={{ borderRadius: '8px 0 0 8px', height: '100%', objectFit: 'cover' }}
              onClick={() => handleOpenModal(currentImageIndex)}
            />
            <IconButton
              onClick={handleNextImage}
              sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', zIndex: 1 }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
            {previewImages.length > 0 && (
              <Box display="flex" justifyContent="center" mt={2}>
                {previewImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Thumbnail ${index}`}
                    width="50"
                    height="50"
                    style={{ cursor: 'pointer', margin: '0 5px', border: currentImageIndex === index ? '2px solid red' : 'none' }}
                    onClick={() => handleOpenModal(index)}
                  />
                ))}
              </Box>
            )}
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
                      multiple
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

              <Typography variant="h6" color={colors.primary[100]} sx={{ mt: 4, mb: 2 }}>
                Prices:
              </Typography>
              {groupedPrices['By day'] && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>By day:</strong>
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" color={colors.primary[200]} gutterBottom>
                      <strong>Weekend:</strong> {groupedPrices['By day'].weekend}
                    </Typography>
                    <Typography variant="body2" color={colors.primary[200]} gutterBottom>
                      <strong>Weekday:</strong> {groupedPrices['By day'].weekday}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              {groupedPrices['Flex'] && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Flex:</strong> {groupedPrices['Flex']}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              {groupedPrices['Fix'] && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" color={colors.primary[200]} gutterBottom>
                    <strong>Fix:</strong> {groupedPrices['Fix']}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
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

      <Modal
        open={open}
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box position="relative" bgcolor="background.paper" p={4}>
          <IconButton
            onClick={handlePrevImage}
            sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)' }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <img src={currentImageUrl} alt="Branch" style={{ maxHeight: '80vh', maxWidth: '80vw' }} />
          <IconButton
            onClick={handleNextImage}
            sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)' }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Modal>
    </Box>
  );
};

export default BranchDetail;
