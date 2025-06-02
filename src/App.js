import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Comment out Google OAuth
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import { AuthProvider } from './context/AuthContext';
import MetaTags from "./components/MetaTags/MetaTags";
// Comment out protected route
// import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LandingPage from "./pages/Landing/LandingPage";
import Upload from "./pages/Upload/Upload";
// Remove Interview
// import Interview from "./pages/Interview/Interview";
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
      {/* Remove GoogleOAuthProvider */}
      <BrowserRouter>
        {/* Remove AuthProvider */}
        <Routes>
          {/* Make all routes public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Convert protected routes to regular routes */}
          <Route path="/upload" element={<Upload />} />
          {/* Remove Interview route */}
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;