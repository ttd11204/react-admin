// src/scenes/branches/BranchForm.jsx

import { Box, Button, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { createBranch } from "../../api/branchApi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const branchSchema = yup.object().shape({
  branchAddress: yup.string().required("required"),
  branchName: yup.string().required("required"),
  branchPhone: yup.string().required("required"),
  description: yup.string().required("required"),
  branchPicture: yup.string().required("required"),
  openTime: yup.string().required("required"),
  closeTime: yup.string().required("required"),
  openDay: yup.string().required("required"),
  status: yup.string().required("required"),
});

const initialValues = {
  branchAddress: "",
  branchName: "",
  branchPhone: "",
  description: "",
  branchPicture: "",
  openTime: "",
  closeTime: "",
  openDay: "",
  status: "",
};

const BranchForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const response = await createBranch(values);
      console.log('Branch created:', response);
      resetForm();
      navigate('/Branches');
    } catch (error) {
      console.error('Error creating branch:', error);
      setError('Failed to create branch');
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE BRANCH" subtitle="Create a new branch" />
      {error && (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      )}
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={branchSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Branch Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.branchAddress}
                name="branchAddress"
                error={!!touched.branchAddress && !!errors.branchAddress}
                helperText={touched.branchAddress && errors.branchAddress}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Branch Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.branchName}
                name="branchName"
                error={!!touched.branchName && !!errors.branchName}
                helperText={touched.branchName && errors.branchName}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Branch Phone"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.branchPhone}
                name="branchPhone"
                error={!!touched.branchPhone && !!errors.branchPhone}
                helperText={touched.branchPhone && errors.branchPhone}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                name="description"
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Branch Picture"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.branchPicture}
                name="branchPicture"
                error={!!touched.branchPicture && !!errors.branchPicture}
                helperText={touched.branchPicture && errors.branchPicture}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Open Time"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.openTime}
                name="openTime"
                error={!!touched.openTime && !!errors.openTime}
                helperText={touched.openTime && errors.openTime}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Close Time"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.closeTime}
                name="closeTime"
                error={!!touched.closeTime && !!errors.closeTime}
                helperText={touched.closeTime && errors.closeTime}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Open Day"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.openDay}
                name="openDay"
                error={!!touched.openDay && !!errors.openDay}
                helperText={touched.openDay && errors.openDay}
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
                Create New Branch
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default BranchForm;
