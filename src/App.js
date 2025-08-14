import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MetaTags from "./components/MetaTags/MetaTags";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { FooterProvider } from "./context/FooterContext";
import Feedback from "./pages/Feedback/Feedback";
import LandingPage from "./pages/Landing/LandingPage";
import Profile from "./pages/Profile/Profile";
import About from "./pages/SupportPages/About/About";
import GetEssayCollection from "./pages/SupportPages/GetEssayCollection/GetEssayCollection";
import Help from "./pages/SupportPages/Help/Help";
import Pricing from "./pages/SupportPages/Pricing/Pricing";
import Privacy from "./pages/SupportPages/Privacy/Privacy";
import Terms from "./pages/SupportPages/Terms/Terms";
import Upload from "./pages/Upload/Upload";
const App = () => {
  return (
    <>
      <MetaTags />
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
      >
        <BrowserRouter>
          <AuthProvider>
            <FooterProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/help" element={<Help />} />
                <Route path="/about" element={<About />} />
                {/* <Route path="/pricing" element={<Pricing />} /> */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/essays" element={<GetEssayCollection />} />

                {/* Protected Routes - Simplified */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

              </Routes>
            </FooterProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </>
  );
};

export default App;
