import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import Uploader from "../../components/Uploader/Uploader";
import PaymentBox from "../../components/PaymentBox/PaymentBox";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";
import { readUserField ,getUserEmail} from "../../services/api";

const Upload = () => {
  const [_, setFilePath] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [payment_completed, setpayment_completed] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const userEmail = getUserEmail();
      if (!userEmail) {
        navigate("/");
        return;
      }

      try {
        // Check payment status from database
        const dbPaymentStatus = await readUserField(userEmail, "payment_completed");
        
        // Use database status if available, otherwise fallback to sessionStorage
        const hasUserPaid = dbPaymentStatus;

        if (!hasUserPaid) {
          setShowPaymentPopup(true);
        } else {
          setpayment_completed(true);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Fallback to sessionStorage if database check fails
        const hasUserPaid = sessionStorage.getItem("payment_completed") === "true";
        setpayment_completed(hasUserPaid);
        if (!hasUserPaid) {
          setShowPaymentPopup(true);
        }
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

  const handlePaymentComplete = () => {
    setpayment_completed(true);
    setShowPaymentPopup(false);
  };

  const handlePaymentError = () => {
    alert("There was an error with the payment. Please try again.");
  };

  const handlePaymentDismissed = () => {
    console.log("Payment dismissed by user");
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.uploadContainer} customScroll`}>
          <div>
            <h1 className={styles.title}>
              Download your Chevening Application as a PDF file and upload it here.
            </h1>

            {payment_completed ? (
              <Uploader onUploadSuccess={handleUploadSuccess} />
            ) : (
              showPaymentPopup && (
                <div className={styles.paymentPopupOverlay}>
                  <div className={styles.paymentPopup}>
                    <div className={styles.paymentPopupHeader}>
                      <h2 className={styles.h2}>One-time payment required</h2>
                    </div>
                    <div className={`${styles.pricingContent} customScroll`}>
                      <div className={styles.pricingCard}>
                        <p className={styles.pricingText}>
                          Access the app by paying a one-time fee of $5 for a 20 min interview
                        </p>
                      </div>
                      <PaymentBox
                        onPaymentComplete={handlePaymentComplete}
                        onPaymentError={handlePaymentError}
                        onPaymentDismissed={handlePaymentDismissed}
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {showRulesPopup && (
              <div className={styles.paymentPopupOverlay}>
                <div className={styles.paymentPopup}>
                  <div className={styles.paymentPopupHeader}>
                    <h2 className={styles.h2}>Important: interview rules</h2>
                  </div>
                  <div className={`${styles.rulesContent} customScroll`}>
                    <ol className={styles.rulesList}>
                      <li>
                        * If you quit the interview prematurely before the time is up, you will be graded up to the completion and feedback will be based on that.
                      </li>
                      <li>
                        * This is a real-time voice AI platform, so you simply have to have a conversation. Press "Start Conversation" when you are ready.
                      </li>
                      <li>
                        * It will take up to ~10 secs for the AI interviewer to connect with you upon pressing "Start Conversation".
                      </li>
                      <li>
                        * Wait if the interviewer is taking some time (couple of seconds) to respond. This is normal.
                      </li>
                      <li>
                        * If you want to change the default audio device, use the dropdown next to the mic.
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
