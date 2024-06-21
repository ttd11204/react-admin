import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { validateRequired, validateNumber } from "../../../scenes/formValidation";
import { fetchUserDetailByEmail } from "../../../api/userApi";
import { fetchBranchById } from "../../../api/branchApi";
import { useNavigate } from "react-router-dom";

const Flexible = () => {
  const [email, setEmail] = useState('');
  const [numberOfSlot, setNumberOfSlot] = useState('');
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    numberOfSlot: '',
    branchId: '',
  });

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    let error = '';
    if (field === 'numberOfSlot') {
      const validation = validateNumber(value);
      error = validation.isValid ? '' : validation.message;
    } else if (field === 'email' || field === 'branchId') {
      const validation = validateRequired(value);
      error = validation.isValid ? '' : validation.message;
    }
    setErrors(prevErrors => ({ ...prevErrors, [field]: error }));
    
    if (field === 'email') setEmail(value);
    if (field === 'numberOfSlot') setNumberOfSlot(value);
    if (field === 'branchId') setBranchId(value);
  };

  const handleSubmit = async () => {
    const emailValidation = validateRequired(email);
    const numberOfSlotValidation = validateNumber(numberOfSlot);
    const branchIdValidation = validateRequired(branchId);

    if (!emailValidation.isValid || !numberOfSlotValidation.isValid || !branchIdValidation.isValid) {
      setErrors({
        email: emailValidation.message,
        numberOfSlot: numberOfSlotValidation.message,
        branchId: branchIdValidation.message,
      });
      return;
    }

    try {
      const userResponse = await fetchUserDetailByEmail(email);
      const branchResponse = await fetchBranchById(branchId);
      if (userResponse && branchResponse) {
        const userId = userResponse.id; // Assuming the user API response has an id field

        navigate("/staff/flexible-booking", {
          state: {
            userId,
            numberOfSlot,
            branchId,
            email
          }
        });
      } else {
        setErrors({
          email: userResponse ? '' : 'Invalid email',
          numberOfSlot: '',
          branchId: branchResponse ? '' : 'Invalid branch ID',
        });
      }
    } catch (error) {
      console.error('Error during validation:', error);
      setErrors({
        email: 'Error validating email',
        numberOfSlot: '',
        branchId: 'Error validating branch ID',
      });
    }
  };

  return (
    <Box
      m="70px auto"
      sx={{
        backgroundColor: "#CEFCEC",
        borderRadius: 2,
        p: 4,
        maxWidth: "800px",
      }}
    >
      <Typography
        fontWeight="bold"
        mb="30px"
        variant="h2"
        color="black"
        textAlign="center"
      >
        Flexible Court Booking
      </Typography>

      <Typography mb="10px" variant="h5" color="black" fontWeight="bold">
        Email
      </Typography>
      <TextField
        placeholder="Enter User Email"
        fullWidth
        value={email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={Boolean(errors.email)}
        helperText={errors.email}
        InputProps={{
          style: {
            color: "#000000",
          },
        }}
        sx={{
          mb: "20px",
          backgroundColor: "#ffffff",
          borderRadius: 1,
          border: "1px solid #e0e0e0",
        }}
      />

      <Typography mb="10px" variant="h5" color="black" fontWeight="bold">
        Number of Slots
      </Typography>
      <TextField
        placeholder="Enter Number of Slots"
        fullWidth
        value={numberOfSlot}
        onChange={(e) => handleChange('numberOfSlot', e.target.value)}
        error={Boolean(errors.numberOfSlot)}
        helperText={errors.numberOfSlot}
        InputProps={{
          style: {
            color: "#000000",
          },
        }}
        sx={{
          mb: "20px",
          backgroundColor: "#ffffff",
          borderRadius: 1,
          border: "1px solid #e0e0e0",
        }}
      />

      <Typography mb="10px" variant="h5" color="black" fontWeight="bold">
        Branch ID
      </Typography>
      <TextField
        placeholder="Enter Branch ID"
        fullWidth
        value={branchId}
        onChange={(e) => handleChange('branchId', e.target.value)}
        error={Boolean(errors.branchId)}
        helperText={errors.branchId}
        InputProps={{
          style: {
            color: "#000000",
          },
        }}
        sx={{
          mb: "20px",
          backgroundColor: "#ffffff",
          borderRadius: 1,
          border: "1px solid #e0e0e0",
        }}
      />

      <Box display="flex" justifyContent="flex-end" mt="30px">
        <Button
          variant="contained"
          color="secondary"
          sx={{
            padding: "10px 30px",
            fontSize: "16px",
          }}
          onClick={handleSubmit}
        >
          Book
        </Button>
      </Box>
    </Box>
  );
};

export default Flexible;
