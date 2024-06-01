import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { fetchBranches } from '../../api/branchApi';
import Header from '../../components/Header';

const Branches = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [branchesData, setBranchesData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBranchesData = async () => {
      try {
        const data = await fetchBranches();
        setBranchesData(data);
      } catch (err) {
        setError('Failed to fetch branches data');
      }
    };
    getBranchesData();
  }, []);

  const columns = [
    { field: 'branchId', headerName: 'Branch ID', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 2 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'openTime', headerName: 'Open Time', flex: 1 },
    { field: 'closeTime', headerName: 'Close Time', flex: 1 },
    { field: 'openDay', headerName: 'Open Day', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 0.5,
      renderCell: ({ row }) => (
        <Typography>{row.status ? 'Active' : 'Inactive'}</Typography>
      )
    }
  ];

  return (
    <Box m="20px">
      <Header title="BRANCHES" subtitle="List of Branches" />
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
            rows={branchesData}
            columns={columns}
            getRowId={(row) => row.branchId}
          />
        </Box>
      )}
    </Box>
  );
};

export default Branches;
