import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import Uploader from "../../components/Uploader/Uploader";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";
import { readUserField, getUserId, getUserSubscription, interviewReadUserField } from "../../services/api";
import Price from "../../components/PricePopUp/Price";
import SignOutPopup from "../../components/SignoutPopup/SignoutPopup";
import { handleSignOut } from "../../components/SignOut/SignOutHelper";
import { useAuth } from "../../context/AuthContext";

const Upload = () => {
  const [_, setFilePath] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [payment_completed, setpayment_completed] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [interviewDone, setInterviewDone] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    const checkUserStatus = async () => {
      const userId = getUserId();
      if (!userId) {
        navigate("/");
        return;
      }
  
      try {
        // Check payment status
        const dbPaymentStatus = await readUserField(userId, "payment_completed");
        // Check interview status and attempts
        const interviewDone = await interviewReadUserField(userId, "is_completed");
        const subscription = await getUserSubscription({ userId, field: "attempts" });

        setInterviewDone(interviewDone === true);
        setAttemptsLeft(subscription.attempts);
        
        if (!dbPaymentStatus) {
          setShowPaymentPopup(true);
        } else {
          setpayment_completed(true);
        }

        // Show sign out popup if no attempts left and interview is done
        if (interviewDone && subscription.attempts === 0) {
          setShowSignOutPopup(true);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setShowPaymentPopup(true); // fallback: show popup if unsure
      } finally {
        setIsLoading(false);
      }
    };
  
    checkUserStatus();
  }, [navigate]);

  useEffect(() => {
    const uploadStatus = sessionStorage.getItem("upload_completed");
    if (uploadStatus === "true") {
      setFileUploaded(true);
    }
  }, []);

  const handleUploadSuccess = (path) => {
    setFilePath(path);
    console.log("File path:", path);

    // Mark upload as completed
    sessionStorage.setItem("upload_completed", "true");
    setFileUploaded(true);

    setShowRulesPopup(true);
  };

  const handleRulesAgreed = () => {
    setShowRulesPopup(false);
    navigate("/interview");
  };

  const handlePaymentComplete = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      let attempts = 0;
      let dbPaymentStatus = false;

      // Retry mechanism: Check payment status up to 5 times with a 1-second delay
      while (attempts < 5) {
        dbPaymentStatus = await readUserField(userId, "payment_completed");
        if (dbPaymentStatus) break;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
        attempts++;
      }

      if (dbPaymentStatus) {
        setpayment_completed(true);
        setShowPaymentPopup(false); // Hide the popup
      } else {
        console.warn("Payment not yet marked complete in DB after retries.");
        alert("Payment may take a few seconds to complete. Please refresh the page if needed.");
      }
    } catch (error) {
      console.error("Error verifying payment after completion:", error);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    alert("Payment failed. Please try again.");
  };

  const handlePaymentDismissed = () => {
    console.log("User dismissed the payment popup.");
    setShowPaymentPopup(false);
  };

  const handleSignOutConfirm = () => {
    setShowSignOutPopup(false);
    handleSignOut(logout, navigate, user?.userId);
  };
  
  const handleSignOutCancel = () => {
    setShowSignOutPopup(false);
    navigate("/feedback");
  };

  return (
    <MainLayout>
      <ActionBox>
        <SignOutPopup
          isOpen={showSignOutPopup}
          onConfirm={handleSignOutConfirm}
          onCancel={handleSignOutCancel}
        />
        <div className={`${styles.uploadContainer} customScroll`}>
          <div>
            <h1 className={styles.title}>
              Download your Chevening Application as a PDF file and upload it here before start interview.
            </h1>

            {payment_completed && <Uploader onUploadSuccess={handleUploadSuccess} />}

            {!payment_completed && showPaymentPopup && (
              <Price
                onPaymentComplete={handlePaymentComplete}
                onPaymentError={handlePaymentError}
                onPaymentDismissed={handlePaymentDismissed}
              />
            )}

            {showRulesPopup && (
              <div className={styles.paymentPopupOverlay}>
                <div className={styles.paymentPopup}>
                  <div className={styles.paymentPopupHeader}>
                    <h2 className={styles.h2}>Important: Interview Rules</h2>
                  </div>
                  <div className={`${styles.rulesContent} customScroll`}>
                    <ol className={styles.rulesList}>
                      <li>
                        * If you quit the interview before time is up, you'll be graded up to that point.
                      </li>
                      <li>
                        * This is a real-time voice AI platform. Press "Start Conversation" when you're ready.
                      </li>
                      <li>
                        * It may take up to ~10 secs to connect the AI interviewer.
                      </li>
                      <li>
                        * Wait patiently if the interviewer takes a few seconds to respond — that's normal.
                      </li>
                      <li>
                        * You can change the default audio device via the dropdown next to the mic.
                      </li>
                    </ol>
                    <div className={styles.rulesActions}>
                      <button className={styles.agreeButton} onClick={handleRulesAgreed}>
                        Agree and continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;

