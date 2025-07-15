import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Upload.module.css";
import { 
  uploadEssayFile, 
  getEssayFeedback, 
  getCombinedGrammarHemingwayAnalysis,
  getQueueStatus 
} from "../../services/essay_api";
import { getUserId, updateUserField } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { STORAGE_KEYS } from '../../constants/storage';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
  }, [userName, navigate]);

  // Check queue status on component mount
  useEffect(() => {
    checkQueueStatus();
  }, []);

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

  // Handle file upload and analysis
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    if (!userName) {
      setError("You must be logged in to upload files.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAnalysisProgress(null);
      setCurrentTask(null);
      
      const userId = getUserId();
      
      // Step 1: Upload the file
      setAnalysisProgress({
        step: "1/4",
        message: "Uploading PDF and extracting text...",
        progress: 10,
        status: "UPLOADING"
      });

      const uploadResult = await uploadEssayFile(selectedFile);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Upload failed");
      }
      
      // Step 2: Extract directory name from path
      const extractedTextPath = uploadResult.extracted_text_dir;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName/extracted_text.txt"
      
      setAnalysisProgress({
        step: "2/4",
        message: "Starting comprehensive essay analysis...",
        progress: 25,
        status: "INITIALIZING"
      });

      // Step 3: Start background essay feedback analysis
      const feedbackResult = await getEssayFeedback(dirName, userEmail, userName,  {
        useBackground: true,
        onProgress: (progress) => {
          handleProgress({
            ...progress,
            step: "3/4",
            message: `Essay Feedback: ${progress.message || 'Analyzing essays...'}`,
            progress: 25 + (progress.progress || 0) * 0.35 // 25-60%
          });
        },
        onStatusChange: handleStatusChange
      });

      setAnalysisProgress({
        step: "4/4",
        message: "Starting grammar and style analysis...",
        progress: 60,
        status: "ANALYZING"
      });

      // Step 4: Start background combined analysis
      const analysisResult = await getCombinedGrammarHemingwayAnalysis(dirName, userEmail, {
        useBackground: true,
        onProgress: (progress) => {
          handleProgress({
            ...progress,
            step: "4/4",
            message: `Grammar Analysis: ${progress.message || 'Analyzing writing style...'}`,
            progress: 60 + (progress.progress || 0) * 0.4 // 60-100%
          });
        },
        onStatusChange: handleStatusChange
      });
      
      // Step 5: Store the analysis results for the feedback section
      const analysisData = {
        googleDocs: analysisResult.google_docs_link,
        essayFeedback: feedbackResult.google_docs_link,
        timestamp: new Date().toISOString(),
        fileName: selectedFile.name,
        taskIds: {
          feedbackTaskId: feedbackResult.task_info?.task_id,
          analysisTaskId: analysisResult.task_info?.task_id
        }
      };

      // Store in sessionStorage for immediate access
      sessionStorage.setItem('latestAnalysisResults', JSON.stringify(analysisData));
      
      setAnalysisProgress({
        step: "4/4",
        message: "Analysis complete! Redirecting to results...",
        progress: 100,
        status: "COMPLETED"
      });

      // Step 6: Redirect to feedback section
      setTimeout(() => {
        navigate("/feedback");
      }, 1500);
      
    } catch (err) {
      console.error("Upload and analysis error:", err);
      
      // Handle specific queue full error
      if (err.message?.includes("queue is full")) {
        setError("Analysis queue is currently full. Please try again in a few minutes.");
        await checkQueueStatus(); // Update queue status
      } else {
        setError(`Error: ${err.message || "Unknown error occurred"}`);
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

  // Reset everything
  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setAnalysisProgress(null);
    setCurrentTask(null);
    
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.uploadContainer} customScroll`}>
          <h1 className={styles.title}>
            Upload your Chevening Application Essays
          </h1>
          
          <div className={styles.uploadSection}>
            {/* Queue Status Display */}
            {queueStatus && queueStatus.status === "busy" && (
              <div className={styles.queueWarning}>
                ⚠️ Analysis queue is busy ({queueStatus.queue_length}/{queueStatus.max_queue_length} tasks). 
                Your analysis may take longer than usual.
              </div>
            )}

            <>
              <div className={styles.fileInputContainer}>
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={styles.fileInput}
                />
                <label htmlFor="file-upload" className={styles.fileInputLabel}>
                  {selectedFile ? selectedFile.name : "Choose PDF file"}
                </label>
              </div>
              
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <button
                className={styles.uploadButton}
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? "Processing..." : "Upload & Analyze"}
              </button>

              {/* Enhanced Progress Display */}
              {isLoading && analysisProgress && (
                <div className={styles.loadingContainer}>
                  <div className={styles.progressHeader}>
                    <h3>🎓 Analyzing Your Essays</h3>
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

                  {/* Estimated Time */}
                  <div className={styles.estimatedTime}>
                    <small>⏱️ Estimated time: 15-25 minutes for comprehensive analysis</small>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              {!isLoading && (selectedFile || error) && (
                <button
                  className={styles.resetButton}
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
            </>
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;