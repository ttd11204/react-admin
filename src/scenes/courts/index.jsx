import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { fetchCourts } from '../../api/courtApi';
import Header from '../../components/Header';

const Courts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [courtsData, setCourtsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCourtsData = async () => {
      try {
        const data = await fetchCourts();
        setCourtsData(data);
      } catch (err) {
        setError('Failed to fetch courts data');
      }
    };
    getCourtsData();
  }, []);

  const handleEdit = (id) => {
    // Logic for edit action
    console.log(`Edit court with id: ${id}`);
  };

  const handleDelete = (id) => {
    // Logic for delete action
    console.log(`Delete court with id: ${id}`);
  };

  const columns = [
    { field: 'courtId', headerName: 'Court ID', flex: 1 },
    { field: 'branchId', headerName: 'Branch ID', flex: 1 },
    { field: 'courtName', headerName: 'Court Name', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 2,
      valueGetter: (params) => params.row.branch ? params.row.branch.address : 'N/A'
    },
    { field: 'status', headerName: 'Status', flex: 0.5,
      renderCell: ({ row }) => (
        <Typography>{row.status ? 'Active' : 'Inactive'}</Typography>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <Button 
            onClick={() => handleEdit(row.courtId)} 
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
            onClick={() => handleDelete(row.courtId)} 
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
      <Header title="COURTS" subtitle="List of Courts" />
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
            rows={courtsData}
            columns={columns}
            getRowId={(row) => row.courtId}
          />
        </Box>
      )}
    </Box>
  );
};

export default Courts;
