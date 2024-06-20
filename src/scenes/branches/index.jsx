import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, IconButton, InputBase, Modal, TextField } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranches, fetchBranchById, createBranch, updateBranch } from '../../api/branchApi';
import Header from '../../components/Header';
import SearchIcon from '@mui/icons-material/Search';
import '../users/style.css';
import { storageDb } from '../../firebase'
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from "firebase/storage";
import { v4 } from 'uuid';
import './custom-datetime.css';

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
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [image, setImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [previewImages, setPreviewImages] = useState(null);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  const [newBranch, setNewBranch] = useState({
    branchAddress: "",
    branchName: "",
    branchPhone: "",
    description: "",
    branchPicture: "",
    openTime: "",
    closeTime: "",
    openDay: { day1: "", day2: "" },
    status: "Inactive",
    weekdayPrice: "",
    weekendPrice: ""
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
    openDay: { day1: "", day2: "" },
    status: "",
    weekdayPrice: "",
    weekendPrice: ""
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
    navigate(`/Branches?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(`/Branches?pageNumber=1&pageSize=${newSize}`);
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

      
      // Tải lên các ảnh và lấy URL
      const uploadimage = newBranch.branchPictures.map(async (image) => {
        const imageRef = ref(storageDb, `BranchImage/${v4()}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        return url;
      });

      const imageUrls = await Promise.all(uploadimage);

      // Tạo dữ liệu chi nhánh mới
      const branchData = {
        ...newBranch,
        branchPicture: JSON.stringify(imageUrls),
      };


      const formData = new FormData();
      Object.keys(branchData).forEach(key => {
        if (key === 'openDay') {
          formData.append(key, `${branchData.openDay.day1} to ${branchData.openDay.day2}`);
        } else if (key === 'branchPictures') {
          branchData.branchPictures.forEach(file => {
            formData.append('BranchPictures', file);
          });
        } else {
          formData.append(key, branchData[key]);
        }
      });

      // Gọi API để tạo chi nhánh mới
      await createBranch(formData);
      setOpenCreateModal(false);

      // Cập nhật danh sách chi nhánh sau khi tạo mới
      const data = await fetchBranches(pageQuery, sizeQuery);
      setBranchesData(data.items);
      setRowCount(data.totalCount);

    
    } catch (error) {
      setError('Failed to create branch');
    }
  };


  const handleUpdateBranch = async () => {
    try {
      const uploadimage = newBranch.branchPictures.map(async (image) => {
        const imageRef = ref(storageDb, `BranchImage/${v4()}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        return url;
      });





      const formData = new FormData();
      Object.keys(currentBranch).forEach(key => {
        if (key === 'openDay') {
          formData.append(key, `${currentBranch.openDay.day1} to ${currentBranch.openDay.day2}`);
        } else {
          formData.append(key, currentBranch[key]);
        }
      });
      await updateBranch(currentBranch.branchId, formData);
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    const validPictureTypes = files.filter((file) => {
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidSize || !isValidType) {
        console.error('File is not a correct type of image or exceeds the size limit');
      }
      return isValidType && isValidSize;
    });

    const previewUrls = validPictureTypes.map(file => URL.createObjectURL(file));

    setNewBranch(prevState => ({
      ...prevState,
      branchPictures: prevState.branchPictures ? [...prevState.branchPictures, ...validPictureTypes] : [...validPictureTypes]
    }));

    setPreviewImages(prevState => prevState ? [...prevState, ...previewUrls] : [...previewUrls]);
  };





  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setNewBranch(prevState => ({
      ...prevState,
      openDay: {
        ...prevState.openDay,
        [name]: value
      }
    }));
  };


  // Xử lý xóa ảnh
  const handleImageRemove = (index) => {
    setNewBranch(prevState => ({
      ...prevState,
      branchPictures: prevState.branchPictures.filter((_, i) => i !== index)
    }));
    setPreviewImages(prevState => prevState.filter((_, i) => i !== index));

    // Đặt lại giá trị của input file để cập nhật số lượng tệp hiển thị
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };





  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentBranch(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditFileChange = (event) => {
    const file = event.target.files[0];
    setCurrentBranch(prevState => ({
      ...prevState,
      branchPicture: file
    }));
  };

  const handleEditSelectChange = (event) => {
    const { name, value } = event.target;
    setCurrentBranch(prevState => ({
      ...prevState,
      openDay: {
        ...prevState.openDay,
        [name]: value
      }
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
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
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
                      <TableCell>{branch.branchName}</TableCell>
                      <TableCell>{branch.branchAddress}</TableCell>
                      <TableCell>{branch.openTime}</TableCell>
                      <TableCell>{branch.closeTime}</TableCell>
                      <TableCell>{branch.openDay}</TableCell>
                      <TableCell>{branch.status}</TableCell>
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
                width: '80%',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" mb="20px">Create New Branch</Typography>
              <Box display="flex" justifyContent="space-between">
                <Box width="48%">
                  <TextField label="Branch Address" name="branchAddress" value={newBranch.branchAddress} onChange={handleInputChange} fullWidth margin="normal" />
                  <TextField label="Branch Name" name="branchName" value={newBranch.branchName} onChange={handleInputChange} fullWidth margin="normal" />
                  <TextField label="Branch Phone" name="branchPhone" value={newBranch.branchPhone} onChange={handleInputChange} fullWidth margin="normal" />
                  <TextField label="Description" name="description" value={newBranch.description} onChange={handleInputChange} fullWidth margin="normal" />
                  <Typography mt={2} mb={2} variant="subtitle1">Branch picture</Typography>
                  <input type="file" accept='image/' multiple onChange={handleFileChange} ref={fileInputRef} className="hidden-file-input" />
                  <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                    {previewImages && previewImages.map((image, index) => (
                      <Box key={index} position="relative" display="inline-block">
                        <img src={image} alt={`Preview ${index}`} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
                        <Button
                          size="small"
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            color: 'red',
                            minWidth: '24px',
                            minHeight: '24px',
                            padding: 0
                          }}
                          onClick={() => handleImageRemove(index)}
                        >
                          X
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box width="48%">
                  <TextField label="Open Time" name="openTime" value={newBranch.openTime} onChange={handleInputChange} fullWidth margin="normal" />
                  <TextField label="Close Time" name="closeTime" value={newBranch.closeTime} onChange={handleInputChange} fullWidth margin="normal" />
                  <TextField label="Weekday Price" name="weekdayPrice" value={newBranch.weekdayPrice} onChange={handleInputChange} fullWidth margin="normal" />
                  <TextField label="Weekend Price" name="weekendPrice" value={newBranch.weekendPrice} onChange={handleInputChange} fullWidth margin="normal" />
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle1">Open Day</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Select
                        label="Day 1"
                        name="day1"
                        value={newBranch.openDay.day1}
                        onChange={handleSelectChange}
                        fullWidth
                      >
                        {daysOfWeek.map(day => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                      <Select
                        label="Day 2"
                        name="day2"
                        value={newBranch.openDay.day2}
                        onChange={handleSelectChange}
                        fullWidth
                      >
                        {daysOfWeek.map(day => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" sx={{ backgroundColor: colors.greenAccent[700], color: 'white' }} onClick={handleCreateNew}
             >
                  Create
                </Button>
              </Box>
            </Box>
          </Modal>

          <Modal open={openEditModal} onClose={handleEditModalClose}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h6" mb="20px">Edit Branch</Typography>
              <Box display="flex" justifyContent="space-between">
                <Box width="48%">
                  <TextField label="Branch Address" name="branchAddress" value={currentBranch.branchAddress} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <TextField label="Branch Name" name="branchName" value={currentBranch.branchName} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <TextField label="Branch Phone" name="branchPhone" value={currentBranch.branchPhone} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <TextField label="Description" name="description" value={currentBranch.description} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <Typography mt={2} mb={2} variant="subtitle1">Branch picture</Typography>
                  <input type="file" accept='image/' multiple onChange={handleEditFileChange} />
                </Box>
                <Box width="48%">
                  <TextField label="Open Time" name="openTime" value={currentBranch.openTime} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <TextField label="Close Time" name="closeTime" value={currentBranch.closeTime} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <TextField label="Weekday Price" name="weekdayPrice" value={currentBranch.weekdayPrice} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <TextField label="Weekend Price" name="weekendPrice" value={currentBranch.weekendPrice} onChange={handleEditInputChange} fullWidth margin="normal" />
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle1">Open Day</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Select
                        label="Day 1"
                        name="day1"
                        value={currentBranch.openDay.day1}
                        onChange={handleEditSelectChange}
                        fullWidth
                      >
                        {daysOfWeek.map(day => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                      <Select
                        label="Day 2"
                        name="day2"
                        value={currentBranch.openDay.day2}
                        onChange={handleEditSelectChange}
                        fullWidth
                      >
                        {daysOfWeek.map(day => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle1">Status</Typography>
                    <Select
                      label="Status"
                      name="status"
                      value={currentBranch.status}
                      onChange={handleEditInputChange}
                      fullWidth
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button sx={{ backgroundColor: colors.greenAccent[700], color: 'white' }} onClick={handleUpdateBranch} >Save</Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

export default Branches
