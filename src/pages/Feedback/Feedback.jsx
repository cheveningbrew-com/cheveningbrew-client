import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import uploadStyles from "../Upload/Upload.module.css";
import { getUserId, getLatestCompletedEssay, checkDonationStatus } from "../../services/api";
import { isDonationPromoActive } from "../../utils/promoConfig";
import DonationPopup from "../../components/DonationPopup/DonationPopup";

const Feedback = () => {
  const [essayData, setEssayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationStatus, setDonationStatus] = useState(null);
  const [donationLoading, setDonationLoading] = useState(false);
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const navigate = useNavigate();

  // Check donation status for free attempts
  const checkUserDonationStatus = async (userId) => {
    try {
      setDonationLoading(true);
      const status = await checkDonationStatus(userId);
      setDonationStatus(status);
      console.log("Donation status:", status);
    } catch (error) {
      console.error("Error checking donation status:", error);
      // Default to allowing downloads if API fails
      setDonationStatus({ one_time_donation: false, recurring_donation: false, count_recurring_donation: 0 });
    } finally {
      setDonationLoading(false);
    }
  };

  // Fetch latest completed essay data
  useEffect(() => {
    const fetchLatestEssay = async () => {
      try {
        setLoading(true);
        const userId = getUserId();

        if (!userId) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await getLatestCompletedEssay(userId);

        if (response.success && response.essay_id) {
          // Map API response to component state
          const mappedData = {
            essay_id: response.essay_id,
            attempt_number: response.attempt_number,
            essay_filename: response.essay_filename,
            is_free_attempt: response.is_free_attempt,
            created_at: response.created_at,
            downloadLinkEssayFeedback: response.grading_docs,
            downloadLinkGrammarStyleDocument: response.grammar_style_docs,
            downloadLinkNarrativeFeedback: response.narrative_feedback_docs,
            analysisType: response.is_free_attempt
              ? (isDonationPromoActive() ? "donation_comprehensive_revival" : "leadership_comprehensive_revival")
              : "comprehensive_essay_revival"
          };

          setEssayData(mappedData);
          setError(null);

          // Check donation status if this is a free attempt
          if (mappedData.is_free_attempt && isDonationPromoActive()) {
            await checkUserDonationStatus(userId);
          }
        } else {
          setError("No completed essay analysis found. Please upload your essay first.");
        }
      } catch (err) {
        console.error("Error fetching latest essay:", err);
        if (err.message.includes("404") || err.message.includes("No completed essays found")) {
          setError("No essay analysis found. Please upload your essay first.");
        } else {
          setError("Failed to load essay analysis. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEssay();
  }, []);


  const handleUploadAnother = () => {
    navigate("/upload");
  };

  // Handle document download with donation logic
  const handleDownload = async (documentUrl, documentName, requiresDonationCheck = false) => {
    // If not free attempt or user has donated, download immediately
    if (!essayData.is_free_attempt || donationStatus?.one_time_donation) {
      window.open(documentUrl, '_blank');
      return;
    }

    // If requires donation check and user hasn't donated, show popup
    if (requiresDonationCheck && !donationStatus?.one_time_donation) {
      setPendingDownload({ url: documentUrl, name: documentName });
      setShowDonationPopup(true);
      return;
    }

    // First document or fallback - download immediately
    window.open(documentUrl, '_blank');
  };

  // Handle donation popup actions
  const handleDonationCancel = () => {
    setShowDonationPopup(false);
    // Still download the document
    if (pendingDownload) {
      window.open(pendingDownload.url, '_blank');
      setPendingDownload(null);
    }
  };

  const handleDonationConfirm = () => {
    setShowDonationPopup(false);
    // For now, just download the document
    // TODO: Integrate actual donation processing
    if (pendingDownload) {
      window.open(pendingDownload.url, '_blank');
      setPendingDownload(null);
    }
    console.log("User chose to donate - integrate payment processing here");
  };

  // Handle successful donation payment
  const handlePaymentSuccess = async (orderId) => {
    console.log("Donation payment successful:", orderId);

    // Refresh donation status
    const userId = getUserId();
    if (userId) {
      await checkUserDonationStatus(userId);
    }

    // Download the pending document
    if (pendingDownload) {
      window.open(pendingDownload.url, '_blank');
      setPendingDownload(null);
    }
  };

  // Handle donation payment errors
  const handlePaymentError = (error) => {
    console.error("Donation payment error:", error);

    // Still download the document even if payment fails
    if (pendingDownload) {
      window.open(pendingDownload.url, '_blank');
      setPendingDownload(null);
    }
  };


  if (loading) {
    return (
      <MainLayout>
        <ActionBox className={`${styles.actionBoxCustom} ${styles.loadingActionBox}`}>
          <div className={`${styles.mainContent} customScroll`}>
            <div className={styles.spinner}></div>
            <p>Loading your essay analysis...</p>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.mainContent} customScroll`}>
            <div className={styles.title}>No essay feedback available</div>
          <div className={uploadStyles.linkButtons}>
            <button
              className={`${uploadStyles.linkButton} ${uploadStyles.uploadButton}`}
              onClick={handleUploadAnother}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              Upload essay draft
            </button>
          </div>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.mainContent} customScroll`}>
          {/* Show essay analysis results */}
          {essayData ? (
            <>
              <div className={styles.title}>
                {essayData.analysisType === "leadership_comprehensive_revival"
                  ? "Download your complementary leadership essay review"
                  : essayData.analysisType === "donation_comprehensive_revival"
                    ? "Download your complimentary full essay review"
                    : "Download your full Chevening essay draft review"}
              </div>


              {/* Free User Donation Info */}
              {/* {essayData.is_free_attempt && donationStatus && !donationStatus.one_time_donation && (
                <div style={{
                  background: 'rgba(255, 229, 133, 0.1)',
                  border: '1px solid rgba(255, 229, 133, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  margin: '1rem 0',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    💝 <strong>First document is free!</strong> Additional documents will show a donation request to help support our free service.
                  </p>
                  <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    All documents will download regardless of your choice.
                  </small>
                </div>
              )} */}

              {/* Download Buttons */}
              <div className={uploadStyles.linkButtons} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        {/* Grammar & Style Download - Now also triggers donation prompt */}
                {essayData.downloadLinkGrammarStyleDocument && (
                  <button
                    onClick={() => handleDownload(
                      essayData.downloadLinkGrammarStyleDocument,
                      "Grammar and Style Feedback",
                      isDonationPromoActive() // First document requires donation check
                    )}
                    className={`${uploadStyles.linkButton} ${uploadStyles.downloadButton}`}
                    style={{ width: '100%' }}
                    disabled={donationLoading}
                  >
                    Download grammar and style feedback
                  </button>
                )}

                {/* Essay Feedback Download - Requires donation check for free users */}
                {essayData.downloadLinkEssayFeedback && (
                  <button
                    onClick={() => handleDownload(
                      essayData.downloadLinkEssayFeedback,
                      "Chevening Criteria Scoring",
                      isDonationPromoActive()// Second document requires donation check
                    )}
                    className={`${uploadStyles.linkButton} ${uploadStyles.feedbackButton}`}
                    style={{ width: '100%' }}
                    disabled={donationLoading}
                  >
                    Download Chevening criteria scoring
                  </button>
                )}

                {/* Narrative Feedback Download - Requires donation check for free users */}
                {essayData.downloadLinkNarrativeFeedback && (
                  <button
                    onClick={() => handleDownload(
                      essayData.downloadLinkNarrativeFeedback,
                      "Narrative Review",
                      isDonationPromoActive() // Third document requires donation check
                    )}
                    className={`${uploadStyles.linkButton} ${uploadStyles.narrativeFeedbackButton}`}
                    style={{ width: '100%' }}
                    disabled={donationLoading}
                  >
                    Download narrative review
                  </button>
                )}

                {!essayData.is_free_attempt && (
                  <p
                    style={{ textAlign: 'center' }}
                    className={uploadStyles.resetButton}
                    onClick={handleUploadAnother}
                  >
                    We have shared these files to your email via Google Drive as well.
                  </p>
                )}
              </div>

              {/*
                <div className={uploadStyles.nextStep}>
                  <p>Your analysis documents are ready for download.</p>

                  {analysisResults.analysisType === "leadership_comprehensive_revival" ? (
                    <div>
                      <p><strong>Free Trial Complete!</strong> You analyzed your leadership essay.</p>
                </p>}
              </div>

              {/*
                <div className={uploadStyles.nextStep}>
                  <p>Your analysis documents are ready for download.</p>

                  {analysisResults.analysisType === "leadership_comprehensive_revival" ? (
                    <div>
                      <p><strong>Free Trial Complete!</strong> You analyzed your leadership essay.</p>
                      <p>🏁 To analyze all 4 Chevening essays with full features, please subscribe to one of our plans.</p>
                  ) : analysisResults.analysisType === "donation_comprehensive_revival" ? (
                    <div>
                      <p><strong>Free Analysis Complete!</strong> You analyzed all four essays for free.</p>
                      <p>🏁 To get additional analysis rounds and full features, please subscribe to one of our plans.</p>
                      <button
                        className={styles.upgradeButton}
                        onClick={() => navigate("/pricing")}
                      >
                        View Subscription Plans
                      </button>
                    </div>
                  ) : (
                    <p><strong>Comprehensive Analysis Complete!</strong> All 4 essays analyzed with full features.</p>
                  )}

                  {analysisResults.fileName && (
                    <small>Original file: {analysisResults.fileName}</small>
                  )}
                  {analysisResults.timestamp && (
                    <small>
                      Analysis completed: {new Date(analysisResults.timestamp).toLocaleString()}
                    </small>
                  )}
                </div>
              */}

              {/* Analysis Summary */}
              {/*
                {analysisResults.analysisSummary && (
                  <div className={styles.summarySection}>
                    <h3>📊 Analysis Summary</h3>
                    <div className={styles.summaryContent}>
                      <p><strong>Analysis Type:</strong> {analysisResults.analysisType}</p>
                      <p><strong>Documents Created:</strong> {analysisResults.totalDocuments || 2}</p>
                      <p><strong>Database Saved:</strong> {analysisResults.databaseSaved ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}
              */}

              {/* Task Information (if available) */}
              {/*
                {analysisResults.taskId && (
                  <div className={styles.taskInfo}>
                    <h4>Background Processing Information:</h4>
                    <p><strong>Task ID:</strong> {analysisResults.taskId}</p>
                    <p><strong>Analysis Type:</strong> {analysisResults.analysisType}</p>
                  </div>
                )}
              */}
            </>
          ) : (
            /* No analysis available */
            <>
              <div className={styles.title}>Oops! Something went wrong</div>
              <p>No essay analysis found. Please upload your essay first.</p>

              <div className={uploadStyles.statusDisplay}>
                <h2>To get started:</h2>
                <ol>
                  <li>Go to the Upload page</li>
                  <li>Upload your Chevening application essays (PDF format)</li>
                  <li>Wait for background processing to complete (12-30 minutes)</li>
                  <li>Receive detailed writing style analysis and feedback</li>
                </ol>
              </div>

              <div className={uploadStyles.linkButtons}>
                <button
                  className={`${uploadStyles.linkButton} ${uploadStyles.uploadButton}`}
                  onClick={handleUploadAnother}
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  Upload New Essays
                </button>
              </div>
            </>
          )}

          {/* Donation Status Loading Indicator */}
          {donationLoading && essayData?.is_free_attempt && isDonationPromoActive() && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <div className={styles.spinner}></div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Checking donation status...
              </p>
            </div>
          )}
        </div>
      </ActionBox>

      {/* Donation Popup */}
      <DonationPopup
        isOpen={showDonationPopup}
        onCancel={handleDonationCancel}
        onDonate={handleDonationConfirm}
        documentName={pendingDownload?.name || "Document"}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </MainLayout>
  );
};

export default Feedback;