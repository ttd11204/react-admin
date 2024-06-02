import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchCourts } from '../../api/courtApi';
import Header from '../../components/Header';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Courts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [courtsData, setCourtsData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();
  
  const pageQuery = parseInt(query.get('pageNumber')) || 1;
  const sizeQuery = parseInt(query.get('pageSize')) || 10;

  const [page, setPage] = useState(pageQuery - 1); // Convert page index to 0-based for ReactPaginate
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCourtsData = async () => {
      try {
        const data = await fetchCourts(page + 1, pageSize); // Convert page index to 1-based
        console.log('Fetched courts data:', data); // Log fetched data

        if (data.items && Array.isArray(data.items)) {
          const numberedData = data.items.map((item, index) => ({
            ...item,
            rowNumber: index + 1 + page * pageSize
          }));
          setCourtsData(numberedData);
          setRowCount(data.totalCount);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        setError(`Failed to fetch courts data: ${err.message}`);
      }
    };
    getCourtsData();
  }, [page, pageSize]);

  const handlePageClick = (event) => {
    console.log('Page change:', event.selected); // Log new page index
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Courts?pageNumber=${newPage + 1}&pageSize=${pageSize}`); // Update URL
  };

  const handlePageSizeChange = (event) => {
    console.log('Page size change:', event.target.value); // Log new page size
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(`/Courts?pageNumber=1&pageSize=${newSize}`); // Update URL
  };

  const handleEdit = (id) => {
    console.log(`Edit court with id: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete court with id: ${id}`);
  };

  return (
    <Box m="20px">
      <Header title="COURTS" subtitle="List of Courts" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Court Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courtsData.length > 0 ? (
                  courtsData.map((row) => (
                    <TableRow key={row.courtId}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.branchId}</TableCell>
                      <TableCell>{row.courtName}</TableCell>
                      <TableCell>{row.branch?.address || 'N/A'}</TableCell>
                      <TableCell>{row.status ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => handleEdit(row.courtId)} 
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
                        <Button 
                          onClick={() => handleDelete(row.courtId)} 
                          variant="contained" 
                          size="small" 
                          style={{ 
                            marginLeft: 8,
                            backgroundColor: colors.redAccent[400],
                            color: colors.primary[900]
                          }}
                        >
                          Delete
                        </Button>
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

export default Courts;
