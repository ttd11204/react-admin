import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { createReview, fetchUsers, fetchBranches } from "../../api/reviewApi";
import { useEffect, useState } from "react";

const reviewSchema = yup.object().shape({
  reviewText: yup.string().required("required"),
  rating: yup
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .required("required"),
  userId: yup.string().required("required"),
  branchId: yup.string().required("required"),
});

const initialValues = {
  reviewText: "",
  rating: "",
  userId: "",
  branchId: "",
};

const ReviewForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const getUsersAndBranches = async () => {
      try {
        const usersData = await fetchUsers();
        const branchesData = await fetchBranches();
        setUsers(usersData);
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching users or branches:', error);
      }
    };

    getUsersAndBranches();
  }, []);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const data = {
        reviewText: values.reviewText,
        rating: values.rating,
        userId: values.userId,
        branchId: values.branchId,
      };

      const response = await createReview(data);
      console.log('Review created:', response);
      resetForm();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE REVIEW" subtitle="Create a new review" />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={reviewSchema}
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Review Text"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.reviewText}
                name="reviewText"
                error={!!touched.reviewText && !!errors.reviewText}
                helperText={touched.reviewText && errors.reviewText}
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Rating"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.rating}
                name="rating"
                error={!!touched.rating && !!errors.rating}
                helperText={touched.rating && errors.rating}
                sx={{ gridColumn: "span 4" }}
              />

              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>User</InputLabel>
                <Select
                  label="User"
                  value={values.userId}
                  onChange={(event) => setFieldValue('userId', event.target.value)}
                  error={!!touched.userId && !!errors.userId}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>Branch</InputLabel>
                <Select
                  label="Branch"
                  value={values.branchId}
                  onChange={(event) => setFieldValue('branchId', event.target.value)}
                  error={!!touched.branchId && !!errors.branchId}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Review
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ReviewForm;
