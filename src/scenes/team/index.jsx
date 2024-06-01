// team.js
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { fetchTeamData, updateUserBanStatus } from '../../api/userApi';
import Header from '../../components/Header';
import '../../scenes/team/style.css';

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTeamData = async () => {
      try {
        const data = await fetchTeamData();
        // Filter out unwanted fields and add ban status
        const filteredData = data.map(({ 
          id, 
          userName, 
          email, 
          emailConfirmed, 
          phoneNumber, 
          phoneNumberConfirmed, 
          twoFactorEnabled 
        }) => ({
          id, 
          userName, 
          email, 
          emailConfirmed, 
          phoneNumber, 
          phoneNumberConfirmed, 
          twoFactorEnabled,
          banned: false // Add ban status
        }));
        setTeamData(filteredData);
      } catch (err) {
        setError('Failed to fetch team data');
      }
    };
    getTeamData();
  }, []);

  const handleUpdate = (id) => {
    // Logic for update action
    console.log(`Update user with id: ${id}`);
  };

  const handleDelete = (id) => {
    // Logic for delete action
    console.log(`Delete user with id: ${id}`);
  };

  const handleBanToggle = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await updateUserBanStatus(id, updatedStatus);
      setTeamData((prevData) =>
        prevData.map((user) =>
          user.id === id ? { ...user, banned: updatedStatus } : user
        )
      );
    } catch (error) {
      console.error('Failed to update user ban status:', error);
    }
  };

  const columns = [
    { field: 'userName', headerName: 'User Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { 
      field: 'emailConfirmed', 
      headerName: 'Email Confirmed', 
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.emailConfirmed ? 'Yes' : 'No'}</Typography>
      )
    },
    { field: 'phoneNumber', headerName: 'Phone Number', flex: 1 },
    { 
      field: 'phoneNumberConfirmed', 
      headerName: 'Phone Confirmed', 
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.phoneNumberConfirmed ? 'Yes' : 'No'}</Typography>
      )
    },
    { 
      field: 'twoFactorEnabled', 
      headerName: '2FA Enabled', 
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.twoFactorEnabled ? 'Yes' : 'No'}</Typography>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      cellClassName: "action-column--cell",
      renderCell: ({ row }) => (
        <Box>
          <Button 
            onClick={() => handleUpdate(row.id)} 
            variant="contained" 
            size="small" 
            style={{ 
              marginLeft: 8,
              backgroundColor: colors.greenAccent[400],
              color: colors.primary[900]
            }}
          >
            Edit
          </Button>
          <Button 
            onClick={() => handleDelete(row.id)} 
            variant="contained" 
            size="small" 
            style={{ 
              marginLeft: 8,
              backgroundColor: colors.redAccent[400],
              color: colors.primary[900]
            }}
          >
            Delete
          </Button>
        </Box>
      )
    },
    {
      field: 'access',
      headerName: 'Access',
      flex: 1,
      cellClassName: "action-column--cell",
      renderCell: ({ row }) => (
        <Button 
          onClick={() => handleBanToggle(row.id, row.banned)} 
          variant="contained" 
          size="small" 
          style={{ 
            marginLeft: 8,
            backgroundColor: row.banned ? colors.redAccent[600] : colors.greenAccent[600],
            color: colors.primary[900]
          }}
        >
          {row.banned ? 'Unban' : 'Ban'}
        </Button>
      )
    }
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the team Members" />
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
          },
          "& .banned": {
            backgroundColor: colors.redAccent[100] + " !important",
            color: colors.primary[900] + " !important"
          }
        }}>
          <DataGrid
            rows={teamData}
            columns={columns}
            getRowClassName={(params) => params.row.banned ? 'banned' : ''}
          />
        </Box>
      )}
    </Box>
  );
};

export default Team;
