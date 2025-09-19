import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import uploadStyles from "../Upload/Upload.module.css";
import { getUserId, getLatestCompletedEssay } from "../../services/api";
import { isDonationPromoActive } from "../../utils/promoConfig";

const Feedback = () => {
  const [essayData, setEssayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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


              {/* Download Buttons */}
              <div className={uploadStyles.linkButtons} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                {/* Grammar & Style Download */}
                {essayData.downloadLinkGrammarStyleDocument && (
                  <a
                    href={essayData.downloadLinkGrammarStyleDocument}
                    className={`${uploadStyles.linkButton} ${uploadStyles.downloadButton}`}
                    download
                    style={{ width: '100%' }}
                  >
                    Download grammar and style feedback
                  </a>
                )}

                {/* Essay Feedback Download */}
                {essayData.downloadLinkEssayFeedback && (
                  <a
                    href={essayData.downloadLinkEssayFeedback}
                    className={`${uploadStyles.linkButton} ${uploadStyles.feedbackButton}`}
                    download
                    style={{ width: '100%' }}
                  >
                    Download Chevening criteria scoring
                  </a>
                )}


                {/* Narrative Feedback Download */}
                {essayData.downloadLinkNarrativeFeedback && (
                  <a
                    href={essayData.downloadLinkNarrativeFeedback}
                    className={`${uploadStyles.linkButton} ${uploadStyles.narrativeFeedbackButton}`}
                    download
                    style={{ width: '100%' }}
                  >
                    Download narrative review
                  </a>
                )}

                <p
                  style={{ textAlign: 'center' }}
                  className={uploadStyles.resetButton}
                  onClick={handleUploadAnother}
                >
                  We have shared these files to your email via Google Drive as well.
                </p>
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
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Feedback;