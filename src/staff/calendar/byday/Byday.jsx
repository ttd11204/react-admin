import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography, Select, MenuItem, FormControl, IconButton } from "@mui/material";
import { fetchBranches } from '../../../api/branchApi';
import { reserveSlots } from '../../../api/bookingApi';

import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { fetchPrice } from '../../../api/priceApi';
import { fetchBranchById } from '../../../api/branchApi';
import {fetchUnavailableSlots} from '../../../api/timeSlotApi'
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import Delete from '@mui/icons-material/Delete';
import * as signalR from '@microsoft/signalr';
dayjs.extend(isSameOrBefore);

const dayToNumber = {
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
  "Sunday": 7
};

const parseOpenDay = (openDay) => {
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

  for (var i = startDay; i <= endDay; i++) {
    days.push(dayjs(startOfWeek).add(i, 'day'));
  }

  return days;
};

const generateTimeSlots = (openTime, closeTime) => {
  let slots = [];
  for (let hour = openTime; hour < closeTime; hour++) {
    const start = formatTime(hour);
    const end = formatTime(hour + 1);
    slots.push(`${start} - ${end}`);
  }
  return slots;
};

const formatTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes}`;
};

const timeStringToDecimal = (timeString) => {
  const date = new Date(`1970-01-01T${timeString}Z`);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  return hours + minutes / 60 + seconds / 3600;
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
  const [morningTimeSlots, setMorningTimeSlots] = useState([]);
  const [afternoonTimeSlots, setAfternoonTimeSlots] = useState([]);
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSlotBooked, setIsSlotBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  //thêm unavailable slot
  const [unavailableSlots, setUnavailableSlot] = useState([]);
  const [unavailableSlotsCache, setUnavailableSlotsCache] = useState({});

  const navigate = useNavigate();
  const currentDate = dayjs();



  const handleSlotClick = (slot, day, price) => {
    const slotId = `${day.format('YYYY-MM-DD')}_${slot}_${price}`;
    const sameTimeSlots = selectedSlots.filter(selectedSlot => selectedSlot.slotId.startsWith(`${day.format('YYYY-MM-DD')}_${slot}`));

    if (sameTimeSlots.length >= 2) {
      const firstSlotId = sameTimeSlots[0].slotId;
      setSelectedSlots(selectedSlots.filter(selectedSlot => selectedSlot.slotId !== firstSlotId));
    } else {
      if (selectedSlots.length < 3) {
        setSelectedSlots([...selectedSlots, { slotId, slot, day, price }]);
      } else {
        alert("You can select up to 3 slots only");
      }
    }
  };

  const handleRemoveSlot = (slotId) => {
    setSelectedSlots(selectedSlots.filter(selectedSlot => selectedSlot.slotId !== slotId));
  };

  const handleToggleMorning = () => {
    setShowAfternoon(false);
  };

  const handleToggleAfternoon = () => {
    setShowAfternoon(true);
  };

  // chỉnh lại hàm handlepreviousweek
  const handlePreviousWeek = async () => {
    setLoading(true);
    const oneWeekBeforeCurrentWeek = dayjs().startOf('week').subtract(1, 'week');
    const oneWeekBeforeStartOfWeek = dayjs(startOfWeek).subtract(1, 'week');
  
    if (!dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week') && oneWeekBeforeStartOfWeek.isAfter(oneWeekBeforeCurrentWeek)) {
      setStartOfWeek(oneWeekBeforeStartOfWeek);
    } else if (dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week')) {
      setStartOfWeek(oneWeekBeforeCurrentWeek);
    }
  
    const newWeekStart = oneWeekBeforeStartOfWeek.format('YYYY-MM-DD');
  
    if (unavailableSlotsCache[newWeekStart]) {
      setUnavailableSlot(unavailableSlotsCache[newWeekStart]);
    } else {
      const unavailableSlot = await fetchUnavailableSlots(newWeekStart, selectedBranch);
      const slots = Array.isArray(unavailableSlot) ? unavailableSlot : [];
      setUnavailableSlot(slots);
      setUnavailableSlotsCache(prevCache => ({ ...prevCache, [newWeekStart]: slots }));
    }
 
    setLoading(false);
  };
  const handleNextWeek = async () => {
    setLoading(true);
    const newWeekStart = dayjs(startOfWeek).add(1, 'week').format('YYYY-MM-DD');
    setStartOfWeek(dayjs(startOfWeek).add(1, 'week'));
  
    if (unavailableSlotsCache[newWeekStart]) {
      setUnavailableSlot(unavailableSlotsCache[newWeekStart]);
    } else {
      const unavailableSlot = await fetchUnavailableSlots(newWeekStart, selectedBranch);
      const slots = Array.isArray(unavailableSlot) ? unavailableSlot : [];
      setUnavailableSlot(slots);
      setUnavailableSlotsCache(prevCache => ({ ...prevCache, [newWeekStart]: slots }));
    }
    setLoading(false);
  };
  //kiểm tra nó có phải là unableslot không
  const isSlotUnavailable = (day, slot) => {
    //đổi format cho giống cái slot trả ra lúc generate các slot
    const formattedDay = day.format('YYYY-MM-DD'); 
    const slotStartTime = slot.split(' - ')[0]; 
    return unavailableSlots.some(unavailableSlot => {
      return (
         unavailableSlot.slotDate === formattedDay &&
            unavailableSlot.slotStartTime === `${slotStartTime}:00`
      );
    });
  };

  const handleContinue = async () => {
    if (!selectedBranch) {
      alert("Please select a branch first");
      return;
    }

    const bookingRequests = selectedSlots.map((slot) => {
      const { day, slot: timeSlot, price } = slot;
      const [slotStartTime, slotEndTime] = timeSlot.split(' - ');

      return {
        slotDate: day.format('YYYY-MM-DD'),
        timeSlot: {
          slotStartTime: `${slotStartTime}:00`,
          slotEndTime: `${slotEndTime}:00`,
        },
        price: parseFloat(price),
      };
    });

    navigate("/PaymentDetail", {
      state: {
        branchId: selectedBranch,
        bookingRequests,
        totalPrice: bookingRequests.reduce((totalprice, object) => totalprice + parseFloat(object.price), 0),
      },
    });
  };

  useEffect(() => {
    const fetchInitialUnavailableSlots = async () => {
      setLoading(true);
      const currentWeekStart = dayjs(startOfWeek).format('YYYY-MM-DD');
  
      if (unavailableSlotsCache[currentWeekStart]) {
        setUnavailableSlot(unavailableSlotsCache[currentWeekStart]);
      } else {
        const unavailableSlot = await fetchUnavailableSlots(currentWeekStart, selectedBranch);
        const slots = Array.isArray(unavailableSlot) ? unavailableSlot : [];
        setUnavailableSlot(slots);
        setUnavailableSlotsCache(prevCache => ({ ...prevCache, [currentWeekStart]: slots }));
      }
      setLoading(false);
    };
  
    if (selectedBranch) {
      fetchInitialUnavailableSlots();
    }
  }, [selectedBranch, startOfWeek]);

  //phần để kết nối với signalR
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://courtcaller.azurewebsites.net/timeslothub")
      .withAutomaticReconnect()
      .build();

    newConnection.onreconnecting((error) => {
      console.log(`Connection lost due to error "${error}". Reconnecting.`);
      setIsConnected(false);
    });

    newConnection.onreconnected((connectionId) => {
      console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
      setIsConnected(true);
    });

    newConnection.onclose((error) => {
      console.log(`Connection closed due to error "${error}". Try refreshing this page to restart the connection.`);
      setIsConnected(false);
    });

    setConnection(newConnection);
  }, []);

  //phần để kết nối với signalR
  useEffect(() => {
    if (connection) {
      connection.start()
        .then(result => {
          console.log("Connected!");
          setIsConnected(true);
        })
        .catch(e => {
          console.log("Initial connection failed: ", e);
          setIsConnected(false);
        });
  
      connection.on("SlotBooked", (isBooked) => {
        setMessage(isBooked ? "Slot booked successfully!" : "No available slots!");
        if (isBooked) {
          setIsSlotBooked(true);
        }
      });
  
      connection.on("UpdateSlotStatus", (status) => {
        setIsSlotBooked(!status);
      });
  
      connection.onreconnecting((error) => {
        console.log(`Connection lost due to error "${error}". Reconnecting.`);
        setIsConnected(false);
      });
  
      connection.onreconnected((connectionId) => {
        console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
        setIsConnected(true);
      });
  
      connection.onclose(async (error) => {
        console.log(`Connection closed due to error "${error}". Reconnecting.`);
        setIsConnected(false);
        try {
          await connection.start();
          setIsConnected(true);
          console.log("Reconnected!");
        } catch (err) {
          console.log("Reconnection failed: ", err);
        }
      });
    }
  }, [connection]);
  


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

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await fetchBranches(1, 10);
        setBranches(response.items);
        setSelectedBranch('');
        console.log('Branches:', response.items);
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

  useEffect(() => {
    if (openDay) {
      const days = getDaysOfWeek(startOfWeek, openDay);
      setWeekDays(days);
      console.log('Computed weekDays:', days);
    }
  }, [openDay, startOfWeek]);

  useEffect(() => {
    if (openTime && '14:00:00') {
      const decimalOpenTime = timeStringToDecimal(openTime);
      const decimalCloseTime = timeStringToDecimal('14:00:00');
      console.log('decimalOpenTime:', decimalOpenTime);
      console.log('decimalCloseTime:', decimalCloseTime);
      const timeSlots = generateTimeSlots(decimalOpenTime, decimalCloseTime);
      setMorningTimeSlots(timeSlots);
      console.log('generate timeSlots:', timeSlots);
    }
  }, [openTime]);

  useEffect(() => {
    if (closeTime && '14:00:00') {
      const decimalOpenTime = timeStringToDecimal('14:00:00');
      const decimalCloseTime = timeStringToDecimal(closeTime);
      console.log('decimalOpenTime:', decimalOpenTime);
      console.log('decimalCloseTime:', decimalCloseTime);
      const timeSlots = generateTimeSlots(decimalOpenTime, decimalCloseTime);
      setAfternoonTimeSlots(timeSlots);
      console.log('generate timeSlots:', timeSlots);
    }
  }, [closeTime]);

  const getSlotColor = (day, slot, isSelected) => {
    const isPastSlot = day.isBefore(currentDate, 'day') || (day.isSame(currentDate, 'day') &&
      timeStringToDecimal(currentDate.format('HH:mm:ss')) > timeStringToDecimal(slot.split(' - ')[0]) + 0.25) || isSlotUnavailable(day, slot);

    
    if (isSelected) return "#1976d2";
    if (isPastSlot) return "#E0E0E0";
    return "#D9E9FF";
  };

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

        {selectedBranch && (
          <Box display="flex" alignItems="center" sx={{ backgroundColor: "#E0E0E0", p: 1, borderRadius: 2 }}>
            <IconButton onClick={handlePreviousWeek} size="small">
              <ArrowBackIos fontSize="inherit" />
            </IconButton>
            <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
              From {dayjs(startOfWeek).add(1, 'day').format('D/M')} To {dayjs(startOfWeek).add(7, 'day').format('D/M')}
            </Typography>
            <IconButton onClick={handleNextWeek} size="small">
              <ArrowForwardIos fontSize="inherit" />
            </IconButton>
          </Box>
        )}

        {selectedBranch && (
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
        )}
      </Box>

        
      {weekDays.map((day, dayIndex) => (
        <Grid container spacing={2} key={dayIndex} alignItems="center">
          <Grid item xs={1} padding="8px">
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
                height: '100%',
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
            const price = day.day() >= 1 && day.day() <= 5 ? weekdayPrice : weekendPrice;
            const slotId = `${day.format('YYYY-MM-DD')}_${slot}_${price}`;
            const isSelected = selectedSlots.some(selectedSlot => selectedSlot.slotId === slotId);

            return (
              <Grid item xs key={slotIndex}>
                <Button
                  onClick={() => handleSlotClick(slot, day, price)}
                  sx={{
                    backgroundColor: getSlotColor(day, slot, isSelected),
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
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  m="10px"
                  disabled={day.isBefore(currentDate, 'day') || (day.isSame(currentDate, 'day') &&
                    timeStringToDecimal(currentDate.format('HH:mm:ss')) > timeStringToDecimal(slot.split(' - ')[0]) + 0.25) || isSlotUnavailable(day, slot)}
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
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 5,
                          left: 5,
                          backgroundColor: '#FFFFFF',
                          color: '#1976d2',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        onClick={(e) => { e.stopPropagation(); handleRemoveSlot(slotId); }}
                      >
                        <Delete />
                      </Box>
                    )}
                    {isSelected && (
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          backgroundColor: '#FFFFFF',
                          color: '#1976d2',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedSlots.filter(selectedSlot => selectedSlot.slotId === slotId).length}
                      </Typography>
                    )}
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      ))}
      {selectedBranch && (
        <Box display="flex" justifyContent="end" mt={1} marginRight={'12px'}>
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
            }}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReserveSlot;