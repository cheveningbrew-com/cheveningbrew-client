import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./TryFeedback.module.css";
import { analyzeLeadershipGrammar, getTaskStatus, getQueueStatus } from "../../services/essay_api";
import { useAuth } from "../../context/AuthContext";

const TryFeedback = () => {
  const [dirName, setDirName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and auto-analyze if coming from Try Upload
  useEffect(() => {
    if (!userName) {
      navigate("/");
      return;
    }

    // Check queue status
    checkQueueStatus();

    // Check if we should auto-analyze from Try Upload
    const shouldAutoAnalyze = sessionStorage.getItem('autoAnalyze');
    const tryDirName = sessionStorage.getItem('tryDirectoryName');
    
    if (shouldAutoAnalyze === 'true' && tryDirName) {
      console.log("Auto-analyzing from Try Upload with directory:", tryDirName);
      setDirName(tryDirName);
      
      // Clear the auto-analyze flag
      sessionStorage.removeItem('autoAnalyze');
      
      // Start automatic analysis
      performAutomaticAnalysis(tryDirName);
    } else if (tryDirName) {
      // Just set the directory name without auto-analyzing
      setDirName(tryDirName);
    }
  }, [userName, navigate]);

  const checkQueueStatus = async () => {
    try {
      const status = await getQueueStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error("Failed to get queue status:", error);
    }
  };

  // Progress callback for background tasks
  const handleProgress = (progress) => {
    setAnalysisProgress({
      step: progress.step || '',
      message: progress.message || 'Processing...',
      progress: progress.progress || 0,
      status: progress.status || 'PROCESSING'
    });
  };

  // Status change callback
  const handleStatusChange = (statusData) => {
    console.log("Task status updated:", statusData);
    setCurrentTask(statusData);
  };

  // Automatic analysis function
  const performAutomaticAnalysis = async (directoryName) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setAnalysisProgress(null);
      setCurrentTask(null);
      
      console.log("Starting automatic leadership grammar analysis for:", directoryName);
      
      setAnalysisProgress({
        step: "1/4",
        message: "Initializing grammar analysis...",
        progress: 10,
        status: "INITIALIZING"
      });

      // Call the leadership grammar analysis API with background processing
      const analysisResult = await analyzeLeadershipGrammar(directoryName, userEmail, {
        useBackground: true,
        onProgress: (progress) => {
          handleProgress({
            ...progress,
            step: progress.step || "3/4",
            message: `Grammar Analysis: ${progress.message || 'Analyzing leadership essay...'}`,
            progress: 25 + (progress.progress || 0) * 0.7 // 25-95%
          });
        },
        onStatusChange: handleStatusChange,
        pollingInterval: 2000 // Poll every 2 seconds for demo
      });
      
      setResult(analysisResult);
      
      setAnalysisProgress({
        step: "4/4",
        message: "Analysis complete!",
        progress: 100,
        status: "COMPLETED"
      });
      
      console.log("Automatic leadership grammar analysis completed successfully:", analysisResult);
      
    } catch (err) {
      console.error("Analysis error:", err);
      
      // Handle specific queue full error
      if (err.message?.includes("queue is full")) {
        setError("Analysis queue is currently full. Please try again in a few minutes.");
        await checkQueueStatus(); // Update queue status
      } else {
        setError(`Analysis failed: ${err.message || "Unknown error occurred"}`);
      }
      
      // If the error is due to authentication issues, redirect to login
      if (err.message?.includes("unauthorized") || err.message?.includes("not authenticated")) {
        logout();
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manual analysis function
  const handleManualAnalysis = async () => {
    if (!dirName.trim()) {
      setError("Please enter a directory name.");
      return;
    }

    await performAutomaticAnalysis(dirName.trim());
  };

  // Navigate to Try Upload
  const goToTryUpload = () => {
    // Clear any existing flags
    sessionStorage.removeItem('autoAnalyze');
    navigate("/try-upload");
  };

  // Reset function
  const handleReset = () => {
    setDirName("");
    setError(null);
    setResult(null);
    setAnalysisProgress(null);
    setCurrentTask(null);
    sessionStorage.removeItem('tryDirectoryName');
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.tryFeedbackContainer} customScroll`}>
          <h1 className={styles.title}>
            Try Feedback - Demo Grammar Analysis
          </h1>
          
          <div className={styles.feedbackSection}>
            {/* Queue Status Display */}
            {queueStatus && queueStatus.status === "busy" && (
              <div className={styles.queueWarning}>
                ⚠️ Analysis queue is busy ({queueStatus.queue_length}/{queueStatus.max_queue_length} tasks). 
                Your analysis may take longer than usual.
              </div>
            )}

            {isLoading ? (
              // Show loading state during automatic analysis
              <div className={styles.autoAnalysisContainer}>
                <h2 className={styles.autoAnalysisTitle}>🔍 Analyzing Leadership Essay</h2>

                {analysisProgress && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                      <p>{analysisProgress.step}</p>
                    </div>
                    
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${analysisProgress.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className={styles.progressInfo}>
                      <div className={styles.spinner}></div>
                      <div className={styles.progressText}>
                        <p className={styles.progressMessage}>{analysisProgress.message}</p>
                        <small className={styles.progressPercent}>
                          {analysisProgress.progress}% complete
                        </small>
                      </div>
                    </div>

                    {/* Task Information */}
                    {currentTask && (
                      <div className={styles.taskInfo}>
                        <small>Task ID: {currentTask.task_id}</small>
                        <small>Status: {currentTask.status}</small>
                        {currentTask.meta?.status && (
                          <small>Details: {currentTask.meta.status}</small>
                        )}
                      </div>
                    )}

                    <div className={styles.estimatedTime}>
                      <small>⏱️ Estimated time: 5-8 minutes for grammar analysis</small>
                    </div>
                  </div>
                )}
              </div>
            ) : result ? (
              // Show results after analysis
              <div className={styles.resultsContainer}>
                <h2 className={styles.resultsTitle}>✅ Leadership Grammar Analysis Complete!</h2>
                

                <div className={styles.linkButtons}>
                  <a 
                    href={result.google_docs_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.linkButton} ${styles.docsButton}`}
                  >
                    ✏️ Edit in Google Docs
                  </a>
                  
                  <a 
                    href={result.google_drive_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.linkButton} ${styles.driveButton}`}
                  >
                    📁 View in Google Drive
                  </a>
                  
                  {result.download_link && (
                    <a 
                      href={result.download_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${styles.linkButton} ${styles.downloadButton}`}
                    >
                      ⬇️ Download DOCX
                    </a>
                  )}
                </div>

                {/* Analysis Summary */}
                {result.analysis_summary && (
                  <div className={styles.summarySection}>
                    <h3>📊 Analysis Summary</h3>
                    <div className={styles.summaryContent}>
                      <p><strong>Grammar Issues Found:</strong> {result.analysis_summary.total_grammar_issues || 0}</p>
                      <p><strong>Essay Type:</strong> {result.essay_type || 'Leadership Essay'}</p>
                      {result.analysis_summary.key_issues && (
                        <p><strong>Key Areas:</strong> {result.analysis_summary.key_issues.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.actionButtons}>
                  <button 
                    className={styles.uploadNavButton} 
                    onClick={goToTryUpload}
                  >
                    ← Try Another Upload
                  </button>
                  
                  <button 
                    className={styles.resetButton} 
                    onClick={handleReset}
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            ) : error ? (
              // Show error state
              <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>❌ Analysis Failed</h2>
                <div className={styles.errorMessage}>{error}</div>
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.uploadNavButton} 
                    onClick={goToTryUpload}
                  >
                    ← Back to Try Upload
                  </button>
                  
                  <button 
                    className={styles.resetButton} 
                    onClick={handleReset}
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            ) : (
              // Show when no analysis is running (direct navigation or manual entry)
              <div className={styles.waitingContainer}>
                <h2 className={styles.waitingTitle}>📋 Ready for Analysis</h2>
                
                <div className={styles.infoBox}>
                  <h3 className={styles.infoTitle}>🔍 Leadership Grammar Analysis Demo</h3>
                  <div className={styles.infoContent}>
                    <p>Upload a PDF in the <strong>Try Upload</strong> tab to automatically analyze your leadership essay for grammar and spelling issues.</p>
                    <p>Or enter a directory name manually to test the analysis system:</p>
                    <ul className={styles.featureList}>
                      <li>✅ Extract text from your PDF</li>
                      <li>✅ Analyze leadership essay grammar</li>
                      <li>✅ Create DOCX with Word comments</li>
                      <li>✅ Share via Google Drive & Docs</li>
                    </ul>
                  </div>
                </div>

                {/* Manual Directory Input */}
                <div className={styles.manualInputSection}>
                  <h3>🧪 Manual Testing</h3>
                  <div className={styles.inputContainer}>
                    <label className={styles.inputLabel}>Directory Name:</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={dirName}
                      onChange={(e) => setDirName(e.target.value)}
                      placeholder="Enter directory name (e.g., extracted_1234567890)"
                      disabled={isLoading}
                    />
                    <div className={styles.inputHint}>
                      Enter the directory name from a previous extraction to test the analysis system.
                    </div>
                  </div>
                  
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.analyzeButton}
                      onClick={handleManualAnalysis}
                      disabled={!dirName.trim() || isLoading}
                    >
                      Analyze Grammar
                    </button>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <button 
                    className={styles.uploadNavButton} 
                    onClick={goToTryUpload}
                  >
                    ← Go to Try Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default TryFeedback;