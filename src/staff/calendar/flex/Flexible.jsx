import { Box, Typography } from "@mui/material";



const Flexible = () => {
  return (
    <Box m="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}>
      <Typography mb="30px" variant="h1" gutterBottom color="black">Customer Information</Typography>
      <Typography mb="30px" variant="h3" color="black">Email</Typography>
      <Typography mb="30px" variant="h3" color="black">Choose number of slot</Typography>
      <Typography mb="30px" variant="h3" color="black">Branch</Typography>
        
    </Box>
  );
}

export default Flexible;