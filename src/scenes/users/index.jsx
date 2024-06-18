import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, IconButton, InputBase, Modal, TextField } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchTeamData, createUser, updateUserBanStatus, fetchRoleByUserId } from '../../api/userApi';
import Header from '../../components/Header';
import SearchIcon from "@mui/icons-material/Search";
import { GrView } from "react-icons/gr"; // Import GrView icon
import './style.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', phone: '' });
  const query = useQuery();
  const navigate = useNavigate();

  const pageQuery = parseInt(query.get('pageNumber')) || 1;
  const sizeQuery = parseInt(query.get('pageSize')) || 10;

  const [page, setPage] = useState(pageQuery - 1);
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query.get('search') || "");

  const userRole = useMemo(() => localStorage.getItem("userRole"), []);

  const getTeamData = useCallback(async (page, pageSize, searchQuery = "") => {
    try {
      const data = await fetchTeamData(page + 1, pageSize, searchQuery.trim());
      if (data.items && Array.isArray(data.items)) {
        const itemsWithRoles = await Promise.all(data.items.map(async (item, index) => {
          const role = await fetchRoleByUserId(item.id); // Fetch role for each user
          return {
            ...item,
            rowNumber: index + 1 + page * pageSize,
            banned: item.lockoutEnabled === false,
            role: role // Add the role to the item
          };
        }));
        setTeamData(itemsWithRoles);
        setRowCount(data.totalCount);
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (err) {
      setError(`Failed to fetch team data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    getTeamData(page, pageSize, searchQuery);
  }, [page, pageSize, searchQuery, getTeamData]);

  const handlePageClick = useCallback((event) => {
    const newPage = event.selected;
    setPage(newPage);
    if (userRole === 'Admin') {
      navigate(`/Users?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
    } else if (userRole === 'Staff') {
      navigate(`/staff/Users?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
    }
  }, [navigate, pageSize, userRole]);

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    if (userRole === 'Admin') {
      navigate(`/Users?pageNumber=1&pageSize=${newSize}`);
    } else if (userRole === 'Staff') {
      navigate(`/staff/Users?pageNumber=1&pageSize=${newSize}`);
    }
  }, [navigate, userRole]);

  const handleSearchSubmit = useCallback(async () => {
    setPage(0);
    if (userRole === 'Admin') {
      navigate(`/Users?pageNumber=1&pageSize=${pageSize}&search=${searchQuery.trim()}`);
    } else if (userRole === 'Staff') {
      navigate(`/staff/Users?pageNumber=1&pageSize=${pageSize}&search=${searchQuery.trim()}`);
    }
    getTeamData(0, pageSize, searchQuery);
  }, [getTeamData, navigate, pageSize, searchQuery, userRole]);

  const handleBanToggle = useCallback(async (id, currentStatus) => {
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
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleCreateNew = useCallback(() => {
    setOpenCreateModal(true);
  }, []);

  const handleViewUser = useCallback((id) => {
    if (userRole === 'Admin') {
      navigate(`/Users/${id}`);
    } else if (userRole === 'Staff') {
      navigate(`/staff/Users/${id}`);
    }
  }, [navigate, userRole]);

  const handleCreateUserChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  const handleCreateUserSubmit = useCallback(async () => {
    try {
      await createUser(newUser);
      setOpenCreateModal(false);
      // Optionally, refetch the data to update the UI
      getTeamData(page, pageSize, searchQuery);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }, [createUser, getTeamData, newUser, page, pageSize, searchQuery]);

  const handleCreateModalClose = useCallback(() => {
    setOpenCreateModal(false);
  }, []);

  return (
    <Box m="20px">
      <Header title="USER" subtitle="Managing Users" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by User ID"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
                <SearchIcon />
              </IconButton>
            </Box>
            {userRole === 'Admin' && (
              <Button
                variant="contained"
                style={{
                  marginLeft: 8,
                  backgroundColor: colors.greenAccent[400],
                  color: colors.primary[900],
                }}
                onClick={handleCreateNew}
              >
                Create New
              </Button>
            )}
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>ID</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>User Name</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Email</TableCell>
                  
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Phone Number</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Phone Confirmed</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>2FA Enabled</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Role</TableCell>
                  <TableCell align="center" style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Action</TableCell>
                  <TableCell align="center" style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Access</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.length > 0 ? (
                  teamData.map((row) => (
                    <TableRow key={row.id} style={row.banned ? { backgroundColor: colors.redAccent[100] } : null}>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.rowNumber}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>
                        {row.userName}
                      </TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>
                        {row.email}
                      </TableCell>
                      
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>
                        {row.phoneNumber || 'N/A'}
                      </TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.phoneNumberConfirmed ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.twoFactorEnabled ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>
                        {row.role}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleViewUser(row.id)} style={{ color: colors.greenAccent[400] }}>
                          <GrView />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() => handleBanToggle(row.id, row.banned)}
                          variant="contained"
                          size="small"
                          style={{
                            marginLeft: 8,
                            backgroundColor: row.banned
                              ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400])
                              : (theme.palette.mode === 'dark' ? colors.greenAccent[600] : colors.greenAccent[400]),
                            color: colors.primary[900]
                          }}
                        >
                          {row.banned ? 'Unban' : 'Ban'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}
            >
              {[10, 15, 20, 25, 50].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={Math.ceil(rowCount / pageSize)}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          </Box>
        </Box>
      )}

      <Modal open={openCreateModal} onClose={handleCreateModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb="20px">Create New User</Typography>
          <TextField label="Username" name="username" value={newUser.username} onChange={handleCreateUserChange} fullWidth margin="normal" />
          <TextField label="Email" name="email" value={newUser.email} onChange={handleCreateUserChange} fullWidth margin="normal" />
          <TextField label="Phone" name="phone" value={newUser.phone} onChange={handleCreateUserChange} fullWidth margin="normal" />
          <Button variant="contained" color="primary" onClick={handleCreateUserSubmit} fullWidth>Create</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Users;
