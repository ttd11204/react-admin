import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { fetchReviews } from '../../api/reviewApi';
import Header from '../../components/Header';

const Reviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reviewsData, setReviewsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getReviewsData = async () => {
      try {
        const data = await fetchReviews();
        setReviewsData(data);
      } catch (err) {
        setError('Failed to fetch reviews data');
      }
    };
    getReviewsData();
  }, []);

  const handleEdit = (id) => {
    // Logic for edit action
    console.log(`Edit review with id: ${id}`);
  };

  const handleDelete = (id) => {
    // Logic for delete action
    console.log(`Delete review with id: ${id}`);
  };

  const columns = [
    { field: 'courtId', headerName: 'Court ID', flex: 1 },
    { field: 'reviewText', headerName: 'Review Text', flex: 2 },
    { field: 'reviewDate', headerName: 'Review Date', flex: 1,
      renderCell: ({ row }) => (
        <Typography>{new Date(row.reviewDate).toLocaleDateString()}</Typography>
      )
    },
    { field: 'rating', headerName: 'Rating', flex: 0.5 },
    { field: 'user.userName', headerName: 'User Name', flex: 1,
      valueGetter: (params) => params.row.user ? params.row.user.userName : 'N/A'
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <Button 
            onClick={() => handleEdit(row.reviewId)} 
            variant="contained" 
            size="small" 
            style={{ 
              marginRight: 8,
              backgroundColor: colors.greenAccent[400],
              color: colors.primary[900]
            }}
          >
            Edit
          </Button>
          <Button 
            onClick={() => handleDelete(row.reviewId)} 
            variant="contained" 
            size="small" 
            style={{ 
              backgroundColor: colors.redAccent[400],
              color: colors.primary[900]
            }}
          >
            Delete
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box m="20px">
      <Header title="REVIEWS" subtitle="List of Reviews" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh" sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none"
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300]
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none"
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400]
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700]
          }
        }}>
          <DataGrid
            rows={reviewsData}
            columns={columns}
            getRowId={(row) => row.reviewId}
          />
        </Box>
      )}
    </Box>
  );
};

export default Reviews;
