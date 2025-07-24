import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MemberProvider } from "./context/MemberContext";
import { HomePage } from "./pages/HomePage";
import { VehicleBookingPage } from "./pages/VehicleBookingPage";
import { LoginPage } from "./pages/LoginPage";
import { AboutPage } from "./pages/AboutPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Layout } from "./components/Layout";
import { AvailableVehiclesPage } from "./pages/AvailableVehiclesPage";
import { BookingDetailsPage } from "./pages/BookingDetailsPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AdminBookingsPage } from "./pages/AdminBookingsPage";
import { AdminVehiclesPage } from "./pages/AdminVehiclesPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/DriveZoneTheme.css";

function App() {
  return (
    <MemberProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/book-vehicle" element={<VehicleBookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route
              path="/bookings/:bookingId"
              element={<BookingDetailsPage />}
            />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
            <Route
              path="/available-vehicles"
              element={<AvailableVehiclesPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Layout>
      </Router>
    </MemberProvider>
  );
}

export default App;
