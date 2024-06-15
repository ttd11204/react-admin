import React, { useState } from 'react';
import { Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, TextField, Stepper, Step, StepLabel } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { fetchUserDetailByEmail } from '../../api/userApi';
import VNPayStep from './VNPayStep';
import PaymentConfirmationStep from './PaymentConfirmationStep';
import { fetchUserDetail } from '../../api/userApi';

const theme = createTheme({
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'black',
          '&.Mui-checked': {
            color: 'black',
          },
        },
      },
    },
  },
});

const steps = ['Payment Details', 'VNPay', 'Payment Confirmation'];

const PaymentDetail = () => {
  const location = useLocation();
  const { branchId, timeSlot, price } = location.state;
  const [activeStep, setActiveStep] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [userDetail, setUserDetail] = useState('');




  const handleEmailCheck = async () => {
    if (!email) {
      setErrorMessage('Please enter an email.');
      return;
    }

    try {
      const userData = await fetchUserDetailByEmail(email);
      if (userData && userData.length > 0) {
        const user = userData[0];
        const detailedUserInfo = await fetchUserDetail(user.id);
        if (detailedUserInfo) {
          setUserExists(true);
          setUserInfo({
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: detailedUserInfo.fullName,
            balance: detailedUserInfo.balance,
            address: detailedUserInfo.address,
          });
          setErrorMessage('');
        } else {
          setUserExists(false);
          setUserInfo(null);
          setErrorMessage('User details not found.');
        }
      } else {
        setUserExists(false);
        setUserInfo(null);
        setErrorMessage('User does not exist. Please register.');
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      setErrorMessage('Error checking user existence. Please try again.');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !userExists) {
      setErrorMessage('Please enter a valid email and check user existence.');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const totalPrice = price - discount;

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom color="black">
                Customer Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  sx={{ marginBottom: '10px', marginRight: '10px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleEmailCheck}>
                  Check
                </Button>
              </Box>
              {errorMessage && (
                <Typography variant="body2" color="error">
                  {errorMessage}
                </Typography>
              )}
              {userExists && userInfo && (
                <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, marginTop: '20px' }}>
                  <Typography variant="h6" color="black">
                    <strong>Username:</strong> {userInfo.userName ? userInfo.userName : 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="black">
                    <strong>Full Name:</strong> {userInfo.fullName ? userInfo.fullName : 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="black">
                    <strong>Phone:</strong> {userInfo.phoneNumber ? userInfo.phoneNumber : 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="black">
                    <strong>Coin:</strong> {userInfo.balance ? userInfo.balance : 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <Box sx={{ flex: 1, marginRight: '20px', backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
                  <PaymentIcon sx={{ marginRight: '8px' }} /> Payment Method
                </Typography>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ color: 'black' }}>Select Payment Method</FormLabel>
                  <RadioGroup aria-label="payment method" name="paymentMethod">
                    <FormControlLabel value="cash" control={<Radio />} label="Cash" sx={{ color: 'black' }} />
                    <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" sx={{ color: 'black' }} />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom color="black">
                  Bill
                </Typography>
                <Typography variant="h6" color="black">
                  <strong>Branch ID:</strong> {branchId}
                </Typography>
                <Typography variant="h6" color="black">
                  <strong>Time Slot:</strong> {timeSlot}
                </Typography>
                <Typography variant="h6" color="black">
                  <strong>Price:</strong> {price} USD
                </Typography>
                <Typography variant="h6" color="black">
                  <strong>Total Price:</strong> {totalPrice} USD
                </Typography>
              </Box>
            </Box>
          </>
        );
      case 1:
        return <VNPayStep />;
      case 2:
        return <PaymentConfirmationStep />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box m="20px" p="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="black">
          Payment Details
        </Typography>
        <Stepper activeStep={activeStep} sx={{ marginBottom: '20px' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ marginRight: '20px' }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PaymentDetail;
