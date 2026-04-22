import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";

import ProtectedRoutes from "./components/ProtectedRoutes";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Home />} />
        <Route path="/signup" element={<Home />} />
        <Route path="/forgot-password" element={<Home />} />
        <Route path="/reset-password" element={<Home />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
