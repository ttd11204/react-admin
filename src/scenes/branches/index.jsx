import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, IconButton, InputBase, Modal, TextField } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranches, fetchBranchById, createBranch, updateBranch } from '../../api/branchApi';
import Header from '../../components/Header';
import SearchIcon from '@mui/icons-material/Search';
import '../users/style.css';

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
  const [openCreateModal, setOpenCreateModal] = useState(false); // State to control the create modal
  const [openEditModal, setOpenEditModal] = useState(false); // State to control the edit modal
  const [newBranch, setNewBranch] = useState({
    branchAddress: "",
    branchName: "",
    branchPhone: "",
    description: "",
    branchPicture: "",
    openTime: "",
    closeTime: "",
    openDay: "",
    status: ""
  });
  const [currentBranch, setCurrentBranch] = useState({
    branchId: "",
    branchAddress: "",
    branchName: "",
    branchPhone: "",
    description: "",
    branchPicture: "",
    openTime: "",
    closeTime: "",
    openDay: "",
    status: ""
  });

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

  const handleEdit = async (branchId) => {
    try {
      const branch = await fetchBranchById(branchId);
      setCurrentBranch(branch);
      setOpenEditModal(true);
    } catch (error) {
      setError('Failed to fetch branch data');
    }
  };

  const handleCreateNew = async () => {
    try {
      await createBranch(newBranch);
      setOpenCreateModal(false);
      const data = await fetchBranches(pageQuery, sizeQuery);
      setBranchesData(data.items);
      setRowCount(data.totalCount);
    } catch (error) {
      setError('Failed to create branch');
    }
  };

  const handleUpdateBranch = async () => {
    try {
      await updateBranch(currentBranch.branchId, currentBranch);
      setOpenEditModal(false);
      const data = await fetchBranches(pageQuery, sizeQuery);
      setBranchesData(data.items);
      setRowCount(data.totalCount);
    } catch (error) {
      setError('Failed to update branch');
    }
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewBranch(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentBranch(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateModalClose = () => {
    setOpenCreateModal(false);
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
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
                onKeyDown={handleKeyPress}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              onClick={() => setOpenCreateModal(true)}
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
              <Typography variant="h6" mb="20px">Create New Branch</Typography>
              <TextField label="Branch Address" name="branchAddress" value={newBranch.branchAddress} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Branch Name" name="branchName" value={newBranch.branchName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Branch Phone" name="branchPhone" value={newBranch.branchPhone} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Description" name="description" value={newBranch.description} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Branch Picture" name="branchPicture" value={newBranch.branchPicture} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Open Time" name="openTime" value={newBranch.openTime} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Close Time" name="closeTime" value={newBranch.closeTime} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Open Day" name="openDay" value={newBranch.openDay} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField label="Status" name="status" value={newBranch.status} onChange={handleInputChange} fullWidth margin="normal" />
              <Button variant="contained" color="primary" onClick={handleCreateNew} fullWidth>Create</Button>
            </Box>
          </Modal>

          <Modal open={openEditModal} onClose={handleEditModalClose}>
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
              <Typography variant="h6" mb="20px">Edit Branch</Typography>
              <TextField label="Branch Address" name="branchAddress" value={currentBranch.branchAddress} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Branch Name" name="branchName" value={currentBranch.branchName} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Branch Phone" name="branchPhone" value={currentBranch.branchPhone} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Description" name="description" value={currentBranch.description} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Branch Picture" name="branchPicture" value={currentBranch.branchPicture} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Open Time" name="openTime" value={currentBranch.openTime} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Close Time" name="closeTime" value={currentBranch.closeTime} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Open Day" name="openDay" value={currentBranch.openDay} onChange={handleEditInputChange} fullWidth margin="normal" />
              <TextField label="Status" name="status" value={currentBranch.status} onChange={handleEditInputChange} fullWidth margin="normal" />
              <Button variant="contained" color="primary" onClick={handleUpdateBranch} fullWidth>Save</Button>
            </Box>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

export default Branches;
