import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchTeamData, updateUserBanStatus } from '../../api/userApi';
import Header from '../../components/Header';
import './style.css'; // Đảm bảo bạn đã nhập đúng file CSS của mình

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

  const [page, setPage] = useState(pageQuery - 1); // Chuyển đổi chỉ số trang sang 0-based cho ReactPaginate
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTeamData = async () => {
      try {
        const data = await fetchTeamData(page + 1, pageSize); // Chuyển đổi chỉ số trang sang 1-based
        console.log('Fetched team data:', data); // In ra dữ liệu trả về từ API

        if (data.items && Array.isArray(data.items)) {
          const numberedData = data.items.map((item, index) => ({
            ...item,
            rowNumber: index + 1 + page * pageSize
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
  }, [page, pageSize]); // Lắng nghe sự thay đổi của page và pageSize

  const handlePageClick = (event) => {
    console.log('Page change:', event.selected); // In ra chỉ số trang mới
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Users?pageNumber=${newPage + 1}&pageSize=${pageSize}`); // Cập nhật URL
  };

  const handlePageSizeChange = (event) => {
    console.log('Page size change:', event.target.value); // In ra kích thước trang mới
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(`/Users?pageNumber=1&pageSize=${newSize}`); // Cập nhật URL
  };

  const handleUpdate = (id) => {
    console.log(`Update user with id: ${id}`);
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
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.userName}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.email}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.emailConfirmed ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.phoneNumber || 'N/A'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.phoneNumberConfirmed ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? (theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[400]) : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000') }}>{row.twoFactorEnabled ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="center">
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
              pageCount={Math.ceil(rowCount / pageSize)} // Tính toán số trang dựa trên số lượng bản ghi thực tế
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
