import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./TryUpload.module.css";
import { 
  uploadEssayFile, 
  analyzeLeadershipGrammar,
  getQueueStatus 
} from "../../services/essay_api";
import { useAuth } from "../../context/AuthContext";

const TryUpload = () => {
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
      
      console.log("Starting upload and analysis for testing...");
      
      // Step 1: Upload the file
      setAnalysisProgress({
        step: "1/3",
        message: "Uploading PDF and extracting text...",
        progress: 15,
        status: "UPLOADING"
      });

      const uploadResponse = await uploadEssayFile(selectedFile);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Upload failed");
      }
      
      // Step 2: Extract directory name from path
      const extractedTextPath = uploadResponse.extracted_text_dir;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName/extracted_text.txt"
      
      console.log("Extraction completed. Directory name:", dirName);
      
      setAnalysisProgress({
        step: "2/3",
        message: "Starting leadership grammar analysis...",
        progress: 30,
        status: "INITIALIZING"
      });

      // Step 3: Start background leadership grammar analysis
      const analysisResult = await analyzeLeadershipGrammar(dirName, userEmail, {
        useBackground: true,
        onProgress: (progress) => {
          handleProgress({
            ...progress,
            step: "3/3",
            message: `Grammar Analysis: ${progress.message || 'Analyzing leadership essay...'}`,
            progress: 30 + (progress.progress || 0) * 0.7 // 30-100%
          });
        },
        onStatusChange: handleStatusChange
      });
      
      // Step 4: Store the analysis results for the feedback section
      const analysisData = {
        googleDocs: analysisResult.google_docs_link,
        googleDrive: analysisResult.google_drive_link,
        downloadLink: analysisResult.download_link,
        timestamp: new Date().toISOString(),
        fileName: selectedFile.name,
        directoryName: dirName,
        essayType: analysisResult.essay_type || 'leadership_essay',
        taskId: analysisResult.task_info?.task_id,
        analysisSummary: analysisResult.analysis_summary
      };

      // Store in sessionStorage for immediate access
      sessionStorage.setItem('tryAnalysisResults', JSON.stringify(analysisData));
      
      setAnalysisProgress({
        step: "3/3",
        message: "Analysis complete! Redirecting to results...",
        progress: 100,
        status: "COMPLETED"
      });

      console.log("Upload and analysis successful! Navigating to Try Feedback...");
      
      // Step 5: Redirect to try feedback section
      setTimeout(() => {
        navigate("/try-feedback");
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

  // Reset function
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
        <div className={`${styles.tryUploadContainer} customScroll`}>
          <h1 className={styles.title}>
            Try Upload - Demo PDF Analysis
          </h1>
          
          <div className={styles.uploadSection}>
            {/* Queue Status Display */}
            {queueStatus && queueStatus.status === "busy" && (
              <div className={styles.queueWarning}>
                ⚠️ Analysis queue is busy ({queueStatus.queue_length}/{queueStatus.max_queue_length} tasks). 
                Your analysis may take longer than usual.
              </div>
            )}

            {/* Info Box */}
            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>🎯 Try Our PDF Analysis</h3>
              <div className={styles.infoContent}>
                <p>Upload a PDF containing Chevening essays to test our leadership essay grammar analysis.</p>
                <p>This demo will:</p>
                <ul className={styles.featureList}>
                  <li>✅ Extract text from your PDF</li>
                  <li>✅ Analyze leadership essay grammar and spelling</li>
                  <li>✅ Create DOCX with Word comments</li>
                  <li>✅ Share via Google Drive & Docs</li>
                </ul>
              </div>
            </div>
            
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
                  <h3>👑 Analyzing Leadership Essay</h3>
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

            {/* Reset Button */}
            {!isLoading && (selectedFile || error) && (
              <button
                className={styles.resetButton}
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default TryUpload;