import React, { useEffect, useState } from "react";
import { Box, Button, InputBase, IconButton, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, FormControl, Modal } from "@mui/material";
import ReactPaginate from "react-paginate";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { fetchReviews, fetchUsers, fetchBranches, updateReview, deleteReview, searchReviewsByRating, createReview } from "../../api/reviewApi";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Reviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reviewsData, setReviewsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [searchRating, setSearchRating] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState({ reviewId: "", reviewText: "", rating: 5, userId: "", branchId: "" });
  const [newReview, setNewReview] = useState({ reviewText: "", rating: 5, userId: "", branchId: "" });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("pageNumber")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;

  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        const reviewsData = await fetchReviews(page, pageSize);
        const usersData = await fetchUsers();
        const branchesData = await fetchBranches();
        setReviewsData(reviewsData.items);
        setUsers(usersData);
        setBranches(branchesData);
        setRowCount(reviewsData.totalCount);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      }
    };
    getData();
  }, [page, pageSize]);

  const handleEditToggle = (review) => {
    setCurrentReview({
      reviewId: review.reviewId,
      reviewText: review.reviewText,
      rating: review.rating,
      userId: review.id,
      branchId: review.branchId
    });
    setOpenEditModal(true);
  };

  const handleFieldChange = (field, value) => {
    setCurrentReview((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        reviewText: currentReview.reviewText,
        rating: currentReview.rating,
        userId: currentReview.userId,
        branchId: currentReview.branchId,
      };

      await updateReview(currentReview.reviewId, payload);
      setOpenEditModal(false);
      const reviewsData = await fetchReviews(page, pageSize);
      setReviewsData(reviewsData.items);
      setRowCount(reviewsData.totalCount);
    } catch (err) {
      setError(`Failed to update review: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      setReviewsData((prev) => prev.filter((item) => item.reviewId !== id));
    } catch (err) {
      setError(`Failed to delete review: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    try {
      if (searchRating) {
        const data = await searchReviewsByRating(searchRating);
        setReviewsData(data);
      } else {
        const reviewsData = await fetchReviews(page, pageSize);
        setReviewsData(reviewsData.items);
        setRowCount(reviewsData.totalCount);
      }
    } catch (err) {
      setError(`Failed to search reviews: ${err.message}`);
    }
  };

  const handleCreateNew = async () => {
    try {
      await createReview(newReview);
      setOpenCreateModal(false);
      const reviewsData = await fetchReviews(page, pageSize);
      setReviewsData(reviewsData.items);
      setRowCount(reviewsData.totalCount);
      setNewReview({ reviewText: "", rating: 5, userId: "", branchId: "" });
    } catch (err) {
      setError(`Failed to create new review: ${err.message}`);
    }
  };

  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setSearchParams({ pageNumber: newPage, pageSize });
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSearchParams({ pageNumber: 1, pageSize: newSize });
  };

  return (
    <Box m="20px">
      <Header title="REVIEWS" subtitle="List of Reviews" />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search by Rating" value={searchRating} onChange={(e) => setSearchRating(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Button variant="contained" style={{ marginLeft: 8, backgroundColor: colors.greenAccent[400], color: colors.primary[900] }} onClick={() => setOpenCreateModal(true)}>
              Create New
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Review Text</TableCell>
                  <TableCell>Review Date</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Branch Name</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewsData.length > 0 ? (
                  reviewsData.map((row) => (
                    <TableRow key={row.reviewId}>
                      <TableCell>{row.reviewId}</TableCell>
                      <TableCell>{row.reviewText}</TableCell>
                      <TableCell>{new Date(row.reviewDate).toLocaleDateString()}</TableCell>
                      <TableCell>{row.rating}</TableCell>
                      <TableCell>{row.branchName}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell align="center">
                        <Button variant="contained" size="small" onClick={() => handleEditToggle(row)} style={{ marginRight: 8 }}>
                          Edit
                        </Button>
                        <Button variant="contained" size="small" color="error" onClick={() => handleDelete(row.reviewId)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {rowCount > 0 && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
              <Select value={pageSize} onChange={handlePageSizeChange}>
                {[10, 15, 20, 25, 50].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
              <ReactPaginate breakLabel="..." nextLabel="next >" onPageChange={handlePageClick} pageRangeDisplayed={5} pageCount={Math.ceil(rowCount / pageSize)} previousLabel="< previous" renderOnZeroPageCount={null} containerClassName={"pagination"} activeClassName={"active"} />
            </Box>
          )}
        </Box>
      )}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}>
          <Typography variant="h6" mb={2}>
            Create New Review
          </Typography>
          <TextField fullWidth variant="outlined" label="Review Text" value={newReview.reviewText} onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })} margin="normal" />
          <TextField fullWidth variant="outlined" label="Rating" type="number" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} margin="normal" />
          <FormControl fullWidth variant="outlined" margin="normal">
            <Select value={newReview.branchId} onChange={(e) => setNewReview({ ...newReview, branchId: e.target.value })}>
              {branches.map((branch) => (
                <MenuItem key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" margin="normal">
            <Select value={newReview.userId} onChange={(e) => setNewReview({ ...newReview, userId: e.target.value })}>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleCreateNew}>
              Save
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setOpenCreateModal(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}>
          <Typography variant="h6" mb={2}>
            Edit Review
          </Typography>
          <TextField fullWidth variant="outlined" label="Review Text" value={currentReview.reviewText} onChange={(e) => handleFieldChange("reviewText", e.target.value)} margin="normal" />
          <TextField fullWidth variant="outlined" label="Rating" type="number" value={currentReview.rating} onChange={(e) => handleFieldChange("rating", parseInt(e.target.value))} margin="normal" />
          
          <FormControl fullWidth variant="outlined" margin="normal">
            <Select value={currentReview.branchId} onChange={(e) => handleFieldChange("branchId", e.target.value)}>
              {branches.map((branch) => (
                <MenuItem key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" margin="normal">
            <Select value={currentReview.userId} onChange={(e) => handleFieldChange("userId", e.target.value)}>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setOpenEditModal(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Reviews;
