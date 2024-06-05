import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranches } from '../../api/branchApi';
import Header from '../../components/Header';
import '../users/style.css'; // Đảm bảo bạn đã nhập đúng file CSS của mình

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Branches = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [branchesData, setBranchesData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState(null);

  const query = useQuery();
  const navigate = useNavigate();
  
  const pageQuery = parseInt(query.get('pageNumber')) || 1;
  const sizeQuery = parseInt(query.get('pageSize')) || 10;

  useEffect(() => {
    const getBranchesData = async () => {
      try {
        const data = await fetchBranches(pageQuery, sizeQuery);
        setBranchesData(data.items);
        setRowCount(data.totalCount);
      } catch (err) {
        setError('Failed to fetch branches data');
      }
    };
    getBranchesData();
  }, [page, pageSize, pageQuery, sizeQuery]);

  const handlePageClick = (event) => {
    console.log('Page change:', event.selected); // In ra chỉ số trang mới
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Branches?pageNumber=${newPage + 1}&pageSize=${pageSize}`); // Cập nhật URL
  };

  const handlePageSizeChange = (event) => {
    console.log('Page size change:', event.target.value); // In ra kích thước trang mới
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(`/Branches?pageNumber=1&pageSize=${newSize}`); // Cập nhật URL
  };

  const handleView = (branchId) => {
    navigate(`/Courts?branchId=${branchId}`);
  };

  const handleEdit = (branchId) => {
    navigate(`/Branches/edit/${branchId}`);
  };

  return (
    <Box m="20px">
      <Header title="BRANCHES" subtitle="List of Branches" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Open Time</TableCell>
                  <TableCell>Close Time</TableCell>
                  <TableCell>Open Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branchesData.length > 0 ? (
                  branchesData.map((branch) => (
                    <TableRow key={branch.branchId}>
                      <TableCell>{branch.branchId}</TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.description}</TableCell>
                      <TableCell>{branch.openTime}</TableCell>
                      <TableCell>{branch.closeTime}</TableCell>
                      <TableCell>{branch.openDay}</TableCell>
                      <TableCell>{branch.status ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <Button
                            variant="contained"
                            style={{ backgroundColor: colors.greenAccent[500], color: 'black' }}
                            onClick={() => handleView(branch.branchId)}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            style={{ backgroundColor: colors.greenAccent[500], color: 'black', marginLeft: '8px' }}
                            onClick={() => handleEdit(branch.branchId)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
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

export default Branches;
