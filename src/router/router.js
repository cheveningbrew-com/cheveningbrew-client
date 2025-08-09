import React from "react";
import { createBrowserRouter } from "react-router-dom";
import LoginSignup from "../components/LoginSignup/LoginSignup";
import Feedback from "../pages/Feedback/Feedback";
import LandingPage from "../pages/Landing/LandingPage";
import About from "../pages/SupportPages/About/About";
import GetEssayCollection from "../pages/SupportPages/GetEssayCollection/GetEssayCollection";
import Help from "../pages/SupportPages/Help/Help";
import Pricing from "../pages/SupportPages/Pricing/Pricing";
import Privacy from "../pages/SupportPages/Privacy/Privacy";
import Terms from "../pages/SupportPages/Terms/Terms";
import Upload from "../pages/Upload/Upload";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login-signup",
    element: <LoginSignup />,
  },
  {
    path: "/upload",
    element: <Upload />,
  },
  {
    path: "/feedback",
    element: <Feedback />,
  },
  {
    path: "/help",
    element: <Help />,
  },

  { path: "/about", element: <About /> },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },
  {
    path: "/essays",
    element: <GetEssayCollection />,
  },
]);
