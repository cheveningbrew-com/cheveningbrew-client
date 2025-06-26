import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import uploadStyles from "../Upload/Upload.module.css"; // Import upload styles
import { getUserId, readUserField } from "../../services/api";
import ReactMarkdown from "react-markdown";

const Feedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch essay analysis feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // First, check for fresh analysis results from recent upload
        const freshResults = sessionStorage.getItem('latestAnalysisResults');
        if (freshResults) {
          const parsedResults = JSON.parse(freshResults);
          setAnalysisResults(parsedResults);
          setLoading(false);
          
          return;
        }

        // If no feedback available, show message
        setError("No essay analysis found. Please upload your essay first.");
        setLoading(false);

      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load essay analysis. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const handleUploadAnother = () => {
    navigate("/upload");
  };

  if (loading) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
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
          <div className={`${styles.feedbackContent} customScroll`}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.feedbackWrapper}>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <div className={styles.title}>Essay Analysis Results</div>
            
            {/* Show analysis results with upload styling */}
            {analysisResults ? (
              <div className={uploadStyles.uploadSection}>
                <div className={uploadStyles.linksContainer}>
                  <h2 className={uploadStyles.linksTitle}>Your Analysis is Ready!</h2>
                  
                  <div className={uploadStyles.linkButtons}>
                    <a 
                      href={analysisResults.essayFeedback} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${uploadStyles.linkButton} ${uploadStyles.feedbackButton}`}
                    >
                      📝 View Essay Feedback
                    </a>
                    
                    <a 
                      href={analysisResults.googleDocs} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${uploadStyles.linkButton} ${uploadStyles.docsButton}`}
                    >
                      ✏️ Hemingway Analysis
                    </a>
                  </div>
                  
                  <button 
                    className={uploadStyles.resetButton} 
                    onClick={handleUploadAnother}
                  >
                    Upload Another Document
                  </button>

                  <div className={uploadStyles.nextStep}>
                    <p>Your analysis documents are available anytime through the links above.</p>
                  </div>
                </div>
              </div>
            ) : feedback ? (
              /* Fall back to old feedback display */
              <div className={styles.markdownContent}>
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            ) : (
              /* No analysis available */
              <div className={styles.feedbackSections}>
                <p>No essay analysis available. Please upload your Chevening essays to receive detailed feedback and analysis.</p>
                <div className={styles.uploadPrompt}>
                  <h3>To get started:</h3>
                  <ol>
                    <li>Go to the Upload page</li>
                    <li>Upload your Chevening application essays (PDF format)</li>
                    <li>Receive detailed writing style analysis and feedback</li>
                  </ol>
                  <button 
                    className={styles.uploadButton}
                    onClick={handleUploadAnother}
                  >
                    Go to Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </ActionBox>
      </div>
    </MainLayout>
  );
};

export default Feedback;