import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  InputBase,
  IconButton,
  Modal,
} from "@mui/material";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import {
  fetchCourts,
  createCourt,
  updateCourtById,
  fetchCourtById,
  deleteCourtById,
} from "../../api/courtApi";
import Header from "../../components/Header";
import SearchIcon from "@mui/icons-material/Search";

const useQuery = () => new URLSearchParams(useLocation().search);

const Courts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [courtsData, setCourtsData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();
  const branchIdQuery = query.get("branchId");

  const pageQuery = parseInt(query.get("pageNumber")) || 1;
  const sizeQuery = parseInt(query.get("pageSize")) || 10;

  const [page, setPage] = useState(pageQuery - 1);
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newCourtData, setNewCourtData] = useState({
    branchId: branchIdQuery,
    courtName: "",
    courtPicture: "",
    status: "Active",
  });
  const [editCourtData, setEditCourtData] = useState({
    courtId: "",
    branchId: branchIdQuery,
    courtName: "",
    courtPicture: "",
    status: "",
  });

  useEffect(() => {
    if (!branchIdQuery) {
      setError("Branch ID is required to view courts.");
      return;
    }

    const getCourtsData = async () => {
      try {
        const data = await fetchCourts(page + 1, pageSize);
        const filteredData = data.items.filter(
          (court) => court.branchId === branchIdQuery
        );
        const numberedData = filteredData.map((item, index) => ({
          ...item,
          rowNumber: index + 1 + page * pageSize,
        }));
        setCourtsData(numberedData);
        setRowCount(filteredData.length);
      } catch (err) {
        setError(`Failed to fetch courts data: ${err.message}`);
      }
    };
    getCourtsData();
  }, [page, pageSize, branchIdQuery]);

  const handlePageClick = (event) => {
    const newPage = event.selected;
    setPage(newPage);
    navigate(
      `/admin/Courts?pageNumber=${
        newPage + 1
      }&pageSize=${pageSize}&branchId=${branchIdQuery}`
    );
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(
      `/admin/Courts?pageNumber=1&pageSize=${newSize}&branchId=${branchIdQuery}`
    );
  };

  const handleView = (courtId) => {
    navigate(`/admin/TimeSlots?courtId=${courtId}`);
  };

  const handleEdit = async (courtId) => {
    try {
      const court = await fetchCourtById(courtId);
      setEditCourtData(court);
      setEditModalOpen(true);
    } catch (err) {
      setError(`Failed to fetch court data for editing: ${err.message}`);
    }
  };

  const handleDelete = async (courtId) => {
    try {
      await deleteCourtById(courtId);
      const data = await fetchCourts(page + 1, pageSize);
      const filteredData = data.items.filter(
        (court) => court.branchId === branchIdQuery
      );
      const numberedData = filteredData.map((item, index) => ({
        ...item,
        rowNumber: index + 1 + page * pageSize,
      }));
      setCourtsData(numberedData);
      setRowCount(filteredData.length);
    } catch (err) {
      setError(`Failed to delete court: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    try {
      if (searchId.trim() === "") {
        const data = await fetchCourts(page + 1, pageSize);
        const filteredData = data.items.filter(
          (court) => court.branchId === branchIdQuery
        );
        const numberedData = filteredData.map((item, index) => ({
          ...item,
          rowNumber: index + 1 + page * pageSize,
        }));
        setCourtsData(numberedData);
        setRowCount(filteredData.length);
      } else {
        const court = await fetchCourtById(searchId);
        if (court.branchId === branchIdQuery) {
          setCourtsData([court]);
          setRowCount(1);
        } else {
          setCourtsData([]);
          setRowCount(0);
        }
      }
    } catch (err) {
      setError(`Failed to fetch court data: ${err.message}`);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewCourtData({ ...newCourtData, [name]: value });
  };

  const handleCreateSave = async () => {
    try {
      await createCourt(newCourtData);
      setCreateModalOpen(false);
      const data = await fetchCourts(page + 1, pageSize);
      const filteredData = data.items.filter(
        (court) => court.branchId === branchIdQuery
      );
      const numberedData = filteredData.map((item, index) => ({
        ...item,
        rowNumber: index + 1 + page * pageSize,
      }));
      setCourtsData(numberedData);
      setRowCount(filteredData.length);
    } catch (err) {
      setError(`Failed to create court: ${err.message}`);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCourtData({ ...editCourtData, [name]: value });
  };

  const handleEditSave = async () => {
    try {
      await updateCourtById(editCourtData.courtId, editCourtData);
      setEditModalOpen(false);
      const data = await fetchCourts(page + 1, pageSize);
      const filteredData = data.items.filter(
        (court) => court.branchId === branchIdQuery
      );
      const numberedData = filteredData.map((item, index) => ({
        ...item,
        rowNumber: index + 1 + page * pageSize,
      }));
      setCourtsData(numberedData);
      setRowCount(filteredData.length);
    } catch (err) {
      setError(`Failed to update court: ${err.message}`);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="COURTS"
        subtitle={`List of Courts for Branch ${branchIdQuery}`}
      />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box
              display="flex"
              backgroundColor={colors.primary[400]}
              borderRadius="3px"
            >
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Court ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.greenAccent[400],
                color: colors.primary[900],
                marginLeft: 8,
              }}
              onClick={() => setCreateModalOpen(true)}
            >
              Create New
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Court ID</TableCell>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Court Name</TableCell>
                  <TableCell>Court Picture</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courtsData.length > 0 ? (
                  courtsData.map((row) => (
                    <TableRow key={row.courtId}>
                      <TableCell>{row.courtId}</TableCell>
                      <TableCell>{row.branchId}</TableCell>
                      <TableCell>{row.courtName}</TableCell>
                      <TableCell>{row.courtPicture}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => handleView(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => handleEdit(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              backgroundColor: colors.redAccent[400],
                              color: colors.primary[900],
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
                    <TableCell colSpan={6} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="20px"
          >
            <Select value={pageSize} onChange={handlePageSizeChange}>
              {[10, 15, 20, 25, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={Math.ceil(rowCount / pageSize)}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          </Box>
        </Box>
      )}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Create New Court
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Court Name"
            name="courtName"
            value={newCourtData.courtName}
            onChange={handleCreateChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Court Picture"
            name="courtPicture"
            value={newCourtData.courtPicture}
            onChange={handleCreateChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Status"
            name="status"
            value={newCourtData.status}
            onChange={handleCreateChange}
          />
          <Button
            variant="contained"
            style={{
              backgroundColor: colors.greenAccent[400],
              color: colors.primary[900],
              marginTop: 16,
            }}
            onClick={handleCreateSave}
          >
            Save
          </Button>
        </Box>
      </Modal>
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-court-modal-title"
        aria-describedby="edit-court-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="edit-court-modal-title" variant="h6" component="h2">
            Edit Court
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Court Name"
            name="courtName"
            value={editCourtData.courtName}
            onChange={handleEditChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Court Picture"
            name="courtPicture"
            value={editCourtData.courtPicture}
            onChange={handleEditChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Status"
            name="status"
            value={editCourtData.status}
            onChange={handleEditChange}
          />
          <Button
            variant="contained"
            style={{
              backgroundColor: colors.greenAccent[400],
              color: colors.primary[900],
              marginTop: 16,
            }}
            onClick={handleEditSave}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Courts;
