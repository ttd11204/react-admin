import React from "react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import "./styles.css"; // Import the CSS file

const days = [
  { day: "Tue", date: "4/6" },
  { day: "Wed", date: "5/6" },
  { day: "Thu", date: "6/6" },
  { day: "Fri", date: "7/6" },
  { day: "Sat", date: "8/6" },
  { day: "Sun", date: "9/6" },
  { day: "Mon", date: "10/6" },
];

const timeSlots = [
  "8:00 - 9:00",
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "8:00 - 9:00",
  "8:00 - 9:00",
];

const Byday = () => {
  const theme = useTheme();

  return (
    <Box m="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" sx={{ backgroundColor: "#0D1B34", color: "white", textTransform: "none" }}>
          Schedule By Day
        </Button>
        <Typography variant="h6" sx={{ backgroundColor: "#B0B0B0", p: 1, borderRadius: 1, color: "#0D1B34" }}>
          From 4/6 to 10/6
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
        <Grid container spacing={1} key={dayIndex} alignItems="center">
          <Grid item xs={1}>
            <Button variant="contained" sx={{ backgroundColor: "#0D61F2", color: "white", width: "100%", textTransform: "none" }}>
              {day.day} <br /> {day.date}
            </Button>
          </Grid>
          {timeSlots.map((slot, slotIndex) => (
            <Grid item xs key={slotIndex} className="custom-grid-item">
              <Box sx={{ backgroundColor: "#D9E9FF", p: 2, borderRadius: 2 }} m="10px" >
                <Typography align="center" color="#0D1B34">{slot}</Typography>
                <Typography align="center" color="#0D1B34">120k</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
};

export default Byday;
