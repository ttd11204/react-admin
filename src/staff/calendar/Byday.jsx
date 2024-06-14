import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography, Select, MenuItem, FormControl, InputLabel, IconButton } from "@mui/material";
import { fetchBranches } from '../../api/branchApi';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "./styles.css"; // Import the CSS file
import dayjs from 'dayjs'; // Import dayjs for date manipulation

const morningTimeSlots = [
  "6:00 - 7:00",
  "7:00 - 8:00",
  "8:00 - 9:00",
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
];

const afternoonTimeSlots = [
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
];

const getDaysOfWeek = (startOfWeek) => {
  let days = [];
  for (let i = 0; i < 7; i++) {
    days.push(dayjs(startOfWeek).add(i, 'day'));
  }
  return days.sort((a, b) => a.day() - b.day() || 7);
};

const ReserveSlot = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showAfternoon, setShowAfternoon] = useState(false);
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf('week').add(1, 'day'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await fetchBranches(1, 10);
        setBranches(response.items);
        setSelectedBranch(''); 
      } catch (error) {
        console.error('Error fetching branches data:', error);
      }
    };

    fetchBranchesData();
  }, []);

  const handleButtonClick = (slot) => {
    if (!selectedBranch) {
      alert("Please select a branch first");
      return;
    }
    navigate("/staff/PaymentDetail", {
      state: {
        branchId: selectedBranch,
        timeSlot: slot,
        price: "120k"
      }
    });
  };

  const handleToggleMorning = () => {
    setShowAfternoon(false);
  };

  const handleToggleAfternoon = () => {
    setShowAfternoon(true);
  };

  const handlePreviousWeek = () => {
    setStartOfWeek(dayjs(startOfWeek).subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setStartOfWeek(dayjs(startOfWeek).add(1, 'week'));
  };

  const days = getDaysOfWeek(startOfWeek);

  return (
    <Box m="20px" className="max-width-box" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
        <FormControl sx={{ minWidth: 200, backgroundColor: "#0D1B34", borderRadius: 1 }}>
          <Select
            labelId="branch-select-label"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            displayEmpty
            sx={{ color: "#FFFFFF" }}
          >
            <MenuItem value="">
              <em>--Select Branch--</em>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.branchId} value={branch.branchId}>
                {branch.branchId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" alignItems="center" sx={{ backgroundColor: "#E0E0E0", p: 1, borderRadius: 2 }}>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ArrowBackIosIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
            Từ ngày {dayjs(startOfWeek).format('D/M')} đến ngày {dayjs(startOfWeek).add(6, 'day').format('D/M')}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box>
          <Button
            variant="contained"
            sx={{
              backgroundColor: showAfternoon ? "#FFFFFF" : "#0D1B34",
              color: showAfternoon ? "#0D1B34" : "white",
              mr: 1,
              textTransform: "none",
              marginBottom: '0'
            }}
            onClick={handleToggleMorning}
          >
            Morning
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: showAfternoon ? "#0D1B34" : "#FFFFFF",
              color: showAfternoon ? "white" : "#0D1B34",
              textTransform: "none",
              marginBottom: '0'
            }}
            onClick={handleToggleAfternoon}
          >
            Afternoon
          </Button>
        </Box>
      </Box>

      {days.map((day, dayIndex) => (
        <Grid container spacing={2} key={dayIndex} alignItems="center">
          <Grid item xs={1}>
            <Box
              sx={{
                backgroundColor: "#0D61F2",
                color: "white",
                width: "100%",
                textAlign: "center",
                padding: "8px",
                borderRadius: "4px",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <Typography variant="body2" component="div">
                {day.format('ddd')}
              </Typography>
              <Typography variant="body2" component="div">
                {day.format('D/M')}
              </Typography>
            </Box>
          </Grid>

          {(showAfternoon ? afternoonTimeSlots : morningTimeSlots).map((slot, slotIndex) => (
            <Grid item xs key={slotIndex}>
              <Button
                onClick={() => handleButtonClick(slot)}
                sx={{
                  backgroundColor: "#D9E9FF",
                  color: "#0D1B34",
                  p: 2,
                  borderRadius: 2,
                  width: "100%",
                  textTransform: "none",
                  border: '1px solid #90CAF9',
                  textAlign: 'center',
                  marginBottom: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                m="10px"
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      color: "#0D1B34"
                    }}
                  >
                    {slot}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#0D1B34"
                    }}
                  >
                    120k
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
};

export default ReserveSlot;
