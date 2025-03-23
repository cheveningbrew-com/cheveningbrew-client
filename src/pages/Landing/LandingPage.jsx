import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import Logo from "../../components/Logo/Logo";
import Footer from "../../components/Footer/Footer";
import g from "../../assets/images/G.webp";
import { useGoogleLogin } from "@react-oauth/google";
import { validateToken, clearAuthData } from "../../utils/auth";
import { useAuth } from "../../context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
    onSuccess: (tokenResponse) => {
      setIsLoading(true);
      fetch(`${process.env.REACT_APP_USER_AUTH_SERVER}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: tokenResponse.code }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          console.log("Response:", response);
          return response.json();
        })
        .then((data) => {
          if (data.authenticated) {
            // First store the token
            localStorage.setItem("authToken", data.authToken);

            // Call the auth context login
            if (data.user && data.user.name && data.user.email) {
              authLogin(data.authToken, data.user.name, data.user.email); // Now using the renamed function
            } else {
              authLogin(data.authToken);
            }

            console.log("Authentication successful");
            setIsLoading(false);
            setAuthSuccess(true);
          } else {
            setIsLoading(false);
            setError("Authentication failed");
          }
        })
        .catch((error) => {
          console.error("Authentication error:", error);
          setIsLoading(false);
          setError("Authentication failed");
        });
    },
    onError: (error) => {
      console.error("Authentication error:", error);
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
      <div className={styles.container}>
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
