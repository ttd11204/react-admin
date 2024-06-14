import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PaymentConfirmationStep = () => {
  return (
    <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
        <CheckCircleIcon sx={{ marginRight: '8px' }} /> Payment Confirmation
      </Typography>
      <Typography variant="h6" color="black">
        Thank you for your payment. Your transaction has been successfully completed.
      </Typography>
      {/* Add more confirmation details here */}
    </Box>
  );
};

export default PaymentConfirmationStep;
