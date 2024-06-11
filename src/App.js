import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Dashboard from "./scenes/dashboard";
import Courts from "./scenes/courts";
import Payments from "./scenes/payments";
import Calendar from "./scenes/calendar";
import FAQ from "./scenes/faq";
import Bar from "./scenes/bar";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Geography from "./scenes/geography";
import Review from "./scenes/reviews/reviews";
import Branches from "./scenes/branches";
import TimeSlots from "./scenes/timeSlots";
import Bookings from "./scenes/bookings";
import Users from "./scenes/users";
import ReviewForm from "./scenes/form/ReviewForm";
import UserDetails from "./scenes/users/UserDetails";
import BranchForm from "./scenes/form/BranchForm";
import Login from "./scenes/login";
import Layout from "./Layout"; // Đảm bảo bạn đã tạo file Layout.js
import Staff from "./scenes/staff/staff";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Kiểm tra trạng thái đăng nhập

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Routes cho admin */}
          <Route path="/admin" element={<PrivateRoute element={Layout} />}>
            <Route index element={<PrivateRoute element={Users} />} />
            <Route path="dashboard" element={<PrivateRoute element={Dashboard} />} />
            <Route path="Users" element={<PrivateRoute element={Users} />} />
            <Route path="Users/:id" element={<PrivateRoute element={UserDetails} />} />
            <Route path="Courts" element={<PrivateRoute element={Courts} />} />
            <Route path="Payments" element={<PrivateRoute element={Payments} />} />
            <Route path="Reviews" element={<PrivateRoute element={Review} />} />
            <Route path="Branches" element={<PrivateRoute element={Branches} />} />
            <Route path="TimeSlots" element={<PrivateRoute element={TimeSlots} />} />
            <Route path="Bookings" element={<PrivateRoute element={Bookings} />} />
            <Route path="ReviewForm" element={<PrivateRoute element={ReviewForm} />} />
            <Route path="BranchForm" element={<PrivateRoute element={BranchForm} />} />
            <Route path="calendar" element={<PrivateRoute element={Calendar} />} />
            <Route path="faq" element={<PrivateRoute element={FAQ} />} />
            <Route path="bar" element={<PrivateRoute element={Bar} />} />
            <Route path="pie" element={<PrivateRoute element={Pie} />} />
            <Route path="line" element={<PrivateRoute element={Line} />} />
            <Route path="geography" element={<PrivateRoute element={Geography} />} />
          </Route>

          {/* Routes cho staff */}
          <Route path="/staff" element={<PrivateRoute element={Staff} />} />
          
          {/* Chuyển hướng đến trang login nếu không có đường dẫn nào khớp */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
