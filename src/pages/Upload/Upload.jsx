import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import Uploader from "../../components/Uploader/Uploader";
import PaymentBox from "../../components/PaymentBox/PaymentBox";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [filePath, setFilePath] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has already paid (from sessionStorage)
    const hasUserPaid = sessionStorage.getItem("paymentCompleted") === "true";

    if (!hasUserPaid) {
      // Show payment popup if user hasn't paid
      setShowPaymentPopup(true);
    } else {
      // User has already paid
      setPaymentCompleted(true);
    }
  }, []);

  const handleUploadSuccess = (path) => {
    setFilePath(path);
    console.log("File path:", path);

    // Show rules popup instead of navigating immediately
    setShowRulesPopup(true);
  };

  const handleRulesAgreed = () => {
    setShowRulesPopup(false);
    // Navigate to Interview page after agreement
    navigate("/interview");
  };


  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setShowPaymentPopup(false);
  };

  const handlePaymentError = (error) => {
    // Just handle UI implications of payment errors
    alert("There was an error with the payment. Please try again.");
  };

  const handlePaymentDismissed = () => {
    // Just handle UI implications of payment dismissal
    console.log("Payment dismissed by user");
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={styles.uploadContainer}>
          <h1 className={styles.title}>
            Download your Chevening Application as a PDF file and upload it
            here.
          </h1>

          {paymentCompleted ? (
            <Uploader onUploadSuccess={handleUploadSuccess} />
          ) : (
            showPaymentPopup && (
              <div className={styles.paymentPopupOverlay}>
                <div className={styles.paymentPopup}>
                  <div className={styles.paymentPopupHeader}>
                    <h2 className={styles.h2}>One-time payment required</h2>
                  </div>
                  <div className={styles.pricingContent}>
                    <div className={styles.pricingCard}>
                      <p className={styles.pricingText}>Access the app by paying a one-time fee of $5 for a 20 min interview</p>
                    </div>
                  </div>

                  <PaymentBox
                    onPaymentComplete={handlePaymentComplete}
                    onPaymentError={handlePaymentError}
                    onPaymentDismissed={handlePaymentDismissed}
                  />
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
                <div className={styles.rulesContent}>
                  <ol className={styles.rulesList}>
                    <li>* If you quit the interview prematurely before the time is up, you will be graded up to the completion and feedback will be based on that.</li>
                    <li>* This is a real-time voice AI platform, so you simply have to have a conversation. Press "Start Conversation" when you are ready.</li>
                    <li>* It will take up to ~10 secs for the AI interviewer to connect with you upon pressing "Start Conversation".</li>
                    <li>* Wait if the interviewer is taking some time (couple of seconds) to respond. This is normal.</li>
                    <li>* If you want to change the default audio device, use the dropdown next to the mic.</li>
                  </ol>
                </div>
                <div className={styles.rulesActions}>
                  <button
                    className={styles.agreeButton}
                    onClick={handleRulesAgreed}
                  >
                    Agree and continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;