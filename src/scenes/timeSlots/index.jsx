import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Button, Typography, useTheme, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { tokens } from '../../theme';
import { fetchTimeSlots, createTimeSlot } from '../../api/timeSlotApi';
import Header from '../../components/Header';

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
  const [open, setOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotId: '',
    courtId: courtIdQuery,
    slotDate: '',
    slotStartTime: '',
    slotEndTime: '',
    isAvailable: true,
  });

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

  const handleEdit = (id) => {
    // Logic for edit action
    console.log(`Edit time slot with id: ${id}`);
  };

  const handleDelete = (id) => {
    // Logic for delete action
    console.log(`Delete time slot with id: ${id}`);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setNewSlot({ ...newSlot, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const addedSlot = await createTimeSlot(newSlot);
      setTimeSlotsData([...timeSlotsData, addedSlot]);
      handleClose();
    } catch (error) {
      console.error('Failed to create time slot:', error);
    }
  };

  return (
    <Box m="20px">
      <Header title="TIME SLOTS" subtitle={`List of Time Slots for Court ${courtIdQuery}`} />
      <Box display="flex" justifyContent="flex-end" m="20px 0">
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Create New Slot
        </Button>
      </Box>
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Slot ID</TableCell>
                  <TableCell>Court ID</TableCell>
                  <TableCell>Slot Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Availability</TableCell>
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
                      <TableCell>{row.isAvailable ? 'Available' : 'Unavailable'}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <Button 
                            onClick={() => handleEdit(row.slotId)} 
                            variant="contained" 
                            size="small" 
                            style={{ 
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900]
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            onClick={() => handleDelete(row.slotId)} 
                            variant="contained" 
                            size="small" 
                            style={{ 
                              backgroundColor: colors.redAccent[400],
                              color: colors.primary[900]
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box 
          display="flex" 
          flexDirection="column" 
          p="20px" 
          m="20px auto" 
          bgcolor="background.paper" 
          boxShadow={24} 
          width={400} 
          borderRadius={4}
        >
          <Typography variant="h6" mb="20px">Create New Slot</Typography>
          <TextField label="Slot ID" name="slotId" value={newSlot.slotId} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Court ID" name="courtId" value={newSlot.courtId} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Slot Date" name="slotDate" value={newSlot.slotDate} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Start Time" name="slotStartTime" value={newSlot.slotStartTime} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="End Time" name="slotEndTime" value={newSlot.slotEndTime} onChange={handleChange} fullWidth margin="normal" />
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>Create</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default TimeSlots;
