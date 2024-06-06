import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputBase,
  IconButton,
} from "@mui/material";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { fetchReviews } from "../../api/reviewApi";
import Header from "../../components/Header";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Reviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reviewsData, setReviewsData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();

  const pageQuery = parseInt(query.get("pageNumber")) || 1;
  const sizeQuery = parseInt(query.get("pageSize")) || 10;

  const [page, setPage] = useState(pageQuery - 1); // Convert page index to 0-based for ReactPaginate
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getReviewsData = async () => {
      try {
        const data = await fetchReviews(page + 1, pageSize); // Convert page index to 1-based
        console.log("Fetched reviews data:", data); // Log fetched data

        if (data.items && Array.isArray(data.items)) {
          const numberedData = data.items.map((item, index) => ({
            ...item,
            rowNumber: index + 1 + page * pageSize,
          }));
          setReviewsData(numberedData);
          setRowCount(data.totalCount);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (err) {
        setError(`Failed to fetch reviews data: ${err.message}`);
      }
    };
    getReviewsData();
  }, [page, pageSize]);

  const handlePageClick = (event) => {
    console.log("Page change:", event.selected); // Log new page index
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Reviews?pageNumber=${newPage + 1}&pageSize=${pageSize}`); // Update URL
  };

  const handlePageSizeChange = (event) => {
    console.log("Page size change:", event.target.value); // Log new page size
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(`/Reviews?pageNumber=1&pageSize=${newSize}`); // Update URL
  };

  const handleEdit = (id) => {
    console.log(`Edit review with id: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete review with id: ${id}`);
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
            <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search"
              />
              <IconButton type="button" sx={{ p: 1 }}>
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Review Text</TableCell>
                  <TableCell>Review Date</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewsData.length > 0 ? (
                  reviewsData.map((row) => (
                    <TableRow key={row.reviewId}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.reviewText}</TableCell>
                      <TableCell>
                        {new Date(row.reviewDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{row.rating}</TableCell>
                      <TableCell>
                        {row.user ? row.user.userName : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Button
                            onClick={() => handleEdit(row.reviewId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginLeft: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.reviewId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginLeft: 8,
                              backgroundColor: colors.redAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="20px"
          >
            <Select value={pageSize} onChange={handlePageSizeChange}>
              {[10, 15, 20, 25, 50].map((size) => (
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

export default Reviews;
