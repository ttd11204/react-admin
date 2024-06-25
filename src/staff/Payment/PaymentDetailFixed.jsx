import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Stepper, Step, StepLabel, Typography, Divider, Grid, TextField } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { fetchUserDetailByEmail, fetchUserDetail } from '../../api/userApi';
import { generatePaymentToken, processPayment } from '../../api/paymentApi';
import LoadingPage from './LoadingPage';
import { createFixedBooking } from '../../api/bookingApi';

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

const steps = ['Payment Details', 'Payment Confirmation'];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const PaymentDetailFixed = () => {
  const location = useLocation();
  const { branchId, bookingRequests, totalPrice, userChecked, userInfo: locationUserInfo, userId, numberOfMonths, daysOfWeek, startDate, slotStartTime, slotEndTime } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userInfo, setUserInfo] = useState(locationUserInfo || null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userChecked && locationUserInfo) {
      setUserExists(true);
    }
  }, [userChecked, locationUserInfo]);

  const handleEmailCheck = async () => {
    if (!email) {
      setErrorMessage('Vui lòng nhập email.');
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
            userId: user.id,
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
          setErrorMessage('Không tìm thấy thông tin chi tiết người dùng.');
        }
      } else {
        setUserExists(false);
        setUserInfo(null);
        setErrorMessage('Người dùng không tồn tại. Vui lòng đăng ký.');
      }
    } catch (error) {
      console.error('Lỗi kiểm tra tồn tại người dùng:', error);
      setErrorMessage('Lỗi kiểm tra tồn tại người dùng. Vui lòng thử lại.');
    }
  };

  const handleNext = async () => {
    if (activeStep === 0 && !userExists) {
      setErrorMessage('Please enter a valid email and check user existence.');
      return;
    }
  
    if (activeStep === 0) {
      setIsLoading(true); // Show loading page
      try {
        const formattedStartDate = formatDate(startDate); // Format startDate to MM/DD/YYYY
        const bookingForm = bookingRequests.map((request) => ({
          courtId: null,
          branchId: branchId,
          slotDate: request.slotDate,
          timeSlot: {
            slotStartTime: request.timeSlot.slotStartTime,
            slotEndTime: request.timeSlot.slotEndTime,
          },
        }));
  
        console.log('Formatted Requests:', bookingForm);
  
        const response = await createFixedBooking(
          numberOfMonths,
          daysOfWeek,
          formattedStartDate,
          userId,
          branchId,
          slotStartTime,
          slotEndTime
        );
  
        const bookingId = response.bookingId;
        const tokenResponse = await generatePaymentToken(bookingId);
        const token = tokenResponse.token;
        const paymentResponse = await processPayment(token);
        const paymentUrl = paymentResponse;
  
        window.location.href = paymentUrl;
      } catch (error) {
        console.error('Error processing payment:', error);
        setErrorMessage('Error processing payment. Please try again.');
        setIsLoading(false); // Hide loading page if there's an error
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            {!userChecked && (
              <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom color="black">
                  Thông Tin Khách Hàng
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
                    Kiểm Tra
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
                      <strong>Tên Người Dùng:</strong> {userInfo.userName ? userInfo.userName : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Họ và Tên:</strong> {userInfo.fullName ? userInfo.fullName : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Điện Thoại:</strong> {userInfo.phoneNumber ? userInfo.phoneNumber : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Coin:</strong> {userInfo.balance ? userInfo.balance : 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
                    <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
                      <PaymentIcon sx={{ marginRight: '8px' }} /> Phương Thức Thanh Toán
                    </Typography>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ color: 'black' }}>Chọn Phương Thức Thanh Toán</FormLabel>
                      <RadioGroup aria-label="payment method" name="paymentMethod">
                        <FormControlLabel value="cash" control={<Radio />} label="Tiền Mặt" sx={{ color: 'black' }} />
                        <FormControlLabel value="creditCard" control={<Radio />} label="Thẻ Tín Dụng" sx={{ color: 'black' }} />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom color="black">
                      Hóa Đơn
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Branch ID:</strong> {branchId}
                    </Typography>
                    <Typography variant="h6" color="black" sx={{ marginTop: '20px' }}>
                      <strong>Số Tháng:</strong> {numberOfMonths}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Ngày Trong Tuần:</strong> {daysOfWeek.join(', ')}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Ngày Bắt Đầu:</strong> {startDate}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Giờ Bắt Đầu:</strong> {slotStartTime}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Giờ Kết Thúc:</strong> {slotEndTime}
                    </Typography>
                    <Divider sx={{ marginY: '10px' }} />
                    <Typography variant="h6" color="black">
                      <strong>Tổng Giá:</strong> {totalPrice} USD
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        );
      case 1:
        return <LoadingPage />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box m="20px" p="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="black">
          Chi Tiết Thanh Toán
        </Typography>
        <Stepper activeStep={activeStep} sx={{ marginBottom: '20px' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {isLoading ? <LoadingPage /> : getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ marginRight: '20px' }}
          >
            Quay Lại
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {activeStep === steps.length - 1 ? 'Hoàn Tất' : 'Tiếp Theo'}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PaymentDetailFixed;
