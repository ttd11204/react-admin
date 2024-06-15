import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export const PaymentConfirmed = ({ userInfo = {}, branchId = 'N/A', courtId = 'N/A', timeSlot = 'N/A', paymentDate = 'N/A', totalPrice = 'N/A' }) => {
  return (
    <Box sx={{ padding: '40px', textAlign: 'center' }}>
      <Box sx={{ backgroundColor: "#F0F0F0", padding: '40px', borderRadius: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'green' }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'green', marginTop: '10px' }}>
          Payment confirmed
        </Typography>
        <Typography variant="body1" color="black" sx={{ marginBottom: '20px' }}>
          Thank you, your payment has been successful and your booking is now confirmed. A confirmation email has been sent to {userInfo.email || 'N/A'}.
        </Typography>
        <Paper elevation={3} sx={{ padding: '20px', marginTop: '20px', backgroundColor: '#fff', maxWidth: '600px', margin: '0 auto' }}>
          <Typography variant="h6" color="black" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Order summary
          </Typography>
          <Box sx={{ textAlign: 'left' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1" color="black">
                  <strong>Email:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                  {userInfo.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black">
                  <strong>Branch ID:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                  {branchId}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black">
                  <strong>Court ID:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                  {courtId}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black">
                  <strong>Time Slot:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                  {timeSlot}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black">
                  <strong>Payment Date:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                  {paymentDate}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black">
                  <strong>Total Price:</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                  {totalPrice} USD
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export const PaymentRejected = () => {
  return (
    <Box sx={{ padding: '40px', textAlign: 'center' }}>
      <Box sx={{ backgroundColor: "#F0F0F0", padding: '40px', borderRadius: 2 }}>
        <CancelIcon sx={{ fontSize: 80, color: 'red' }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'red', marginTop: '10px' }}>
          Payment rejected
        </Typography>
        <Typography variant="body1" color="black" sx={{ marginBottom: '20px' }}>
          Your payment was declined. Please try again or use a different payment method.
        </Typography>
      </Box>
    </Box>
  );
};
