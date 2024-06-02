import React, { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { fetchBookings } from "../../api/bookingApi";
import Header from "../../components/Header";

const Bookings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [bookingsData, setBookingsData] = useState([]);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        const data = await fetchBookings(pageNumber, pageSize);
        console.log('API response data:', data);
        setBookingsData(data.items || data);  // Điều chỉnh để phù hợp với cấu trúc dữ liệu
        setRowCount(data.totalCount || data.length || 0); // Điều chỉnh để phù hợp với cấu trúc dữ liệu
      } catch (err) {
        console.error('Error fetching bookings data:', err);
        setError('Failed to fetch bookings data');
      }
    };
    getBookingsData();
  }, [pageNumber, pageSize]);

  const handlePageChange = (params) => {
    setPageNumber(params.page + 1); // DataGrid page index is 0-based, API is 1-based
  };

  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
    setPageNumber(1); // Reset to first page
  };

  const handleEdit = (id) => {
    // Logic for edit action
    console.log(`Edit booking with id: ${id}`);
  };

  const handleDelete = (id) => {
    // Logic for delete action
    console.log(`Delete booking with id: ${id}`);
  };

  const columns = [
    { field: "bookingId", headerName: "Booking ID", flex: 1 },
    {
      field: "bookingDate",
      headerName: "Booking Date",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>
          {new Date(row.bookingDate).toLocaleDateString()}
        </Typography>
      ),
    },
    { field: "paymentAmount", headerName: "Payment Amount", flex: 1 },
    {
      field: "user",
      headerName: "User Name",
      flex: 1,
      valueGetter: (params) =>
        params.row.user ? params.row.user.userName : "N/A",
    },
    {
      field: "timeSlot",
      headerName: "Court Name",
      flex: 1,
      valueGetter: (params) =>
        params.row.timeSlot && params.row.timeSlot.court
          ? params.row.timeSlot.court.courtName
          : "N/A",
    },
    {
      field: "timeSlot",
      headerName: "Slot Start Time",
      flex: 1,
      valueGetter: (params) =>
        params.row.timeSlot ? params.row.timeSlot.slotStartTime : "N/A",
    },
    {
      field: "timeSlot",
      headerName: "Slot End Time",
      flex: 1,
      valueGetter: (params) =>
        params.row.timeSlot ? params.row.timeSlot.slotEndTime : "N/A",
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <Button
            onClick={() => handleEdit(row.bookingId)}
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
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="BOOKINGS" subtitle="List of Bookings" />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
          }}
        >
          <DataGrid
            rows={bookingsData}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            pageSize={pageSize}
            page={pageNumber - 1}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            getRowId={(row) => row.bookingId}
          />
        </Box>
      )}
    </Box>
  );
};

export default Bookings;
