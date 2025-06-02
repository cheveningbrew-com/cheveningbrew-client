import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import Uploader from "../../components/Uploader/Uploader";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";
// Remove auth-related imports
import Price from "../../components/PricePopUp/Price";

const Upload = () => {
  const [_, setFilePath] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [payment_completed, setPaymentCompleted] = useState(true); // Set to true to bypass payment
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const navigate = useNavigate();
  const [fileUploaded, setFileUploaded] = useState(false);

  // Simplified upload success handler
  const handleUploadSuccess = (path) => {
    setFilePath(path);
    console.log("File path:", path);
    
    // Mark upload as completed
    sessionStorage.setItem("upload_completed", "true");
    setFileUploaded(true);
    
    // Navigate directly to feedback (skip interview)
    navigate("/feedback");
  };

  // Simplified payment handler
  const handlePaymentComplete = async () => {
    setPaymentCompleted(true);
    setShowPaymentPopup(false);
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.uploadContainer} customScroll`}>
          <div>
            <h1 className={styles.title}>
              Download your Chevening Application as a PDF file and upload it here before start interview.
            </h1>

            <Uploader onUploadSuccess={handleUploadSuccess} />

            {!payment_completed && showPaymentPopup && (
              <Price
                onPaymentComplete={handlePaymentComplete}
                onPaymentError={() => {}}
                onPaymentDismissed={() => setShowPaymentPopup(false)}
              />
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;