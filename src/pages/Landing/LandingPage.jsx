import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import Logo from "../../components/Logo/Logo";
import Footer from "../../components/Footer/Footer";
// Comment out Google imports
// import g from "../../assets/images/G.webp";
// import { useGoogleLogin } from "@react-oauth/google";
// import {useAuth} from '../../context/AuthContext';
// import { createUser } from "../../services/api";

const LandingPage = () => {
  const navigate = useNavigate();
  // Comment out auth-related state
  // const [isLoading, setIsLoading] = useState(false);
  // const [_, setError] = useState(null);
  // const [authSuccess, setAuthSuccess] = useState(false);
  // const { login: authLogin, isAuthenticated } = useAuth();
  
  // Replace Google login with direct navigation
  const handleGetStarted = () => {
    // Simply navigate to upload page
    navigate("/upload");
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

            {/* Modify button to skip auth */}
            <button
              className={styles.landingPageButton}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
          <Footer className={styles.landingPageFooter} />
        </div>
      </div>
    </>
  );
};

export default LandingPage;