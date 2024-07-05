import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputBase, IconButton, Button } from '@mui/material';
import { tokens } from '../../theme';
import { fetchTimeSlots } from '../../api/timeSlotApi';
import Header from '../../components/Header';
import SearchIcon from "@mui/icons-material/Search";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const TimeSlots = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const courtIdQuery = query.get('courtId');
  const [timeSlotsData, setTimeSlotsData] = useState([]);
  const [error, setError] = useState(null);
  const branchIdQuery = query.get("branchId");

  useEffect(() => {
    const getTimeSlotsData = async () => {
      try {
        const data = await fetchTimeSlots();
        const filteredData = data.filter(slot => slot.courtId === courtIdQuery);
        setTimeSlotsData(filteredData);
      } catch (err) {
        setError('Failed to fetch time slots data');
      }
    };
    getTimeSlotsData();
  }, [courtIdQuery]);
  console.log(courtIdQuery);
  console.log(branchIdQuery);

  return (
    <Box m="20px">
      <Header title="TIME SLOTS" subtitle={`List of Time Slots for Court ${courtIdQuery}`} />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search by Slot ID" />
              <IconButton type="button" sx={{ p: 1 }}>
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Slot ID</TableCell>
                  <TableCell>Court ID</TableCell>
                  <TableCell>Slot Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeSlotsData.length > 0 ? (
                  timeSlotsData.map((row) => (
                    <TableRow key={row.slotId}>
                      <TableCell>{row.slotId}</TableCell>
                      <TableCell>{row.courtId}</TableCell>
                      <TableCell>{new Date(row.slotDate).toLocaleDateString()}</TableCell>
                      <TableCell>{row.slotStartTime}</TableCell>
                      <TableCell>{row.slotEndTime}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <Button
                            variant="contained"
                            size="small"
                            style={{
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                              
                            }}
                          >
                            Change Slot
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default TimeSlots;
