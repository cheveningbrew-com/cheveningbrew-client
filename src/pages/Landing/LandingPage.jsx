import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import Logo from "../../components/Logo/Logo";
import Footer from "../../components/Footer/Footer";
import g from "../../assets/images/G.webp";
import { useGoogleLogin } from "@react-oauth/google";
import {useAuth} from '../../context/AuthContext';
import { createUser } from "../../services/api"; // Assuming you have this function to create a user


const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [_, setError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const { login: authLogin } = useAuth(); // Renamed to authLogin
  console.log(
    "login request root",
    process.env.REACT_APP_CHEVENINGBREW_SERVER_URL
  );

  useEffect(() => {
    if (authSuccess) {
      console.log("Auth success detected, navigating to /upload");
      navigate("/upload", { replace: true });
    }
  }, [authSuccess, navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
  
        // Step 1: Send Google auth code to backend
        const response = await fetch(`${process.env.REACT_APP_USER_AUTH_SERVER}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: tokenResponse.code }),
        });
  
        if (!response.ok) {
          throw new Error("Google authentication failed");
        }
  
        const data = await response.json();
  
        if (data.authenticated) {
          console.log("Authentication successful:", data);
  
          // Step 2: Call auth context login
          if (data.user && data.user.name && data.user.email) {
            authLogin(data.authToken, data.user.name, data.user.email);
          } else {
            authLogin(data.authToken);
          }
  
          // Step 3: Save user in the database
          const savedUser = await createUser(
            data.user.email, 
            data.user.name, 
            data.user.id, 
            data.user.picture, 
            data.authToken // Pass token if needed
          );
  
          console.log("User saved in DB:", savedUser);
  
          setAuthSuccess(true);
        } else {
          setError("Authentication failed");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setError("Authentication failed");
      } finally {
        setIsLoading(false);
      }
    },
  
    onError: (error) => {
      console.error("Google Authentication error:", error);
      setIsLoading(false);
      setError("Authentication failed");
    },
  
    flow: "auth-code",
  });

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    googleLogin(); // Updated to use the renamed function
  };

  const events = [
    {
      title: "Upload your Chevening essay.",
    },
    {
      title:
        "Mock with our voice AI interviewer, closely simulating your final Chevening interview.",
    },
    {
      title:
        "Get detailed, Chevening evaluation aligned feedback that radically improves your chances of winning the Chevening Scholarship this year.",
    },
  ];

  return (
    <>
    <div className={`${styles.container} customScroll`}>

        <div className={styles.pageWrapper}>
          <div className={styles.content}>
            <Logo />
            <div className={styles.description}>
              <b>
                Ace your Chevening interview by mocking with our voice-enabled
                AI expert interviewer.{" "}
              </b>
              Built for Chevening aspirants . . . by Chevening alumni.
            </div>
            {/* Timeline Section */}
            <div className={styles["timeline-container"]}>
              <div className={styles.timeline}>
                {events.map((event, index) => (
                  <div key={index} className={styles["timeline-event"]}>
                    <div className={styles["timeline-bullet"]}></div>
                    <div className={styles["timeline-content"]}>
                      <div className={styles["timeline-event-title"]}>
                        {event.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start button using CSS Module class */}
            <button
              className={`${styles.landingPageButton} ${
                isLoading ? styles.loading : ""
              }`}
              onClick={handleGoogleSignIn}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <img src={g} alt="logo" width="30" /> Sign in with Google
                </>
              )}
            </button>
          </div>
          <Footer className={styles.landingPageFooter} />
        </div>
      </div>

    </>
  );
};

export default LandingPage;
