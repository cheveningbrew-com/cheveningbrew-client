import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./TryFeedback.module.css";
import uploadStyles from "../Upload/Upload.module.css";
import { getTaskStatus } from "../../services/essay_api";
import { useAuth } from "../../context/AuthContext";

const TryFeedback = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);
  const { userName, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and load analysis results
  useEffect(() => {
    if (!userName) {
      navigate("/");
      return;
    }

    const fetchAnalysisResults = async () => {
      try {
        setLoading(true);
        
        // Check for fresh analysis results from recent upload
        const freshResults = sessionStorage.getItem('tryAnalysisResults');
        if (freshResults) {
          const parsedResults = JSON.parse(freshResults);
          setAnalysisResults(parsedResults);
          
          // Check if there's a pending task
          if (parsedResults.taskId) {
            await checkPendingTask(parsedResults.taskId);
          } else {
            setLoading(false);
          }
          return;
        }

        // If no analysis results available, show message
        setError("No analysis found. Please upload a PDF first in the Try Upload section.");
        setLoading(false);

      } catch (err) {
        console.error("Error loading analysis results:", err);
        setError("Failed to load analysis results. Please try again.");
        setLoading(false);
      }
    };

    fetchAnalysisResults();
  }, [userName, navigate]);

  // Check status of pending background task
  const checkPendingTask = async (taskId) => {
    try {
      setPollingActive(true);
      
      // Check initial status
      const status = await getTaskStatus(taskId);
      setTaskStatus(status);

      // Check if task is completed
      if (['COMPLETED', 'ERROR', 'FAILED'].includes(status.status)) {
        setPollingActive(false);
        setLoading(false);
        
        if (status.status === 'COMPLETED' && status.result) {
          // Update analysis results with completed task data
          updateAnalysisWithTaskResult(status.result);
        }
        return;
      }

      // Start polling for incomplete task
      const pollInterval = setInterval(async () => {
        try {
          const updatedStatus = await getTaskStatus(taskId);
          setTaskStatus(updatedStatus);

          if (['COMPLETED', 'ERROR', 'FAILED'].includes(updatedStatus.status)) {
            clearInterval(pollInterval);
            setPollingActive(false);
            setLoading(false);
            
            if (updatedStatus.status === 'COMPLETED' && updatedStatus.result) {
              updateAnalysisWithTaskResult(updatedStatus.result);
            }
          }
        } catch (error) {
          console.error("Error polling task status:", error);
          clearInterval(pollInterval);
          setPollingActive(false);
          setLoading(false);
        }
      }, 3000);

      // Cleanup interval on component unmount
      return () => {
        clearInterval(pollInterval);
        setPollingActive(false);
      };

    } catch (error) {
      console.error("Error checking pending task:", error);
      setPollingActive(false);
      setLoading(false);
    }
  };

  // Update analysis results with completed task data
  const updateAnalysisWithTaskResult = (taskResult) => {
    setAnalysisResults(prevResults => {
      const updatedResults = { ...prevResults };
      
      // Update with new Google Drive links if available
      if (taskResult.google_docs_link) {
        updatedResults.googleDocs = taskResult.google_docs_link;
      }
      if (taskResult.google_drive_link) {
        updatedResults.googleDrive = taskResult.google_drive_link;
      }
      if (taskResult.download_link) {
        updatedResults.downloadLink = taskResult.download_link;
      }
      if (taskResult.analysis_summary) {
        updatedResults.analysisSummary = taskResult.analysis_summary;
      }
      
      // Update sessionStorage with new results
      sessionStorage.setItem('tryAnalysisResults', JSON.stringify(updatedResults));
      
      return updatedResults;
    });
  };

  const handleUploadAnother = () => {
    // Clear current analysis data
    sessionStorage.removeItem('tryAnalysisResults');
    navigate("/try-upload");
  };

  const getTaskStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': { emoji: '⏳', text: 'Waiting in queue' },
      'PROCESSING': { emoji: '🔄', text: 'Processing' },
      'ANALYZING': { emoji: '🧠', text: 'AI Analysis in progress' },
      'GENERATING': { emoji: '📝', text: 'Creating document' },
      'FINALIZING': { emoji: '☁️', text: 'Uploading to Google Drive' },
      'COMPLETED': { emoji: '✅', text: 'Completed' },
      'FAILED': { emoji: '❌', text: 'Failed' },
      'ERROR': { emoji: '⚠️', text: 'Error' }
    };
    
    return statusMap[status] || { emoji: '📋', text: status };
  };

  if (loading) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.tryFeedbackContainer} customScroll`}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <h3>👑 Processing Leadership Grammar Analysis</h3>
              
              {pollingActive && taskStatus && (
                <div className={styles.taskStatusContainer}>
                  <h4>Analysis Status:</h4>
                  <div className={styles.taskStatusItem}>
                    <span className={styles.taskEmoji}>
                      {getTaskStatusDisplay(taskStatus.status).emoji}
                    </span>
                    <div className={styles.taskDetails}>
                      <p className={styles.taskStatus}>
                        {getTaskStatusDisplay(taskStatus.status).text}
                      </p>
                      {taskStatus.meta?.status && (
                        <small className={styles.taskMeta}>{taskStatus.meta.status}</small>
                      )}
                      {taskStatus.meta?.step && (
                        <small className={styles.taskStep}>{taskStatus.meta.step}</small>
                      )}
                    </div>
                  </div>
                  <div className={styles.estimatedTime}>
                    <small>⏱️ This may take 5-8 minutes for grammar analysis</small>
                  </div>
                </div>
              )}
              
              {!pollingActive && (
                <p>Loading your analysis results...</p>
              )}
            </div>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.tryFeedbackContainer} customScroll`}>
            <div className={styles.errorContainer}>
              <h2 className={styles.errorTitle}>❌ No Analysis Found</h2>
              <div className={styles.errorMessage}>{error}</div>
              <div className={styles.errorActions}>
                <button
                  className={styles.uploadButton}
                  onClick={handleUploadAnother}
                >
                  Go to Try Upload
                </button>
              </div>
            </div>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.feedbackWrapper}>
        <ActionBox>
          <div className={`${styles.tryFeedbackContainer} customScroll`}>
            <div className={styles.title}>Leadership Grammar Analysis Results</div>
            
            {/* Show analysis results */}
            {analysisResults && (
              <div className={uploadStyles.uploadSection}>
                <div className={uploadStyles.linksContainer}>
                  <h2 className={uploadStyles.linksTitle}>✅ Grammar Analysis Complete!</h2>
                  
                  <div className={uploadStyles.linkButtons}>
                    <a 
                      href={analysisResults.googleDocs} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${uploadStyles.linkButton} ${uploadStyles.docsButton}`}
                    >
                      ✏️ Edit in Google Docs
                    </a>
                    
                    <a 
                      href={analysisResults.googleDrive} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${uploadStyles.linkButton} ${uploadStyles.driveButton}`}
                    >
                      📁 View in Google Drive
                    </a>
                    
                    {analysisResults.downloadLink && (
                      <a 
                        href={analysisResults.downloadLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${uploadStyles.linkButton} ${uploadStyles.downloadButton}`}
                      >
                        ⬇️ Download DOCX
                      </a>
                    )}
                  </div>
                  
                  <button 
                    className={uploadStyles.resetButton} 
                    onClick={handleUploadAnother}
                  >
                    Try Another Upload
                  </button>

                  <div className={uploadStyles.nextStep}>
                    <p>Your grammar analysis is available through the links above.</p>
                    {analysisResults.fileName && (
                      <small>Original file: {analysisResults.fileName}</small>
                    )}
                    {analysisResults.timestamp && (
                      <small>
                        Analysis completed: {new Date(analysisResults.timestamp).toLocaleString()}
                      </small>
                    )}
                  </div>

                  {/* Analysis Summary */}
                  {analysisResults.analysisSummary && (
                    <div className={styles.summarySection}>
                      <h3>📊 Analysis Summary</h3>
                      <div className={styles.summaryContent}>
                        <p><strong>Essay Type:</strong> {analysisResults.essayType || 'Leadership Essay'}</p>
                        {analysisResults.analysisSummary.total_grammar_issues !== undefined && (
                          <p><strong>Grammar Issues Found:</strong> {analysisResults.analysisSummary.total_grammar_issues}</p>
                        )}
                        {analysisResults.analysisSummary.word_count && (
                          <p><strong>Word Count:</strong> {analysisResults.analysisSummary.word_count}</p>
                        )}
                        {analysisResults.analysisSummary.key_issues && (
                          <div>
                            <p><strong>Key Areas for Improvement:</strong></p>
                            <ul className={styles.issuesList}>
                              {analysisResults.analysisSummary.key_issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Task Information (if available) */}
                  {analysisResults.taskId && (
                    <div className={styles.taskInfo}>
                      <h4>Background Processing Information:</h4>
                      <p><strong>Task ID:</strong> {analysisResults.taskId}</p>
                      <p><strong>Directory:</strong> {analysisResults.directoryName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ActionBox>
      </div>
    </MainLayout>
  );
};

export default TryFeedback;