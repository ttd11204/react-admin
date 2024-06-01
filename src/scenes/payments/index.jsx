import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { fetchPayments } from '../../api/paymentApi';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const getPayments = async () => {
      try {
        const data = await fetchPayments();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    getPayments();
  }, []);

  const columns = [
    { field: "paymentId", headerName: "Payment ID", flex: 1 },
    { field: "bookingId", headerName: "Booking ID", flex: 1 },
    {
      field: "paymentDate",
      headerName: "Payment Date",
      flex: 1,
      renderCell: (params) => (
        <Typography>{new Date(params.row.paymentDate).toLocaleDateString()}</Typography>
      ),
    },
    { field: "paymentMessage", headerName: "Payment Message", flex: 1 },
    { field: "paymentStatus", headerName: "Payment Status", flex: 1 },
    { field: "paymentSignature", headerName: "Payment Signature", flex: 1 },
    { field: "booking", headerName: "Booking", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header title="PAYMENTS" subtitle="List of Payments" />
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
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={payments}
          columns={columns}
          getRowId={(row) => row.paymentId}
        />
      </Box>
    </Box>
  );
};

export default Payments;
