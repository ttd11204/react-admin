import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Dashboard from "./scenes/dashboard";
import Courts from "./scenes/courts";
import Payments from "./scenes/payments";
// import Calendar from "./scenes/calendar";
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
import Login from "./scenes/login";
import Layout from "./scenes/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StaffLayout from "./staff/StaffLayout";
import ReserveSlot from "./staff/calendar/byday/Byday";
import PaymentDetail from "./staff/Payment/PaymentDetails";
import {PaymentConfirmed} from "./staff/Payment/PaymentConfirmation";
import { PaymentRejected } from "./staff/Payment/PaymentConfirmation";

import Checkin from "./staff/Payment/Checkin";
import Flexible from "./staff/calendar/flex/Flexible";
import FlexibleBooking from "./staff/calendar/flex/FlexibleBooking";

function App() {
  const [theme, colorMode] = useMode();

  const ProtectedRoute = ({ children, roles }) => {
    const userRole = localStorage.getItem("userRole");
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Routes cho admin */}
          <Route path="/" element={<ProtectedRoute roles={["Admin"]}><Layout /></ProtectedRoute>}>
          {/* <Route path="/" element={<Layout />}> */}
            <Route index element={<Users />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="Users" element={<Users />} />
            <Route path="Users/:id" element={<UserDetails />} />
            <Route path="Courts" element={<Courts />} />
            <Route path="Payments" element={<Payments />} />
            <Route path="Reviews" element={<Review />} />
            <Route path="Branches" element={<Branches />} />
            <Route path="TimeSlots" element={<TimeSlots />} />
            <Route path="Bookings" element={<Bookings />} />
            <Route path="ReviewForm" element={<ReviewForm />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="bar" element={<Bar />} />
            <Route path="pie" element={<Pie />} />
            <Route path="line" element={<Line />} />
            <Route path="geography" element={<Geography />} />
          </Route>

          {/* Routes cho staff */}
          <Route path="/staff/*" element={<ProtectedRoute roles={["Staff"]}><StaffLayout /></ProtectedRoute>}>
            <Route index element={<Users />} />
            <Route path="Users" element={<Users />} />
            <Route path="Users/:id" element={<UserDetails />} />
            <Route path="Bookings" element={<Bookings />} />
            <Route path="Payments" element={<Payments />} />
            <Route path="Reviews" element={<Review />} />
            <Route path="ReserveSlot" element={<ReserveSlot />} />
            <Route path="flex" element={<Flexible />} />
            <Route path="flexible-booking" element={<FlexibleBooking />} />
            <Route path="PaymentDetail" element={<PaymentDetail />} />
            <Route path="ReviewForm" element={<ReviewForm />} />
            <Route path="confirm" element={< PaymentConfirmed/>} />
            <Route path="reject" element={<PaymentRejected />} />
            <Route path="checkin" element={<Checkin />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
