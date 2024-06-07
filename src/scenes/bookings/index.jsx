// src/scenes/bookings/Bookings.jsx

import React, { useEffect, useState } from "react";
import { Box, Button, InputBase, IconButton, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { fetchBookings, fetchUsers, fetchCourts, deleteBooking, searchBookingsByUserId } from "../../api/bookingApi";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Bookings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [bookingsData, setBookingsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState(null);
  const [searchUserId, setSearchUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const bookingsData = await fetchBookings();
        const usersData = await fetchUsers();
        const courtsData = await fetchCourts();
        setBookingsData(bookingsData.items);
        setUsers(usersData);
        setCourts(courtsData);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      }
    };
    getData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setBookingsData((prev) => prev.filter((item) => item.bookingId !== id));
    } catch (err) {
      setError(`Failed to delete booking: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    try {
      if (searchUserId) {
        const data = await searchBookingsByUserId(searchUserId);
        setBookingsData(data);
      } else {
        const bookingsData = await fetchBookings();
        setBookingsData(bookingsData.items);
      }
    } catch (err) {
      setError(`Failed to search bookings: ${err.message}`);
    }
  };

  const handleCreateNew = () => {
    navigate("/BookingForm");
  };

  return (
    <Box m="20px">
      <Header title="BOOKINGS" subtitle="List of Bookings" />
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
                placeholder="Search by User ID"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
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
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Booking Time</TableCell>
                  <TableCell>Check</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Court Name</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsData.length > 0 ? (
                  bookingsData.map((row) => (
                    <TableRow
                      key={row.bookingId}
                      style={
                        !row.check
                          ? {
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? colors.redAccent[700]
                                  : colors.redAccent[700],
                              color: theme.palette.mode === "dark" ? colors.redAccent[100] : '#FFFFFF',
                            }
                          : null
                      }
                    >
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>
                        {new Date(row.bookingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(row.bookingDate).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{row.check ? "Yes" : "No"}</TableCell>
                      <TableCell>{row.totalPrice}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.courtName}</TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => handleDelete(row.bookingId)}
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
                    <TableCell colSpan={8} align="center">
                      No data available
                    </TableCell>
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

export default Bookings;
