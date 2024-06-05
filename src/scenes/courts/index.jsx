import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { fetchCourts } from "../../api/courtApi";
import Header from "../../components/Header";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Courts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [courtsData, setCourtsData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();

  const pageQuery = parseInt(query.get("pageNumber")) || 1;
  const sizeQuery = parseInt(query.get("pageSize")) || 10;
  const branchIdQuery = query.get("branchId");

  const [page, setPage] = useState(pageQuery - 1); // Convert page index to 0-based for ReactPaginate
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!branchIdQuery) {
      setError("Branch ID is required to view courts.");
      return;
    }

    const getCourtsData = async () => {
      try {
        const data = await fetchCourts(page + 1, pageSize); // Convert page index to 1-based
        const filteredData = data.items.filter(
          (court) => court.branchId === branchIdQuery
        );
        const numberedData = filteredData.map((item, index) => ({
          ...item,
          rowNumber: index + 1 + page * pageSize,
        }));
        setCourtsData(numberedData);
        setRowCount(filteredData.length);
      } catch (err) {
        setError(`Failed to fetch courts data: ${err.message}`);
      }
    };
    getCourtsData();
  }, [page, pageSize, branchIdQuery]);

  const handlePageClick = (event) => {
    console.log("Page change:", event.selected); // Log new page index
    const newPage = event.selected;
    setPage(newPage);
    navigate(
      `/Courts?pageNumber=${
        newPage + 1
      }&pageSize=${pageSize}&branchId=${branchIdQuery}`
    ); // Update URL
  };

  const handlePageSizeChange = (event) => {
    console.log("Page size change:", event.target.value); // Log new page size
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(
      `/Courts?pageNumber=1&pageSize=${newSize}&branchId=${branchIdQuery}`
    ); // Update URL
  };

  const handleView = (courtId) => {
    navigate(`/TimeSlots?courtId=${courtId}`);
  };

  const handleEdit = (id) => {
    console.log(`Edit court with id: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete court with id: ${id}`);
  };

  return (
    <Box m="20px">
      <Header
        title="COURTS"
        subtitle={`List of Courts for Branch ${branchIdQuery}`}
      />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Court ID</TableCell>
                  <TableCell>Court Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courtsData.length > 0 ? (
                  courtsData.map((row) => (
                    <TableRow key={row.courtId}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.branchId}</TableCell>
                      <TableCell>{row.courtId}</TableCell>
                      <TableCell>{row.courtName}</TableCell>
                      <TableCell>{row.branch?.address || "N/A"}</TableCell>
                      <TableCell>
                        {row.status ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => handleView(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => handleEdit(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
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
                    <TableCell colSpan={7} align="center">
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

export default Courts;
