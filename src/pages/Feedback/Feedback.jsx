import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import uploadStyles from "../Upload/Upload.module.css";
import { getUserId, readUserField } from "../../services/api";
import { getTaskStatus, getMultipleTaskStatuses } from "../../services/essay_api";
import ReactMarkdown from "react-markdown";

const Feedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [pollingActive, setPollingActive] = useState(false);
  const navigate = useNavigate();

  // Fetch feedback and handle background tasks
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        
        // First, check for fresh analysis results from recent upload
        const freshResults = sessionStorage.getItem('latestAnalysisResults');
        if (freshResults) {
          const parsedResults = JSON.parse(freshResults);
          setAnalysisResults(parsedResults);
          
          // Check if there are pending tasks
          const taskIds = parsedResults.taskIds;
          if (taskIds && (taskIds.feedbackTaskId || taskIds.analysisTaskId)) {
            await checkPendingTasks(taskIds);
          } else {
            setLoading(false);
          }
          return;
        }

        // Check for cached feedback in sessionStorage
        const cachedFeedback = sessionStorage.getItem('cachedFeedback');
        if (cachedFeedback) {
          try {
            const parsed = JSON.parse(cachedFeedback);
            setFeedback(parsed);
            setLoading(false);
            return;
          } catch (parseError) {
            console.warn("Failed to parse cached feedback:", parseError);
          }
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

  // Check status of pending background tasks
  const checkPendingTasks = async (taskIds) => {
    try {
      setPollingActive(true);
      const taskIdList = Object.values(taskIds).filter(Boolean);
      
      if (taskIdList.length === 0) {
        setLoading(false);
        return;
      }

      // Check initial status
      const statuses = await getMultipleTaskStatuses(taskIdList);
      setTaskStatuses(statuses);

      // Check if all tasks are completed
      const allCompleted = statuses.every(status => 
        status.status === 'COMPLETED' || status.status === 'ERROR'
      );

      if (allCompleted) {
        setPollingActive(false);
        setLoading(false);
        return;
      }

      // Start polling for incomplete tasks
      const pollInterval = setInterval(async () => {
        try {
          const updatedStatuses = await getMultipleTaskStatuses(taskIdList);
          setTaskStatuses(updatedStatuses);

          const stillProcessing = updatedStatuses.some(status => 
            !['COMPLETED', 'ERROR', 'FAILED'].includes(status.status)
          );

          if (!stillProcessing) {
            clearInterval(pollInterval);
            setPollingActive(false);
            setLoading(false);
            
            // Update analysis results with completed task data
            updateAnalysisWithTaskResults(updatedStatuses);
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
      console.error("Error checking pending tasks:", error);
      setPollingActive(false);
      setLoading(false);
    }
  };

  // Update analysis results with completed task data
  const updateAnalysisWithTaskResults = (taskStatuses) => {
    const completedTasks = taskStatuses.filter(task => task.status === 'COMPLETED');
    
    if (completedTasks.length > 0) {
      setAnalysisResults(prevResults => {
        const updatedResults = { ...prevResults };
        
        completedTasks.forEach(task => {
          if (task.result) {
            // Update with new Google Drive links if available
            if (task.result.google_docs_link) {
              if (task.task_id === prevResults.taskIds?.feedbackTaskId) {
                updatedResults.essayFeedback = task.result.google_docs_link;
              } else if (task.task_id === prevResults.taskIds?.analysisTaskId) {
                updatedResults.googleDocs = task.result.google_docs_link;
              }
            }
          }
        });
        
        return updatedResults;
      });
    }
  };

  const handleUploadAnother = () => {
    // Clear current analysis data
    sessionStorage.removeItem('latestAnalysisResults');
    navigate("/upload");
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
          <div className={`${styles.feedbackContent} customScroll`}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <h3>🎓 Processing Your Essay Analysis</h3>
              
              {pollingActive && taskStatuses.length > 0 && (
                <div className={styles.taskStatusContainer}>
                  <h4>Background Tasks Status:</h4>
                  {taskStatuses.map((task, index) => {
                    const statusDisplay = getTaskStatusDisplay(task.status);
                    return (
                      <div key={task.task_id || index} className={styles.taskStatusItem}>
                        <span className={styles.taskEmoji}>{statusDisplay.emoji}</span>
                        <div className={styles.taskDetails}>
                          <p className={styles.taskStatus}>{statusDisplay.text}</p>
                          {task.meta?.status && (
                            <small className={styles.taskMeta}>{task.meta.status}</small>
                          )}
                          {task.meta?.step && (
                            <small className={styles.taskStep}>{task.meta.step}</small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className={styles.estimatedTime}>
                    <small>⏱️ This may take 15-25 minutes for comprehensive analysis</small>
                  </div>
                </div>
              )}
              
              {!pollingActive && (
                <p>Loading your essay analysis...</p>
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
          <div className={`${styles.feedbackContent} customScroll`}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              <button
                className={styles.uploadButton}
                onClick={handleUploadAnother}
              >
                Upload New Essays
              </button>
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
                      ✏️ Grammar & Style Analysis
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
                    {analysisResults.fileName && (
                      <small>Original file: {analysisResults.fileName}</small>
                    )}
                    {analysisResults.timestamp && (
                      <small>
                        Analysis completed: {new Date(analysisResults.timestamp).toLocaleString()}
                      </small>
                    )}
                  </div>

                  {/* Task Information (if available) */}
                  {analysisResults.taskIds && (
                    <div className={styles.taskInfo}>
                      <h4>Background Processing Information:</h4>
                      {analysisResults.taskIds.feedbackTaskId && (
                        <p><strong>Essay Feedback Task:</strong> {analysisResults.taskIds.feedbackTaskId}</p>
                      )}
                      {analysisResults.taskIds.analysisTaskId && (
                        <p><strong>Grammar Analysis Task:</strong> {analysisResults.taskIds.analysisTaskId}</p>
                      )}
                    </div>
                  )}
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
                    <li>Wait for background processing to complete (15-25 minutes)</li>
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