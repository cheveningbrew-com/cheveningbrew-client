import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import Uploader from "../../components/Uploader/Uploader";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";
import { readUserField, getUserId } from "../../services/api";
import Price from "../../components/Price_Popup/Price";


const Upload = () => {
  const [_, setFilePath] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [payment_completed, setpayment_completed] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const user_id = getUserId();
      if (!user_id) {
        navigate("/");
        return;
      }
  
      try {
        const dbPaymentStatus = await readUserField(user_id, "payment_completed");
  
        if (!dbPaymentStatus) {
          setShowPaymentPopup(true);
        } else {
          setpayment_completed(true);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setShowPaymentPopup(true); // fallback: show popup if unsure
      } finally {
        setIsLoading(false);
      }
    };
  
    checkPaymentStatus();
  }, []);
  

  const handleUploadSuccess = (path) => {
    setFilePath(path);
    console.log("File path:", path);
    setShowRulesPopup(true);
  };

  const handleRulesAgreed = () => {
    setShowRulesPopup(false);
    navigate("/interview");
  };

  const handlePaymentComplete = async () => {
    try {
      const user_id = getUserId();
      if (!user_id) return;
  
      // Re-check the backend after payment
      const dbPaymentStatus = await readUserField(user_id, "payment_completed");
  
      if (dbPaymentStatus) {
        setpayment_completed(true);
        setShowPaymentPopup(false);
      } else {
        console.warn("Payment not yet marked complete in DB.");
        alert("Please wait a few seconds and try again.");
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

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.uploadContainer} customScroll`}>
          <div>
            <h1 className={styles.title}>
              Download your Chevening Application as a PDF file and upload it here.
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
                        * Wait patiently if the interviewer takes a few seconds to respond — that’s normal.
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
