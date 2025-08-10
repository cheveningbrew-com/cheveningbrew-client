import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Upload.module.css";
import {
  uploadEssayFile,
  getQueueStatus,
  getComprehensiveAnalysis,
  getLeadershipComprehensiveAnalysis
} from "../../services/essay_api";
import { getUserId, checkSubscriptionStatus } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Trash2,CloudUpload } from "lucide-react";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [analysisType, setAnalysisType] = useState(null);  // Added this
  const [estimatedTime, setEstimatedTime] = useState(null);  // Added this

  // Unified subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
  }, [userName, navigate]);

  // Check comprehensive subscription status on component mount
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setStatusLoading(true);
      const userId = getUserId();

      if (!userId) {
        navigate("/");
        return;
      }

      // Get comprehensive subscription status
      const status = await checkSubscriptionStatus(userId);
      setSubscriptionStatus(status);

    } catch (error) {
      console.error("Error checking user status:", error);
      setError("Unable to verify user status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  // Check queue status when component loads
  useEffect(() => {
    if (subscriptionStatus) {
      checkQueueStatus();
    }
  }, [subscriptionStatus]);

  const checkQueueStatus = async () => {
    try {
      const status = await getQueueStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error("Failed to get queue status:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }

      setSelectedFile(file);
      setError(null);
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

  // Main upload and analysis handler with routing logic
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    if (!userName) {
      setError("You must be logged in to upload files.");
      return;
    }

    if (!subscriptionStatus) {
      setError("Unable to verify subscription status. Please refresh the page.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAnalysisProgress(null);
      setCurrentTask(null);
      setAnalysisType(null);
      setEstimatedTime(null);

      const userId = getUserId();

      // 🚦 STEP 1: CHECK SUBSCRIPTION STATUS FIRST (BEFORE UPLOAD)
      let analysisEndpoint;
      let analysisTypeToUse;
      let estimatedTimeToUse;

      // Condition 1: Free attempt available (no payment, no subscription, free attempt not used)
      if (subscriptionStatus.is_free_attempt_used === false &&
          subscriptionStatus.payment_completed === false &&
          subscriptionStatus.has_active_subscription === false) {

        console.log("🆓 Will use free leadership analysis");
        analysisEndpoint = "leadership";
        analysisTypeToUse = "leadership_comprehensive";
        estimatedTimeToUse = "12-15 minutes";

        setAnalysisProgress({
          step: "1/3",
          message: "🆓 Free Trial: Will analyze your leadership essay only",
          progress: 5,
          status: "PREPARING"
        });

      }
      // Condition 2: Active subscription with remaining attempts
      else if (subscriptionStatus.payment_completed === true &&
               subscriptionStatus.has_active_subscription === true &&
               subscriptionStatus.remaining_attempts > 0) {

        console.log("💰 Will use comprehensive subscription analysis");
        analysisEndpoint = "comprehensive";
        analysisTypeToUse = "comprehensive_essay_revival";
        estimatedTimeToUse = "25-30 minutes";

        setAnalysisProgress({
          step: "1/3",
          message: "Starting comprehensive analysis",
          progress: 5,
          status: "PREPARING"
        });

      }
      // Condition 3: All other cases - redirect to pricing
      else {
        console.log("💳 Redirecting to pricing page");
        setIsLoading(false);
        navigate("/pricing");
        return;
      }

      // Set the determined analysis type and time
      setAnalysisType(analysisTypeToUse);
      setEstimatedTime(estimatedTimeToUse);

      // Brief pause to show user what analysis they'll get
      await new Promise(resolve => setTimeout(resolve, 1500));

      // STEP 2: Upload the file
      setAnalysisProgress({
        step: "2/3",
        message: "Uploading PDF and extracting text...",
        progress: 15,
        status: "UPLOADING"
      });

      const uploadResult = await uploadEssayFile(selectedFile);

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Upload failed");
      }

      // Extract directory name from path
      const extractedTextPath = uploadResult.extracted_text_dir;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName"

      setAnalysisProgress({
        step: "3/3",
        message: `Starting ${analysisTypeToUse === "leadership_comprehensive" ? "leadership" : "comprehensive"} analysis...`,
        progress: 30,
        status: "INITIALIZING"
      });

      // STEP 3: Run the predetermined analysis
      let analysisResult;

      if (analysisEndpoint === "leadership") {
        // Free trial - Leadership analysis
        analysisResult = await getLeadershipComprehensiveAnalysis(dirName, userEmail, userName, userId, {
          onProgress: (progress) => {
            handleProgress({
              ...progress,
              step: "3/3",
              message: `Leadership Analysis: ${progress.message || 'Analyzing leadership essay...'}`,
              progress: 30 + (progress.progress || 0) * 0.7 // 30-100%
            });
          },
          onStatusChange: handleStatusChange
        });

        // Store results for free trial format
        const analysisData = {
          essayFeedback: analysisResult.summary?.assessment_document?.google_docs_link,
          googleDocs: analysisResult.summary?.grammar_style_document?.google_docs_link,
          narrativeFeedback: analysisResult.summary?.narrative_feedback_document?.google_docs_link,
          downloadLinkGrammarStyleDocument: analysisResult.summary?.grammar_style_document?.download_link,
          downloadLinkEssayFeedback: analysisResult.summary?.assessment_document?.download_link,
          downloadLinkNarrativeFeedback: analysisResult.summary?.narrative_feedback_document?.download_link,
          timestamp: new Date().toISOString(),
          fileName: selectedFile.name,
          directoryName: dirName,
          taskId: analysisResult.task_info?.task_id,
          analysisSummary: analysisResult.summary,
          totalDocuments: analysisResult.summary?.total_documents_created || 2,
          databaseSaved: analysisResult.summary?.database_saved || false,
          analysisType: "leadership_comprehensive_revival"
        };

        sessionStorage.setItem('latestAnalysisResults', JSON.stringify(analysisData));

      } else if (analysisEndpoint === "comprehensive") {
        // Paid subscription - Comprehensive analysis
        analysisResult = await getComprehensiveAnalysis(dirName, userEmail, userName, userId, {
          onProgress: (progress) => {
            handleProgress({
              ...progress,
              step: "3/3",
              message: progress.message || 'Running comprehensive analysis...',
              progress: 30 + (progress.progress || 0) * 0.7 // 30-100%
            });
          },
          onStatusChange: handleStatusChange
        });

        // Store results for comprehensive format
          const analysisData = {
          googleDocs: analysisResult.summary?.grammar_style_document?.google_docs_link,
          essayFeedback: analysisResult.summary?.assessment_document?.google_docs_link,
          narrativeFeedback: analysisResult.summary?.narrative_feedback_document?.google_docs_link,
          downloadLinkGrammarStyleDocument: analysisResult.summary?.grammar_style_document?.download_link,
          downloadLinkEssayFeedback: analysisResult.summary?.assessment_document?.download_link,
          downloadLinkNarrativeFeedback: analysisResult.summary?.narrative_feedback_document?.download_link,
          timestamp: new Date().toISOString(),
          fileName: selectedFile.name,
          taskId: analysisResult.task_info?.task_id,
          totalDocuments: analysisResult.summary?.total_documents_created || 3,
          databaseSaved: analysisResult.summary?.database_saved || false,
          analysisType: "comprehensive_essay_revival"
        };

        sessionStorage.setItem('latestAnalysisResults', JSON.stringify(analysisData));
      }

      setAnalysisProgress({
        step: "3/3",
        message: "Analysis complete! Redirecting to results...",
        progress: 100,
        status: "COMPLETED"
      });

      // Refresh user status after successful analysis
      await checkUserStatus();

      // Redirect to feedback section
      setTimeout(() => {
        navigate("/feedback");
        // Only reset loading state after navigation is triggered
        setIsLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Upload and analysis error:", err);

      // Handle specific errors
      if (err.message?.includes("queue is full")) {
        setError("Analysis queue is currently full. Please try again in a few minutes.");
        await checkQueueStatus();
      } else if (err.message?.includes("You've used your free leadership analysis")) {
        setError("Free trial already used. Please subscribe for full analysis features.");
        await checkUserStatus();
      } else if (err.message?.includes("No attempts remaining")) {
        setError("You have no remaining attempts. Please upgrade your subscription.");
        await checkUserStatus();
      } else {
        setError(`Error: ${err.message || "Unknown error occurred"}`);
      }

      // If authentication issues, redirect to login
      if (err.message?.includes("unauthorized") || err.message?.includes("not authenticated")) {
        logout();
        navigate("/");
      }
      // Set loading to false for error cases
      setIsLoading(false);
    } finally {
      // Loading state now managed in the success and error paths
    }
  };

 const handleDeleteFile = (event) => {
  event.preventDefault();
  event.stopPropagation(); // Prevent label click

  setSelectedFile(null);
  setError(null);
  setAnalysisProgress(null);
  setCurrentTask(null);
  setAnalysisType(null);
  setEstimatedTime(null);

  // Reset file input
  const fileInput = document.getElementById("file-upload");
  if (fileInput) fileInput.value = "";
};

// Drag and drop handlers
const handleDragEnter = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);

  const files = e.dataTransfer.files;
  if (files && files[0]) {
    const file = files[0];

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the maximum allowed size (10MB)`);
      return;
    }

    setSelectedFile(file);
    setError(null);
  }
};

  if (statusLoading) {
    return (
      <MainLayout>
        <ActionBox className={`${styles.actionBoxCustom} ${styles.loadingActionBox}`}>
          <div className={`${styles.mainContent} customScroll`}>
            <div className={styles.spinner}></div>
            <p>Checking your account status...</p>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ActionBox className={`${styles.actionBoxCustom} ${isLoading ? styles.loadingActionBox : ''}`}>
        <div className={`${styles.mainContent} customScroll`}>
          {!isLoading && (
            <h1 className={styles.title}>
              {selectedFile ? "Upload and get feedback" : "Select your Chevening draft essays"}
            </h1>
          )}

          {/* Status Display */}
          {/* {subscriptionStatus && (
            <div className={styles.statusDisplay}>
              {subscriptionStatus.has_active_subscription ? (
                <div className={styles.subscriptionStatus}>
                  <p><strong>Plan:</strong> {subscriptionStatus.subscription_plan} |
                     <strong>Attempts Remaining:</strong> {subscriptionStatus.remaining_attempts}</p>
                </div>
              ) : !subscriptionStatus.is_free_attempt_used ? (
                <div className={styles.freeTrialStatus}>
                  <p>🆓 <strong>Free Trial Available:</strong> Leadership essay analysis</p>
                </div>
              ) : (
                <div className={styles.upgradeStatus}>
                  <p>💰 <strong>Subscription Required:</strong> Free trial used</p>
                </div>
              )}
            </div>
          )} */}
            {/* Queue Status Display */}
            {queueStatus && queueStatus.status === "busy" && (
              <div className={styles.queueWarning}>
                ⚠️ Analysis queue is busy ({queueStatus.queue_length}/{queueStatus.max_queue_length} tasks).
                Your analysis may take longer than usual.
              </div>
            )}

            {/* File Upload - Only show when not loading */}
            {!isLoading && (
              <>
                {/* Direct children of ActionBox */}
                  {selectedFile ? (
                    <div className={styles.selectedFileArea}>
                      <div className={styles.fileIcon}>📄</div>
                      <div className={styles.fileDetails}>
                        <span className={styles.fileName}>{selectedFile.name}</span>
                        <span className={styles.fileSize}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteFile}
                        className={styles.deleteButton}
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                   <div
                      className={`${styles.fileUploadArea} ${dragActive ? styles.dragActive : ''}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className={styles.uploadIcon}>
                        <CloudUpload size={48} />
                      </div>
                      <p className={styles.dragText}>Drag & drop your file here</p>
                      <div className={styles.divider}>or</div>
                      <button
                        type="button"
                        className={styles.browseButton}
                        onClick={() => document.getElementById('file-upload').click()}
                        disabled={isLoading}
                      >
                        Browse files
                      </button>

                      {/* Requirements section */}
                      <div className={styles.requirements}>
                        <p className={styles.requirementsHeader}>
                          <strong>Please upload a PDF that meets both of the following conditions:</strong>
                        </p>
                        <div className={styles.requirementsList}>
                          <div className={styles.requirementItem}>
                            <span className={styles.numberBadge}>1</span>
                            <span><strong>Includes all four Chevening essays.</strong></span>
                          </div>
                          <div className={styles.requirementItem}>
                            <span className={styles.numberBadge}>2</span>
                            <span><strong>Each essay is between 100 and 500 words, as required by Chevening.</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className={styles.hiddenInput}
                  />

                  {error && <div className={styles.errorMessage}>{error}</div>}

                  {/* Dynamic Upload Button */}
                  {subscriptionStatus && selectedFile && (
                    <button
                      className={styles.uploadButton}
                      onClick={handleUpload}
                      disabled={!selectedFile || isLoading}
                    >
                      {!subscriptionStatus.is_free_attempt_used && !subscriptionStatus.payment_completed
                        ? "Upload"
                        : subscriptionStatus.can_upload
                          ? "Upload"
                          : "Upload"}
                    </button>
                  )}
              </>
            )}

            {/* Progress Display - Placed directly inside ActionBox */}
            {isLoading && analysisProgress && (
              <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                  <h1 className={styles.title}>
                    {analysisProgress.status === "UPLOADING" ? "Uploading your PDF file" :
                     analysisType === "leadership_comprehensive" ? "Analysing your leadership essay" :
                     "Analysing your Chevening essay drafts"}
                  </h1>
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
                  </div>
                )}

                {/* Dynamic Estimated Time */}
                <div className={styles.estimatedTime}>
                  <small>⏱️ Estimated time: {estimatedTime || "Processing analysis..."}</small>
                </div>
              </div>
            )}


        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;