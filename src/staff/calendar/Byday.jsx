import React from "react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import "./styles.css"; // Import the CSS file

const days = [
  { day: "Mon", date: "3/6" },
  { day: "Tue", date: "4/6" },
  { day: "Wed", date: "5/6" },
  { day: "Thu", date: "6/6" },
  { day: "Fri", date: "7/6" },
  { day: "Sat", date: "8/6" },
  { day: "Sun", date: "9/6" },
];

const timeSlots = [
  "6:00 - 7:00",
  "7:00 - 8:00",
  "8:00 - 9:00",
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "12:00 - 13:00",
  "12:00 - 13:00",
  "12:00 - 13:00",
];

const Byday = () => {
  const theme = useTheme();

  const handleButtonClick = (slot) => {
    // Temporary link to '#'
    window.location.href = `#`;
  };

  return (
    <Box m="20px" className="max-width-box" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" sx={{ backgroundColor: "#0D1B34", color: "white", textTransform: "none" }}>
          Schedule By Day
        </Button>
        <Typography variant="h6" sx={{ backgroundColor: "#B0B0B0", p: 1, borderRadius: 1, color: "#0D1B34" }}>
          From 3/6 to 9/6
        </Typography>
        <Box>
          <Button variant="contained" sx={{ backgroundColor: "#0D1B34", color: "white", mr: 1, textTransform: "none" }}>
            Morning
          </Button>
          <Button variant="contained" sx={{ backgroundColor: "#FFFFFF", color: "#0D1B34", textTransform: "none" }}>
            Afternoon
          </Button>
        </Box>
      </Box>
     
      {days.map((day, dayIndex) => (
        <Grid container spacing={2} key={dayIndex} alignItems="center">  {/* Increased spacing to 2 */}
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
                {day.day}
              </Typography>
              <Typography variant="body2" component="div">
                {day.date}
              </Typography>
            </Box>
          </Grid>
          
          {/* <div className="wrapper"> */}
          {timeSlots.map((slot, slotIndex) => (
            <Grid  item xs key={slotIndex} className="">
              
              <Button
                className=" item"
                onClick={() => handleButtonClick(slot)}
                sx={{
                  backgroundColor: "#D9E9FF",
                  color: "#0D1B34",
                  p: 2,
                  borderRadius: 2,
                  width: "100%",
                  textTransform: "none",
                  border: '1px solid #90CAF9',  // Add border
                  textAlign: 'center',  // Center text
                  marginBottom: '16px',  // Add margin bottom to increase space between rows
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                m="10px"
              >
                <Box>
                  <Typography
                    className="time-slot-text"
                    sx={{
                      fontWeight: 'bold',
                      color: "#0D1B34"
                    }}
                  >
                    {slot}
                  </Typography>
                  <Typography
                    className="time-slot-text"
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
          {/* </div> */}
        </Grid>
      ))}
    </Box>
  );
};

export default Byday;
