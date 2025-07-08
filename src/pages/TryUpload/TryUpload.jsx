import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./TryUpload.module.css";
import { uploadEssayFile } from "../../services/essay_api";
import { useAuth } from "../../context/AuthContext";

const TryUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userName, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
  }, [userName, navigate]);

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
      
      // Step 1: Upload the file using the same API
      const uploadResponse = await uploadEssayFile(selectedFile);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Upload failed");
      }
      
      // Step 2: Extract directory name from path
      const extractedTextPath = uploadResponse.extracted_text_dir;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName/extracted_text.txt"
      
      console.log("Extraction completed. Directory name:", dirName);
      
      // Store directory name for automatic analysis
      sessionStorage.setItem('tryDirectoryName', dirName);
      sessionStorage.setItem('autoAnalyze', 'true'); // Flag for automatic analysis
      
      console.log("Upload successful! Navigating to Try Feedback for automatic analysis...");
      
      // Small delay to show success, then auto-navigate
      setTimeout(() => {
        navigate("/try-feedback");
      }, 1500);
      
    } catch (err) {
      setError(`Upload failed: ${err.message || "Unknown error occurred"}`);
      
      // If the error is due to authentication issues, redirect to login
      if (err.message?.includes("unauthorized") || err.message?.includes("not authenticated")) {
        logout();
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.tryUploadContainer} customScroll`}>
          <h1 className={styles.title}>
            Try Upload - Auto PDF Analysis
          </h1>
          
          <div className={styles.uploadSection}>
            
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

            {isLoading && (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Extracting text from PDF...</p>
                <small>Will automatically start analysis next...</small>
              </div>
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default TryUpload;