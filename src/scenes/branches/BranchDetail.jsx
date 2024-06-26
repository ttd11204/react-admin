import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranchById } from '../../api/branchApi';
import Header from '../../components/Header';

const BranchDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { branchId } = useParams();
  const [branch, setBranch] = useState(null);
  const [error, setError] = useState(null);

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
              image={`https://courtcaller.azurewebsites.net/${branch.branchPicture}`}
              title="Branch"
              sx={{ borderRadius: '8px 0 0 8px', height: '100%', objectFit: 'cover' }}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <CardContent sx={{ p: 4 }}>
              <Typography gutterBottom variant="h4" component="div" color={colors.primary[100]} sx={{ mb: 2 }}>
                {branch.branchName}
              </Typography>
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
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default BranchDetail;
