// // validation.js

// const validateUsername = (username) => {
//     if (!username) {
//       return "Username is required.";
//     }
//     if (username.length < 3 || username.length > 20) {
//       return "Username must be between 3 and 20 characters long.";
//     }
//     return null;
//   };
  
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email) {
//       return "Email is required.";
//     }
//     if (!emailRegex.test(email)) {
//       return "Invalid email format.";
//     }
//     return null;
//   };
  
//   const validatePhone = (phone) => {
//     const phoneRegex = /^[0-9]{10,15}$/;
//     if (!phone) {
//       return "Phone number is required.";
//     }
//     if (!phoneRegex.test(phone)) {
//       return "Phone number must be between 10 and 15 digits.";
//     }
//     return null;
//   };
  
//   const validateUser = (user) => {
//     const usernameError = validateUsername(user.username);
//     const emailError = validateEmail(user.email);
//     const phoneError = validatePhone(user.phone);
  
//     return {
//       usernameError,
//       emailError,
//       phoneError,
//       isValid: !usernameError && !emailError && !phoneError,
//     };
//   };
  
//   export {
//     validateUsername,
//     validateEmail,
//     validatePhone,
//     validateUser
//   };
  