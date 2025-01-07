import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import AdminPage from "./components/Admin/AdminPage";
import MemberPage from "./components/Member/MemberPage";
import PrayerTimes from "./components/Admin/AddPrayerTimes";
import AddMessages from "./components/Admin/AddMessages";
import AddCongratulations from "./components/Admin/AddCongratulations";
import MemberList from "./components/Admin/MemberList";
import DonationList from "./components/Admin/DonationList";
import EventList from "./components/Admin/EventList";
import FinanceManager from "./components/Admin/FinanceManager ";
import Index from "./components/Admin/Index";
import Settings from "./components/Admin/Settings";
import DonationForm from "./components/Member/DonationForm";
import DonationsListUser from "./components/Member/DonationsListUser";
import EventBooking from "./components/Member/EventBooking";
import SendMessage from "./components/Member/SendMessage";
import EditMember from "./components/Member/EditMember";
import ResetPassword from "./components/Login/ResetPassword";
import { UserProvider } from "./contexts/UserContext";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />}>
            <Route path="prayer-times" element={<PrayerTimes />} />
            <Route path="add-messages" element={<AddMessages />} />
            <Route
              path="add-congratulations"
              element={<AddCongratulations />}
            />
            <Route path="member-list" element={<MemberList />} />
            <Route path="donation-list" element={<DonationList />} />
            <Route path="event-list" element={<EventList />} />
            <Route path="finance-manager" element={<FinanceManager />} />
            <Route path="inbox" element={<Index />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/member" element={<MemberPage />}>
            <Route path="donation-form" element={<DonationForm />} />
            <Route path="donations-list-user" element={<DonationsListUser />} />
            <Route path="event-booking" element={<EventBooking />} />
            <Route path="send-message" element={<SendMessage />} />
            <Route path="edit-member" element={<EditMember />} />
          </Route>
          <Route path="/reset-password/:token" element={<ResetPassword />} />{" "}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
