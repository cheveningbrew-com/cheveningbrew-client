import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import uploadStyles from "../Upload/Upload.module.css";
import { getUserId } from "../../services/api";
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
        
        // Check for fresh analysis results from recent upload
        const freshResults = sessionStorage.getItem('latestAnalysisResults');
        if (freshResults) {
          const parsedResults = JSON.parse(freshResults);
          setAnalysisResults(parsedResults);
          
          // Check if there are pending tasks
          const taskIds = parsedResults.taskIds || [parsedResults.taskId].filter(Boolean);
          if (taskIds.length > 0) {
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
      
      if (taskIds.length === 0) {
        setLoading(false);
        return;
      }

      // Check initial status
      const statuses = await getMultipleTaskStatuses(taskIds);
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
          const updatedStatuses = await getMultipleTaskStatuses(taskIds);
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
            
            // Handle comprehensive result structure
            if (task.result.summary) {
              if (task.result.summary.assessment_document?.google_docs_link) {
                updatedResults.essayFeedback = task.result.summary.assessment_document.google_docs_link;
              }
              if (task.result.summary.grammar_style_document?.google_docs_link) {
                updatedResults.googleDocs = task.result.summary.grammar_style_document.google_docs_link;
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

  // Determine analysis type for display
  const getAnalysisTypeDisplay = () => {
    if (!analysisResults) return "Essay Analysis";
    
    if (analysisResults.analysisType === "leadership_comprehensive_revival") {
      return "Leadership Essay Analysis (Free Trial)";
    } else if (analysisResults.analysisType === "comprehensive_essay_revival") {
      return "Comprehensive Essay Analysis";
    } else {
      return "Essay Analysis";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <ActionBox className="customScroll">
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <div className={styles.title}>🎓 Processing Your Essay Analysis</div>
            
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
                  <small>⏱️ This may take 12-30 minutes depending on analysis type</small>
                </div>
              </div>
            )}
            
            {!pollingActive && (
              <p>Loading your essay analysis...</p>
            )}
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ActionBox className="customScroll">
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
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.feedbackWrapper}>
        <ActionBox className="customScroll">
            {/* Show analysis results */}
            {analysisResults ? (
              <>
                <div className={styles.title}>
                  {analysisResults.analysisType === "leadership_comprehensive_revival" 
                    ? "Download your complementary leadership essay review" 
                    : "Download your full Chevening essay draft review"}
                </div>
                
                {/* Updated: Simple Download Buttons */}
                <div className={uploadStyles.linkButtons} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                  {/* Grammar & Style Download */}
                  {analysisResults.downloadLinkGrammarStyleDocument && (
                    <a 
                      href={analysisResults.downloadLinkGrammarStyleDocument} 
                      className={`${uploadStyles.linkButton} ${uploadStyles.downloadButton}`}
                      download
                      style={{ width: '100%' }}
                    >
                      Download grammar and style feedback
                    </a>
                  )}
                  
                  {/* Essay Feedback Download */}
                  {analysisResults.downloadLinkEssayFeedback && (
                    <a 
                      href={analysisResults.downloadLinkEssayFeedback} 
                      className={`${uploadStyles.linkButton} ${uploadStyles.feedbackButton}`}
                      download
                      style={{ width: '100%' }}
                    >
                      Download Chevening aligned feedback
                    </a>
                  )}


                  {/* Narrative Feedback Download */}
                  {analysisResults.downloadLinkNarrativeFeedback && (
                    <a 
                      href={analysisResults.downloadLinkNarrativeFeedback} 
                      className={`${uploadStyles.linkButton} ${uploadStyles.narrativeFeedbackButton}`}
                      download
                      style={{ width: '100%' }}
                    >
                      Download narrative feedback
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
            ) : feedback ? (
              /* Fall back to old feedback display */
              <div className={styles.markdownContent}>
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
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
        </ActionBox>
      </div>
    </MainLayout>
  );
};

export default Feedback;