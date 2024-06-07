// src/scenes/bookings/BookingForm.jsx

import React from 'react';
import { Box, Button, TextField, useTheme } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { createBooking } from '../../api/bookingApi';
import Header from '../../components/Header';

// Schema validation cho Formik
const bookingSchema = yup.object().shape({
  slotId: yup.string().required("Required"),
  userId: yup.string().required("Required"),
  paymentAmount: yup.number().required("Required").positive("Must be positive"),
});

// Giá trị khởi tạo cho Formik
const initialValues = {
  slotId: '',
  userId: '',
  paymentAmount: '',
};

const BookingForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Booking data to be submitted:', values);
      await createBooking(values);
      navigate('/Bookings'); // Chuyển hướng về trang Bookings sau khi tạo thành công
    } catch (error) {
      console.error('Error creating booking:', error);
      setSubmitting(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE BOOKING" subtitle="Create a new booking" />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={bookingSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": {
                  gridColumn: "span 4",
                },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Slot ID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.slotId}
                name="slotId"
                error={!!touched.slotId && !!errors.slotId}
                helperText={touched.slotId && errors.slotId}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="User ID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.userId}
                name="userId"
                error={!!touched.userId && !!errors.userId}
                helperText={touched.userId && errors.userId}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Payment Amount"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.paymentAmount}
                name="paymentAmount"
                error={!!touched.paymentAmount && !!errors.paymentAmount}
                helperText={touched.paymentAmount && errors.paymentAmount}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained" disabled={isSubmitting}>
                Create
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default BookingForm;
