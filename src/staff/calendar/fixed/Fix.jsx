import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createFixedBooking } from '../../../api/bookingApi';
import { Box, Typography, Button, TextField, FormControl, FormControlLabel, Checkbox, Grid, Paper, ThemeProvider, createTheme } from "@mui/material";
import CalendarView from '../CalendarView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#009B65',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    h4: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'Roboto, sans-serif',
    },
  },
});

const FixedBooking = () => {
  const [numberOfMonths, setNumberOfMonths] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [userId, setUserId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('');
  const [slotEndTime, setSlotEndTime] = useState('');

  const handleDayOfWeekChange = (event) => {
    const { value, checked } = event.target;
    setDaysOfWeek((prevDaysOfWeek) =>
      checked ? [...prevDaysOfWeek, value] : prevDaysOfWeek.filter((day) => day !== value)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const response = await createFixedBooking(
        numberOfMonths,
        daysOfWeek,
        formattedStartDate,
        userId,
        branchId,
        slotStartTime,
        slotEndTime
      );
      console.log('Booking successful:', response);
      // Optionally, clear the form fields here
    } catch (error) {
      console.error('Error booking slot:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <Box sx={{ flex: 2, marginRight: 4 }}>
          <CalendarView selectedBranch={branchId} setSelectedBranch={setBranchId} />
        </Box>
        <Box sx={{ flex: 1, maxWidth: '400px', height: '100%' }}>
          <form onSubmit={handleSubmit}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h4" mb={2} sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>Fixed Booking</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="Number of Months"
                      type="number"
                      value={numberOfMonths}
                      onChange={(e) => setNumberOfMonths(e.target.value)}
                      required
                      InputLabelProps={{ style: { color: 'black' } }}
                      InputProps={{ style: { color: 'black' } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: 'black' }}>Day of Week:</Typography>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          value={day}
                          onChange={handleDayOfWeekChange}
                          checked={daysOfWeek.includes(day)}
                          sx={{ color: 'primary.main' }}
                        />
                      }
                      label={day}
                      sx={{ color: 'black' }}
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: 'black' }}>Start Date:</Typography>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    required
                    popperPlacement="right-start"
                    minDate={new Date()}
                    customInput={<TextField sx={{ width: '100%' }} />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="User ID"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                      InputLabelProps={{ style: { color: 'black' } }}
                      InputProps={{ style: { color: 'black' } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="Branch ID"
                      type="text"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      required
                      InputLabelProps={{ style: { color: 'black' } }}
                      InputProps={{ style: { color: 'black' } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="Slot Start Time"
                      type="text"
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                      required
                      InputLabelProps={{ style: { color: 'black' } }}
                      InputProps={{ style: { color: 'black' } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="Slot End Time"
                      type="text"
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                      required
                      InputLabelProps={{ style: { color: 'black' } }}
                      InputProps={{ style: { color: 'black' } }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" type="submit" fullWidth>Create</Button>
                </Grid>
              </Grid>
            </Paper>
          </form>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default FixedBooking;
