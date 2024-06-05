import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, TextField } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchTeamData, updateUserBanStatus, updateUserDetail } from '../../api/userApi';
import Header from '../../components/Header';
import './style.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();

  const pageQuery = parseInt(query.get('pageNumber')) || 1;
  const sizeQuery = parseInt(query.get('pageSize')) || 10;

  const [page, setPage] = useState(pageQuery - 1);
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    const getTeamData = async () => {
      try {
        const data = await fetchTeamData(page + 1, pageSize);
        console.log('Fetched team data:', data);

        if (data.items && Array.isArray(data.items)) {
          const numberedData = data.items.map((item, index) => ({
            ...item,
            rowNumber: index + 1 + page * pageSize,
            banned: item.lockoutEnabled === false
          }));
          setTeamData(numberedData);
          setRowCount(data.totalCount);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        setError(`Failed to fetch team data: ${err.message}`);
      }
    };
    getTeamData();
  }, [page, pageSize]);

  const handlePageClick = (event) => {
    console.log('Page change:', event.selected);
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Users?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
  };

  const handlePageSizeChange = (event) => {
    console.log('Page size change:', event.target.value);
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(`/Users?pageNumber=1&pageSize=${newSize}`);
  };

  const handleEditToggle = (id) => {
    setEditMode((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const handleFieldChange = (id, field, value) => {
    setTeamData((prevData) =>
      prevData.map((user) =>
        user.id === id ? { ...user, [field]: value } : user
      )
    );
  };

  const handleSave = async (id) => {
    const user = teamData.find((user) => user.id === id);
    console.log('User data:', user);  // Log dữ liệu người dùng để kiểm tra
  
    if (user) {
      // Tạm thời gán userDetailId nếu thiếu
      if (!user.userDetailId) {
        user.userDetailId = user.id;  // Gán userDetailId bằng id của user, thay đổi tùy theo yêu cầu của backend
      }
  
      try {
        const userDetails = {
          userDetailId: user.userDetailId,  // Sử dụng ID của userDetail đúng cách
          balance: user.balance || 0,
          fullName: user.fullName || '',
          status: user.status !== undefined ? user.status : true,
          user: {
            id: user.id,
            userName: user.userName,
            normalizedUserName: user.normalizedUserName || '',
            email: user.email,
            normalizedEmail: user.normalizedEmail || '',
            emailConfirmed: user.emailConfirmed,
            passwordHash: user.passwordHash || '',
            securityStamp: user.securityStamp || '',
            concurrencyStamp: user.concurrencyStamp || '',
            phoneNumber: user.phoneNumber || '',
            phoneNumberConfirmed: user.phoneNumberConfirmed || false,
            twoFactorEnabled: user.twoFactorEnabled || false,
            lockoutEnd: user.lockoutEnd || null,
            lockoutEnabled: user.lockoutEnabled || false,
            accessFailedCount: user.accessFailedCount || 0
          }
        };
  
        console.log('Updating user details:', userDetails);  // Log dữ liệu gửi đi
        const response = await updateUserDetail(userDetails.userDetailId, userDetails);
        console.log('Update response:', response);  // Log phản hồi từ API
  
        // Cập nhật trạng thái hiển thị dữ liệu sau khi cập nhật thành công
        if (response || response === '') {
          setTeamData((prevData) =>
            prevData.map((u) => (u.id === id ? { ...u, ...userDetails } : u))
          );
          setEditMode((prevState) => ({
            ...prevState,
            [id]: false
          }));
          console.log('Update successful');
        } else {
          console.error('Update failed with no response');
          setError('Update failed with no response');
        }
      } catch (error) {
        console.error('Failed to update user detail:', error);
        setError(`Failed to update user detail: ${error.message}`);
      }
    } else {
      console.error('userDetailId is missing for user:', id);
      setError('userDetailId is missing.');
    }
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

  return (
    <Box m="20px">
      <Header title="USER" subtitle="Managing Users" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>ID</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>User Name</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Email</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Email Confirmed</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Phone Number</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>Phone Confirmed</TableCell>
                  <TableCell style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>2FA Enabled</TableCell>
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
                        {editMode[row.id] ? (
                          <TextField
                            value={row.userName}
                            onChange={(e) => handleFieldChange(row.id, 'userName', e.target.value)}
                            size="small"
                          />
                        ) : (
                          row.userName
                        )}
                      </TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>
                        {editMode[row.id] ? (
                          <TextField
                            value={row.email}
                            onChange={(e) => handleFieldChange(row.id, 'email', e.target.value)}
                            size="small"
                          />
                        ) : (
                          row.email
                        )}
                      </TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.emailConfirmed ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>
                        {editMode[row.id] ? (
                          <TextField
                            value={row.phoneNumber || ''}
                            onChange={(e) => handleFieldChange(row.id, 'phoneNumber', e.target.value)}
                            size="small"
                          />
                        ) : (
                          row.phoneNumber || 'N/A'
                        )}
                      </TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.phoneNumberConfirmed ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.twoFactorEnabled ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="center">
                        {editMode[row.id] ? (
                          <Button
                            onClick={() => handleSave(row.id)}
                            variant="contained"
                            size="small"
                            style={{
                              marginLeft: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900]
                            }}
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleEditToggle(row.id)}
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
                        )}
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
    </Box>
  );
};

export default Users;
