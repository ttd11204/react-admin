// src/scenes/branches/index.jsx

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputBase, IconButton } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranches, fetchBranchById } from '../../api/branchApi';
import Header from '../../components/Header';
import SearchIcon from '@mui/icons-material/Search';
import '../users/style.css'; // Ensure correct CSS file path

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
  const [searchTerm, setSearchTerm] = useState("");

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
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Branches?pageNumber=${newPage + 1}&pageSize=${pageSize}`); // Update URL
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(`/Branches?pageNumber=1&pageSize=${newSize}`); // Update URL
  };

  const handleView = (branchId) => {
    navigate(`/Courts?branchId=${branchId}`);
  };

  const handleEdit = (branchId) => {
    navigate(`/Branches/edit/${branchId}`);
  };

  const handleCreateNew = () => {
    navigate('/BranchForm');
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) {
      try {
        const data = await fetchBranches(pageQuery, sizeQuery);
        setBranchesData(data.items);
        setRowCount(data.totalCount);
      } catch (error) {
        setError('Failed to fetch branches data');
      }
    } else {
      try {
        const branch = await fetchBranchById(searchTerm);
        setBranchesData([branch]);
        setRowCount(1);
      } catch (error) {
        setError('Failed to fetch branch data');
        setBranchesData([]);
        setRowCount(0);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <Box m="20px">
      <Header title="BRANCHES" subtitle="List of Branches" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Branch ID"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              onClick={handleCreateNew}
              style={{
                backgroundColor: colors.greenAccent[400],
                color: colors.primary[900],
                marginLeft: 8
              }}
            >
              Create New
            </Button>
          </Box>
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
                      <TableCell>{branch.branchAddress}</TableCell>
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

export default Branches;

