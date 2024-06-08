import { Box, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { createCourt } from "../../api/courtApi";
import { fetchAllBranches } from "../../api/branchApi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const courtSchema = yup.object().shape({
  branchId: yup.string().required("required"),
  courtName: yup.string().required("required"),
  courtPicture: yup.string().required("required"),
  status: yup.string().required("required"),
});

const initialValues = {
  branchId: "",
  courtName: "",
  courtPicture: "",
  status: "",
};

const CourtForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const getBranches = async () => {
      try {
        const data = await fetchAllBranches();
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    getBranches();
  }, []);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const response = await createCourt(values);
      console.log('Court created:', response);
      resetForm();
      navigate('/Courts');
    } catch (error) {
      console.error('Error creating court:', error);
      setError('Failed to create court');
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE COURT" subtitle="Create a new court" />
      {error && (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      )}
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={courtSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 4",
                },
              }}
            >
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel id="branch-select-label">Branch ID</InputLabel>
                <Select
                  labelId="branch-select-label"
                  id="branchId"
                  name="branchId"
                  value={values.branchId}
                  onChange={(e) => setFieldValue("branchId", e.target.value)}
                  error={!!touched.branchId && !!errors.branchId}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchId}
                    </MenuItem>
                  ))}
                </Select>
                {touched.branchId && errors.branchId && (
                  <Typography color="error" variant="body2">
                    {errors.branchId}
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Court Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.courtName}
                name="courtName"
                error={!!touched.courtName && !!errors.courtName}
                helperText={touched.courtName && errors.courtName}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Court Picture"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.courtPicture}
                name="courtPicture"
                error={!!touched.courtPicture && !!errors.courtPicture}
                helperText={touched.courtPicture && errors.courtPicture}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Status"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.status}
                name="status"
                error={!!touched.status && !!errors.status}
                helperText={touched.status && errors.status}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Court
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default CourtForm;
