import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./TryUpload.module.css";
import { uploadEssayFile, getQueueStatus } from "../../services/essay_api";
import { useAuth } from "../../context/AuthContext";

const TryUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const { userName, logout } = useAuth();
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

  // Handle file upload
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
      
      console.log("Starting upload for testing...");
      
      // Step 1: Show upload progress
      setUploadProgress({
        step: "1/3",
        message: "Uploading PDF file...",
        progress: 20
      });
      
      // Step 1: Upload the file using the same API
      const uploadResponse = await uploadEssayFile(selectedFile);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Upload failed");
      }
      
      setUploadProgress({
        step: "2/3",
        message: "Extracting text from PDF...",
        progress: 60
      });
      
      // Step 2: Extract directory name from path
      const extractedTextPath = uploadResponse.extracted_text_dir;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName/extracted_text.txt"
      
      console.log("Extraction completed. Directory name:", dirName);
      
      setUploadProgress({
        step: "3/3",
        message: "Preparing for analysis...",
        progress: 90
      });
      
      // Store directory name for automatic analysis
      sessionStorage.setItem('tryDirectoryName', dirName);
      sessionStorage.setItem('autoAnalyze', 'true'); // Flag for automatic analysis
      
      setUploadProgress({
        step: "3/3",
        message: "Upload complete! Redirecting...",
        progress: 100
      });
      
      console.log("Upload successful! Navigating to Try Feedback for automatic analysis...");
      
      // Small delay to show success, then auto-navigate
      setTimeout(() => {
        navigate("/try-feedback");
      }, 1500);
      
    } catch (err) {
      console.error("Upload error:", err);
      
      // Handle specific queue full error
      if (err.message?.includes("queue is full")) {
        setError("Upload queue is currently full. Please try again in a few minutes.");
        await checkQueueStatus(); // Update queue status
      } else {
        setError(`Upload failed: ${err.message || "Unknown error occurred"}`);
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
    setUploadProgress(null);
    
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
                ⚠️ Processing queue is busy ({queueStatus.queue_length}/{queueStatus.max_queue_length} tasks). 
                Your upload may take longer than usual.
              </div>
            )}

            {/* Info Box */}
            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>🎯 Try Our PDF Analysis</h3>
              <div className={styles.infoContent}>
                <p>Upload a PDF containing Chevening essays to test our text extraction and analysis capabilities.</p>
                <p>This demo will:</p>
                <ul className={styles.featureList}>
                  <li>✅ Extract text from your PDF</li>
                  <li>✅ Prepare for grammar analysis</li>
                  <li>✅ Show you the analysis workflow</li>
                  <li>✅ Generate demo feedback document</li>
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
              {isLoading ? "Processing..." : "Upload & Auto-Analyze"}
            </button>

            {/* Enhanced Progress Display */}
            {isLoading && uploadProgress && (
              <div className={styles.loadingContainer}>
                <div className={styles.progressHeader}>
                  <h3>📤 Processing Upload</h3>
                  <p>{uploadProgress.step}</p>
                </div>
                
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
                
                <div className={styles.progressInfo}>
                  <div className={styles.spinner}></div>
                  <div className={styles.progressText}>
                    <p className={styles.progressMessage}>{uploadProgress.message}</p>
                    <small className={styles.progressPercent}>
                      {uploadProgress.progress}% complete
                    </small>
                  </div>
                </div>

                <div className={styles.estimatedTime}>
                  <small>⏱️ Estimated time: 2-5 minutes for upload and extraction</small>
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