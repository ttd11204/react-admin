import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, IconButton, InputBase } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { fetchPayments, deletePayment, fetchPaymentById } from '../../api/paymentApi'; // Updated import
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const navigate = useNavigate();
  
  const pageQuery = parseInt(query.get('pageNumber')) || 1;
  const sizeQuery = parseInt(query.get('pageSize')) || 10;

  const [page, setPage] = useState(pageQuery - 1); // Convert page index to 0-based for ReactPaginate
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const getPaymentsData = async () => {
      try {
        const data = await fetchPayments(page + 1, pageSize); // Convert page index to 1-based
        console.log('Fetched payments data:', data); // Log fetched data

        if (data.items && Array.isArray(data.items)) {
          setPaymentsData(data.items);
          setRowCount(data.totalCount);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        setError(`Failed to fetch payments data: ${err.message}`);
      }
    };
    getPaymentsData();
  }, [page, pageSize]);

  const handlePageClick = (event) => {
    console.log('Page change:', event.selected); // Log new page index
    const newPage = event.selected;
    setPage(newPage);
    if (userRole === 'Admin') {
      navigate(`/admin/Payments?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
    } else if (userRole === 'Staff') {
      navigate(`/Payments?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
    }
  };

  const handlePageSizeChange = (event) => {
    console.log('Page size change:', event.target.value); // Log new page size
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    if (userRole === 'Admin') {
      navigate(`/admin/Payments?pageNumber=1&pageSize=${newSize}`);
    } else if (userRole === 'Staff') {
      navigate(`/Payments?pageNumber=1&pageSize=${newSize}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePayment(id); // Call deletePayment function
      setPaymentsData(paymentsData.filter(payment => payment.paymentId !== id)); // Update state to remove deleted payment
    } catch (err) {
      setError(`Failed to delete payment: ${err.message}`);
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = async () => {
    if (searchValue.trim() === '') {
      setSearchResult(null);
      const getPaymentsData = async () => {
        try {
          const data = await fetchPayments(page + 1, pageSize); // Convert page index to 1-based
          console.log('Fetched payments data:', data); // Log fetched data

          if (data.items && Array.isArray(data.items)) {
            setPaymentsData(data.items);
            setRowCount(data.totalCount);
          } else {
            throw new Error('Invalid data structure');
          }
        } catch (err) {
          setError(`Failed to fetch payments data: ${err.message}`);
        }
      };
      getPaymentsData();
    } else {
      try {
        const result = await fetchPaymentById(searchValue);
        setSearchResult(result);
      } catch (err) {
        setError(`Failed to fetch payment by ID: ${err.message}`);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box m="20px">
      <Header title="PAYMENTS" subtitle="List of Payments" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Payment ID"
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress} // Add onKeyPress event
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Payment Amount</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Payment Message</TableCell>
                  <TableCell>Payment Signature</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResult ? (
                  <TableRow key={searchResult.paymentId}>
                    <TableCell>{searchResult.paymentId}</TableCell>
                    <TableCell>{searchResult.bookingId}</TableCell>
                    <TableCell>{searchResult.paymentAmount}</TableCell>
                    <TableCell>{new Date(searchResult.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{searchResult.paymentMessage}</TableCell>
                    <TableCell>{searchResult.paymentSignature}</TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <IconButton
                          onClick={() => handleDelete(searchResult.paymentId)}
                          color="secondary"
                          size="small"
                          style={{
                            marginLeft: 8,
                            backgroundColor: colors.redAccent[400],
                            color: colors.primary[900],
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : paymentsData.length > 0 ? (
                  paymentsData.map((row) => (
                    <TableRow key={row.paymentId}>
                      <TableCell>{row.paymentId}</TableCell>
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>{row.paymentAmount}</TableCell>
                      <TableCell>{new Date(row.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{row.paymentMessage}</TableCell>
                      <TableCell>{row.paymentSignature}</TableCell>
                      <TableCell>
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <IconButton
                            onClick={() => handleDelete(row.paymentId)}
                            color="secondary"
                            size="small"
                            style={{
                              marginLeft: 8,
                              backgroundColor: colors.redAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
            <Select value={pageSize} onChange={handlePageSizeChange}>
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

export default Payments;
