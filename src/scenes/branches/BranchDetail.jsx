import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, CardMedia, Grid, Modal, IconButton, Divider, Checkbox, FormControlLabel } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { fetchBranchById, updateBranch, fetchPricesByBranchId } from '../../api/branchApi';
import Header from '../../components/Header';
import { storageDb } from '../../firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { v4 } from 'uuid';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';

const BranchDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [prices, setPrices] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState([]);
  const [imageRef, setImageRef] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const getBranchData = async () => {
      try {
        const branchData = await fetchBranchById(branchId);
        if (branchData.branchPicture) {
          branchData.branchPicture = JSON.parse(branchData.branchPicture);
        }
        setBranch(branchData);

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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    const validPictureTypes = files.filter((file) => {
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidSize || !isValidType) {
        console.error('File is not a correct type of image or exceeds the size limit');
      }
      return isValidType && isValidSize;
    });

    const newPreviews = validPictureTypes.map(file => URL.createObjectURL(file));
    setImage(prevImages => [...prevImages, ...validPictureTypes]);
    setImageRef(prevImageRefs => [...prevImageRefs, ...validPictureTypes.map(() => ref(storageDb, `BranchImage/${v4()}`))]);
    setPreviewImage(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const handleSave = async () => {
    try {
      const branchPictures = image || [];
      let imageUrls = Array.isArray(branch.branchPicture) ? branch.branchPicture : JSON.parse(branch.branchPicture || '[]');

      if (branchPictures.length > 0) {
        const uploadImageTasks = branchPictures.map(async (image) => {
          const imageRef = ref(storageDb, `BranchImage/${v4()}`);
          await uploadBytes(imageRef, image);
          const url = await getDownloadURL(imageRef);
          return url;
        });

        const newImageUrls = await Promise.all(uploadImageTasks);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const branchData = {
        ...branch,
        branchPicture: JSON.stringify(imageUrls),
      };

      const formData = new FormData();
      Object.keys(branchData).forEach(key => {
        formData.append(key, branchData[key]);
      });

      imageUrls.forEach((url, index) => {
        formData.append(`ExistingImages[${index}]`, url);
      });

      if (branchPictures.length > 0) {
        branchPictures.forEach(file => {
          formData.append('BranchPictures', file, file.name);
        });
      }

      await updateBranch(branchId, formData);

      setBranch((prevBranch) => ({
        ...prevBranch,
        branchPicture: imageUrls,
      }));
      previewImage.forEach(url => URL.revokeObjectURL(url));
      setPreviewImage([]);
      setEditMode(false);
    } catch (err) {
      setError(`Failed to update branch details: ${err.message}`);
    }
  };

  const handleEditToggle = () => {
    setEditMode((prevState) => !prevState);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenModal = (index) => {
    setCurrentImageIndex(index);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? branch.branchPicture.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === branch.branchPicture.length - 1 ? 0 : prevIndex + 1));
  };

  const handleImageSelection = (index) => {
    setSelectedImages((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };

  const handleDeleteSelectedImages = async () => {
    try {
      const existPicture = branch.branchPicture;
      const imageRefsToDelete = selectedImages.map((index) => ref(storageDb, existPicture[index]));

      await Promise.all(imageRefsToDelete.map((imageRef) => deleteObject(imageRef)));

      const updatedImages = existPicture.filter((_, index) => !selectedImages.includes(index));
      const updatedBranch = { ...branch, branchPicture: JSON.stringify(updatedImages) };

      const formData = new FormData();
      formData.append('branchId', branch.branchId);
      formData.append('branchAddress', branch.branchAddress);
      formData.append('branchName', branch.branchName);
      formData.append('branchPhone', branch.branchPhone);
      formData.append('description', branch.description);
      formData.append('branchPicture', JSON.stringify(updatedImages));
      formData.append('openTime', branch.openTime);
      formData.append('closeTime', branch.closeTime);
      formData.append('openDay', branch.openDay);
      formData.append('status', branch.status);

      updatedImages.forEach((url) => {
        formData.append('ExistingImages', url);
      });

      await updateBranch(branchId, formData);

      setBranch(updatedBranch);
      setSelectedImages([]);
      setCurrentImageIndex(0);
      setOpen(false);
    } catch (err) {
      setError(`Failed to delete images: ${err.message}`);
    }
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

  const currentImageUrl = previewImage.length > 0 ? previewImage[currentImageIndex] : (Array.isArray(branch.branchPicture) ? branch.branchPicture[currentImageIndex] : '');

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
            {Array.isArray(branch.branchPicture) && (
              <Box display="flex" justifyContent="center" mt={2} flexWrap="wrap">
                {branch.branchPicture.map((url, index) => (
                  <Box key={index} position="relative" sx={{ margin: '0 5px' }}>
                    <img
                      src={url}
                      alt={`Thumbnail ${index}`}
                      width="50"
                      height="50"
                      style={{ cursor: 'pointer', border: currentImageIndex === index ? '2px solid red' : 'none' }}
                      onClick={() => handleOpenModal(index)}
                    />
                  </Box>
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
                    <Box display="flex" flexWrap="wrap">
                      {Array.isArray(branch.branchPicture) && branch.branchPicture.map((url, index) => (
                        <Box key={index} position="relative" sx={{ margin: '0 5px' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedImages.includes(index)}
                                onChange={() => handleImageSelection(index)}
                              />
                            }
                            label={
                              <img
                                src={url}
                                alt={`Thumbnail ${index}`}
                                width="50"
                                height="50"
                                style={{ cursor: 'pointer', border: currentImageIndex === index ? '2px solid red' : 'none' }}
                                onClick={() => handleOpenModal(index)}
                              />
                            }
                          />
                        </Box>
                      ))}
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
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
                color: colors.primary[900],
                marginRight: 8
              }}
            >
              Save
            </Button>
          )}
          {editMode && (
            <Button
              variant="contained"
              onClick={handleDeleteSelectedImages}
              style={{
                backgroundColor: colors.redAccent[400],
                color: colors.primary[900]
              }}
            >
              Delete Selected Images
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
