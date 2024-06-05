import Topbar from "./scenes/global/Topbar";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Courts from "./scenes/courts";
import Payments from "./scenes/payments";
import Form from "./scenes/form";
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


function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar/>
          <main className="content">
              <Topbar/>
              <Routes>
              <Route path="/" element={<Dashboard/>} />
              <Route path="/Users" element={<Users/>} />
              <Route path="/Courts" element={<Courts/>} />
              <Route path="/Payments" element={<Payments/>} />
              <Route path="/Reviews" element={<Review/>} />
              <Route path="/Branches" element={<Branches/>} />
              <Route path="/TimeSlots" element={<TimeSlots/>} />
              <Route path="/Bookings" element={<Bookings/>} />
              <Route path="/form" element={<Form/>} />
              <Route path="/calendar" element={<Calendar/>} />
              <Route path="/faq" element={<FAQ/>} />
              <Route path="/bar" element={<Bar/>} />
              <Route path="/pie" element={<Pie/>} />
              <Route path="/line" element={<Line/>} />
              <Route path="/geography" element={<Geography/>} />
              </Routes>

          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
