import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./components/SignIn";
import Main from "./pages/Main";
import Users from "./pages/Users";
import ProfileForm from "./pages/ProfileForm";
import ProtectedRoute from "./components/functions/ProtectedRoute";
import UserGraph from "./pages/UserGraph";
import SignUp from "./components/SignUp";
import PlatformDetails from "./pages/PlatformDetails";
import ConnectionHealth from "./pages/ConnectionHealth";
import EmissionsHistory from "./pages/EmissionsHistory";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Main />} />
          <Route path="/user-graph" element={<UserGraph />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route
            path="/platforms"
            element={<Navigate to="/platforms/klaviyo" replace />}
          />
          <Route path="/platforms/:platform" element={<PlatformDetails />} />
          <Route path="/connection-health" element={<ConnectionHealth />} />
          <Route path="/history" element={<EmissionsHistory />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:reportId" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
