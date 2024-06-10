import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Button, Typography, useTheme, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputBase, IconButton } from '@mui/material';
import { tokens } from '../../theme';
import { fetchTimeSlots, createTimeSlot, updateTimeSlotById } from '../../api/timeSlotApi';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotId: '',
    courtId: courtIdQuery,
    bookingId: '',
    slotDate: '',
    slotStartTime: '',
    slotEndTime: '',
    price: 0,
    status: 'Active',
  });

  const [editSlot, setEditSlot] = useState({
    slotId: '',
    courtId: courtIdQuery,
    bookingId: '',
    slotDate: '',
    slotStartTime: '',
    slotEndTime: '',
    price: 0,
    status: 'Active',
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

  const handleEditOpen = (slot) => {
    setEditSlot(slot);
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);
  const handleCreateOpen = () => setCreateOpen(true);
  const handleCreateClose = () => setCreateOpen(false);

  const handleChange = (e, setter) => {
    setter(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleCreateSubmit = async () => {
    try {
      const addedSlot = await createTimeSlot(newSlot);
      setTimeSlotsData([...timeSlotsData, addedSlot]);
      handleCreateClose();
    } catch (error) {
      console.error('Failed to create time slot:', error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await updateTimeSlotById(editSlot.slotId, editSlot);
      setTimeSlotsData(prevState => prevState.map(slot => (slot.slotId === editSlot.slotId ? editSlot : slot)));
      handleEditClose();
    } catch (error) {
      console.error('Failed to update time slot:', error);
    }
  };

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
            <Button
              variant="contained"
              onClick={handleCreateOpen}
              style={{
                backgroundColor: colors.greenAccent[400],
                color: colors.primary[900],
                marginLeft: 8,
              }}
            >
              Create New
            </Button>
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
                            onClick={() => handleEditOpen(row)}
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

      <Modal open={createOpen} onClose={handleCreateClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb="20px">Create New Slot</Typography>
          <TextField label="Slot ID" name="slotId" value={newSlot.slotId} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="Court ID" name="courtId" value={newSlot.courtId} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="Booking ID" name="bookingId" value={newSlot.bookingId} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="Slot Date" name="slotDate" value={newSlot.slotDate} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="Start Time" name="slotStartTime" value={newSlot.slotStartTime} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="End Time" name="slotEndTime" value={newSlot.slotEndTime} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="Price" name="price" value={newSlot.price} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <TextField label="Status" name="status" value={newSlot.status} onChange={(e) => handleChange(e, setNewSlot)} fullWidth margin="normal" />
          <Button variant="contained" color="primary" onClick={handleCreateSubmit} fullWidth>Create</Button>
        </Box>
      </Modal>

      <Modal open={editOpen} onClose={handleEditClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb="20px">Edit Slot</Typography>
          <TextField label="Slot ID" name="slotId" value={editSlot.slotId} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" disabled />
          <TextField label="Court ID" name="courtId" value={editSlot.courtId} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <TextField label="Booking ID" name="bookingId" value={editSlot.bookingId} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <TextField label="Slot Date" name="slotDate" value={editSlot.slotDate} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <TextField label="Start Time" name="slotStartTime" value={editSlot.slotStartTime} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <TextField label="End Time" name="slotEndTime" value={editSlot.slotEndTime} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <TextField label="Price" name="price" value={editSlot.price} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <TextField label="Status" name="status" value={editSlot.status} onChange={(e) => handleChange(e, setEditSlot)} fullWidth margin="normal" />
          <Button variant="contained" color="primary" onClick={handleEditSubmit} fullWidth>Update</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default TimeSlots;
