import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography, Select, MenuItem, FormControl, IconButton } from "@mui/material";
import { fetchBranches } from '../../api/branchApi';
import { reserveSlots } from '../../api/bookingApi';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "./styles.css";
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { fetchPrice } from '../../api/priceApi';
import { fetchBranchById } from '../../api/branchApi';
dayjs.extend(isSameOrBefore);

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

const dayToNumber = {
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
  "Sunday": 7
};

//trả về mảng 2 cái ngày bắt đầu và kết thúc
const parseOpenDay  = (openDay) => { 
  if (!openDay || typeof openDay !== 'string') {
    console.error('Invalid openDay:', openDay);
    return [0, 0];
  }
  const days = openDay.split(' to ');
  if (days.length !== 2) {
    console.error('Invalid openDay format:', openDay);
    return [0, 0];
  }
  const [startDay, endDay] = days;
  return [dayToNumber[startDay], dayToNumber[endDay]];

};

const getDaysOfWeek = (startOfWeek, openDay) => {
  let days = [];
  const [startDay, endDay] = parseOpenDay(openDay);
  if (startDay === 0 || endDay === 0) {
    console.error('Invalid days parsed:', { startDay, endDay });
    return days;
  }
  console.log('startDay:', startDay);
  console.log('endDay:', endDay);
  for (var i = startDay; i <= endDay; i++) {
    
    days.push(dayjs(startOfWeek).add(i, 'day'));
  
  }
  console.log('mảng days:', days);
  return days;
};



const ReserveSlot = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showAfternoon, setShowAfternoon] = useState(false);
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf('week'));
  const [weekdayPrice, setWeekdayPrice] = useState(0);
  const [weekendPrice, setWeekendPrice] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [openTime, setOpentime] = useState([]);
  const [closeTime, setClosetime] = useState([]);
  const [openDay, setOpenDay] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const navigate = useNavigate();
  const currentDate = dayjs();

  
//fetch thêm branch theo id
useEffect(() => {
  const fetchBranchesById = async () => {
    try {
      const response = await fetchBranchById(selectedBranch);
      setOpentime(response.openTime);
      setClosetime(response.closeTime);
      setOpenDay(response.openDay);
    } catch (error) {
      console.error('Error fetching branches data:', error);
    }
  };
  if (selectedBranch) {
    fetchBranchesById();
  }
}, [selectedBranch]);

// Parse openDay and get days of the week
useEffect(() => {
  if (openDay) {
    const days = getDaysOfWeek(startOfWeek, openDay);
    setWeekDays(days);
    console.log('Computed weekDays:', days);
  }
}, [openDay, startOfWeek]);



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



  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedBranch) return;

      try {
        const prices = await fetchPrice(selectedBranch);
        setWeekdayPrice(prices.weekdayPrice);
        setWeekendPrice(prices.weekendPrice);
      } catch (error) {
        console.error('Error fetching prices', error);
      }
    };

    fetchPrices();
  }, [selectedBranch]);

  const handleSlotClick = (slot, day) => {
    const slotId = `${day.format('YYYY-MM-DD')}_${slot}`;
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else if (selectedSlots.length < 3) {
      setSelectedSlots([...selectedSlots, slotId]);
    } else {
      alert("You can select up to 3 slots only");
    }
  };

  const handleToggleMorning = () => {
    setShowAfternoon(false);
  };

  const handleToggleAfternoon = () => {
    setShowAfternoon(true);
  };

  const handlePreviousWeek = () => {
   
    const oneWeekBeforeCurrentWeek = dayjs().startOf('week').subtract(1, 'week');
  if (!dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week')) {
    setStartOfWeek(oneWeekBeforeCurrentWeek);
  }
  };

  const handleNextWeek = () => {
    setStartOfWeek(dayjs(startOfWeek).add(1, 'week'));
  };

  const handleContinue = async () => {
    if (!selectedBranch) {
      alert("Please select a branch first");
      return;
    }
  
    const bookingRequests = selectedSlots.map(slotId => {
      const [slotDate, timeSlot] = slotId.split('_');
      const [slotStartTime, slotEndTime] = timeSlot.split(' - ');
  
      return {
        courtId: 'C001', 
        branchId: selectedBranch,
        slotDate,
        timeSlot: {
          slotStartTime: `${slotStartTime}:00`, // Đảm bảo định dạng thời gian chính xác
          slotEndTime: `${slotEndTime}:00`     // Đảm bảo định dạng thời gian chính xác
        }
      };
    });
  
    console.log(bookingRequests); // Thêm dòng này để kiểm tra cấu trúc dữ liệu
  
    try {
      const userId = 'U001'; // Bạn có thể thay đổi 'U001' bằng userId thực tế nếu bạn có
      await reserveSlots(userId, bookingRequests);
      navigate("/staff/PaymentDetail", {
        state: {
          branchId: selectedBranch,
          slots: selectedSlots,
          price: "120k"
        }
      });
    } catch (error) {
      console.error('Error reserving slots', error);
      alert('Failed to reserve slots. Please try again.');
    }
  };
  

  const days = weekDays;
 

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
        <IconButton onClick={handlePreviousWeek} size="small" >
          <ArrowBackIosIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
          Từ ngày {dayjs(startOfWeek).add(1, 'day').format('D/M')} đến ngày {dayjs(startOfWeek).add(7, 'day').format('D/M')}
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

        {(showAfternoon ? afternoonTimeSlots : morningTimeSlots).map((slot, slotIndex) => {
          const slotId = `${day.format('YYYY-MM-DD')}_${slot}`;
          const isSelected = selectedSlots.includes(slotId);
          const price = day.day() >= 1 && day.day() <= 5 ? weekdayPrice : weekendPrice; // Monday to Thursday for weekdays, Saturday to Sunday for weekends

          return (
            <Grid item xs key={slotIndex}>
              <Button
                onClick={() => handleSlotClick(slot, day)}
                sx={{
                  backgroundColor: day.isBefore(currentDate, 'day') ? "#E0E0E0" : isSelected ? "#1976d2" : "#D9E9FF",
                  color: isSelected ? "#FFFFFF" : "#0D1B34",
                  p: 2,
                  borderRadius: 2,
                  width: "100%",
                  textTransform: "none",
                  border: isSelected ? '2px solid #0D61F2' : '1px solid #90CAF9',
                  textAlign: 'center',
                  marginBottom: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                m="10px"
                disabled={day.isBefore(currentDate, 'day')}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      color: isSelected ? "#FFFFFF" : "#0D1B34"
                    }}
                  >
                    {slot}
                  </Typography>
                  <Typography
                    sx={{
                      color: isSelected ? "#FFFFFF" : "#0D1B34"
                    }}
                  >
                    {price}k
                  </Typography>
                </Box>
              </Button>
            </Grid>
          );
        })}
      </Grid>
    ))}
    <Box display="flex" justifyContent="end" mt={1} marginRight={'12px'}  >
      <Button
        variant="contained"

        sx={{
          color: "#white",
          backgroundColor: "#1976d2",
          ':hover': {
            backgroundColor: '#1565c0',
          },
          ':active': {
            backgroundColor: '#1976d2',
          },
        }
        }
        onClick={handleContinue}
      >
        Continue
      </Button>
    </Box>
  </Box>
  );
};

export default ReserveSlot;
