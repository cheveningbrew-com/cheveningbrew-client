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
      
      // Handle comprehensive analysis result structure
      if (taskResult.summary) {
        // Update with new Google Drive links from comprehensive analysis
        if (taskResult.summary.assessment_document?.google_docs_link) {
          updatedResults.essayFeedback = taskResult.summary.assessment_document.google_docs_link;
        }
        if (taskResult.summary.grammar_style_document?.google_docs_link) {
          updatedResults.googleDocs = taskResult.summary.grammar_style_document.google_docs_link;
        }
        if (taskResult.summary.grammar_style_document?.google_drive_link) {
          updatedResults.googleDrive = taskResult.summary.grammar_style_document.google_drive_link;
        }
        if (taskResult.summary.grammar_style_document?.download_link) {
          updatedResults.downloadLink = taskResult.summary.grammar_style_document.download_link;
        }
        
        // Update analysis summary
        updatedResults.analysisSummary = taskResult.summary;
        updatedResults.totalDocuments = taskResult.summary.total_documents_created || 2;
        updatedResults.databaseSaved = taskResult.summary.database_saved || false;
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
      'GENERATING': { emoji: '📝', text: 'Creating documents' },
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
              <h3>👑 Processing Comprehensive Leadership Analysis</h3>
              
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
                    <small>⏱️ This may take 12-15 minutes for comprehensive leadership analysis</small>
                    <small>📊 Creating 2 documents: Assessment + Grammar Analysis</small>
                  </div>
                </div>
              )}
              
              {!pollingActive && (
                <p>Loading your comprehensive analysis results...</p>
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
            <div className={styles.title}>Comprehensive Leadership Analysis Results</div>
            
            {/* Show comprehensive analysis results */}
            {analysisResults && (
              <div className={uploadStyles.uploadSection}>
                <div className={uploadStyles.linksContainer}>
                  <h2 className={uploadStyles.linksTitle}>✅ Comprehensive Analysis Complete!</h2>
                  
                  {/* Analysis Documents */}
                  <div className={uploadStyles.linkButtons}>
                    {/* Essay Feedback Document */}
                    {analysisResults.essayFeedback && (
                      <a 
                        href={analysisResults.essayFeedback} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${uploadStyles.linkButton} ${uploadStyles.feedbackButton}`}
                      >
                        👑 Leadership Essay Assessment
                      </a>
                    )}
                    
                    {/* Grammar & Style Document */}
                    {analysisResults.googleDocs && (
                      <a 
                        href={analysisResults.googleDocs} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${uploadStyles.linkButton} ${uploadStyles.docsButton}`}
                      >
                        ✏️ Grammar & Style Analysis
                      </a>
                    )}
                    
                    {/* Additional Links */}
                    {analysisResults.googleDrive && (
                      <a 
                        href={analysisResults.googleDrive} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${uploadStyles.linkButton} ${uploadStyles.driveButton}`}
                      >
                        📁 View in Google Drive
                      </a>
                    )}
                    
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
                    <p>Your comprehensive leadership analysis is available through the links above.</p>
                    <p><strong>Two documents created:</strong></p>
                    <ul>
                      <li>🎯 <strong>Leadership Essay Assessment</strong> - Chevening criteria aligned feedback</li>
                      <li>📝 <strong>Grammar & Style Analysis</strong> - DOCX with Word comments for improvements</li>
                    </ul>
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
                        <p><strong>Analysis Type:</strong> {analysisResults.analysisType || 'Leadership Comprehensive Analysis'}</p>
                        <p><strong>Documents Created:</strong> {analysisResults.totalDocuments || 2}</p>
                        <p><strong>Database Saved:</strong> {analysisResults.databaseSaved ? 'Yes' : 'No'}</p>
                        
                        {/* Show specific analysis details if available */}
                        {analysisResults.analysisSummary.assessment_summary && (
                          <div>
                            <p><strong>Assessment Summary:</strong></p>
                            <div className={styles.issuesList}>
                              {Object.entries(analysisResults.analysisSummary.assessment_summary).map(([key, value]) => (
                                <p key={key}><strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {analysisResults.analysisSummary.grammar_summary && (
                          <div>
                            <p><strong>Grammar Analysis Summary:</strong></p>
                            <div className={styles.issuesList}>
                              {Object.entries(analysisResults.analysisSummary.grammar_summary).map(([key, value]) => (
                                <p key={key}><strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Free Trial Used Notice */}
                  <div className={styles.freeTrialNotice}>
                    <h4>🎯 Free Trial Complete!</h4>
                    <p>You've successfully used your free comprehensive leadership analysis.</p>
                    <p>To analyze all 4 Chevening essays with full features, please subscribe to one of our plans.</p>
                    <button 
                      className={styles.upgradeButton}
                      onClick={() => navigate("/pricing")}
                    >
                      View Subscription Plans
                    </button>
                  </div>

                  {/* Task Information (if available) */}
                  {analysisResults.taskId && (
                    <div className={styles.taskInfo}>
                      <h4>Background Processing Information:</h4>
                      <p><strong>Task ID:</strong> {analysisResults.taskId}</p>
                      <p><strong>Directory:</strong> {analysisResults.directoryName}</p>
                      <p><strong>Analysis Type:</strong> Leadership Comprehensive Revival</p>
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