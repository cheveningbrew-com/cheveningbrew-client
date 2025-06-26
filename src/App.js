import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './context/AuthContext';
import MetaTags from "./components/MetaTags/MetaTags";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LandingPage from "./pages/Landing/LandingPage";
import Upload from "./pages/Upload/Upload";
import Feedback from "./pages/Feedback/Feedback";
import Help from "./pages/SupportPages/Help/Help";
import About from "./pages/SupportPages/About/About";
import Pricing from "./pages/SupportPages/Pricing/Pricing";
import Privacy from "./pages/SupportPages/Privacy/Privacy";
import Terms from "./pages/SupportPages/Terms/Terms";

const App = () => {
  return (
    <>
      <MetaTags />
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected Routes */}
            {/* #AUTH_REMOVED */}
            <Route element={<ProtectedRoute />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/feedback" element={<Feedback />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
    </>
  );
};

export default App;