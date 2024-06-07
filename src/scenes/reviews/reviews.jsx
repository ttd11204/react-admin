// src/scenes/reviews/Reviews.jsx

import React, { useEffect, useState } from "react";
import { Box, Button, InputBase, IconButton, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, FormControl } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { fetchReviews, fetchUsers, fetchBranches, updateReview, deleteReview, searchReviewsByRating } from "../../api/reviewApi";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Reviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reviewsData, setReviewsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [updatedReview, setUpdatedReview] = useState({});
  const [searchRating, setSearchRating] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const reviewsData = await fetchReviews();
        const usersData = await fetchUsers();
        const branchesData = await fetchBranches();
        setReviewsData(reviewsData.items);
        setUsers(usersData);
        setBranches(branchesData);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      }
    };
    getData();
  }, []);

  const handleEditToggle = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    setUpdatedReview({});
  };

  const handleFieldChange = (id, field, value) => {
    setUpdatedReview((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    try {
      const review = updatedReview[id];
      const originalReview = reviewsData.find(r => r.reviewId === id);

      // Đảm bảo tất cả các trường cần thiết đều có mặt
      const payload = {
        reviewText: review?.reviewText || originalReview?.reviewText,
        rating: review?.rating || originalReview?.rating,
        userId: review?.userId || originalReview?.id,
        branchId: review?.branchId || originalReview?.branchId,
      };

      console.log('Review before sending:', JSON.stringify(payload, null, 2));
      await updateReview(id, payload);
      setEditMode((prev) => ({ ...prev, [id]: false }));
      setReviewsData((prev) =>
        prev.map((item) =>
          item.reviewId === id
            ? { ...item, ...payload, branchName: branches.find(b => b.branchId === payload.branchId)?.branchName, email: users.find(u => u.id === payload.userId)?.email }
            : item
        )
      );
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
        const reviewsData = await fetchReviews();
        setReviewsData(reviewsData.items);
      }
    } catch (err) {
      setError(`Failed to search reviews: ${err.message}`);
    }
  };

  const handleCreateNew = () => {
    navigate("/ReviewForm");
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
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Rating"
                value={searchRating}
                onChange={(e) => setSearchRating(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
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
                      <TableCell>
                        {editMode[row.reviewId] ? (
                          <TextField
                            fullWidth
                            variant="filled"
                            value={updatedReview[row.reviewId]?.reviewText || row.reviewText}
                            onChange={(e) => handleFieldChange(row.reviewId, "reviewText", e.target.value)}
                          />
                        ) : (
                          row.reviewText
                        )}
                      </TableCell>
                      <TableCell>{new Date(row.reviewDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {editMode[row.reviewId] ? (
                          <TextField
                            fullWidth
                            variant="filled"
                            type="number"
                            value={updatedReview[row.reviewId]?.rating || row.rating}
                            onChange={(e) => handleFieldChange(row.reviewId, "rating", e.target.value)}
                          />
                        ) : (
                          row.rating
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode[row.reviewId] ? (
                          <FormControl fullWidth variant="filled">
                            <Select
                              value={updatedReview[row.reviewId]?.branchId || row.branchId}
                              onChange={(e) => handleFieldChange(row.reviewId, "branchId", e.target.value)}
                            >
                              {branches.map((branch) => (
                                <MenuItem key={branch.branchId} value={branch.branchId}>
                                  {branch.branchName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          row.branchName
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode[row.reviewId] ? (
                          <FormControl fullWidth variant="filled">
                            <Select
                              value={updatedReview[row.reviewId]?.userId || row.id}
                              onChange={(e) => handleFieldChange(row.reviewId, "userId", e.target.value)}
                            >
                              {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                  {user.email}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          row.email
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editMode[row.reviewId] ? (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleSave(row.reviewId)}
                              style={{ marginRight: 8 }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="secondary"
                              onClick={() => handleEditToggle(row.reviewId)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleEditToggle(row.reviewId)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              onClick={() => handleDelete(row.reviewId)}
                              style={{ marginLeft: 8 }}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default Reviews;
  