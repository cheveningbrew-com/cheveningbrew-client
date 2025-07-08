import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Upload.module.css";
import { uploadEssayFile, getEssayFeedback, getCombinedGrammarHemingwayAnalysis} from "../../services/essay_api";
import { getUserId, updateUserField } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { STORAGE_KEYS } from '../../constants/storage';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    
    if (!userName) {
      {/* #AUTH_REMOVED */}
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

  // Handle file upload and redirect to feedback
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    {/* #AUTH_REMOVED */}
    if (!userName) {
      setError("You must be logged in to upload files.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const userId = getUserId();
      
      // Step 1: Upload the file
      const uploadResult = await uploadEssayFile(selectedFile);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Upload failed");
      }
      
      // Step 2: Extract directory name from path
      const extractedTextPath = uploadResult.extracted_text_dir;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName/extracted_text.txt"
      
      // Step 3: Get essay feedback
      const feedbackResult = await getEssayFeedback(dirName, userEmail);

      // Step 4: Get the analysis with links (using combined analysis)
      const analysisResult = await getCombinedGrammarHemingwayAnalysis(dirName, userEmail);
      
      // Step 5: Store the analysis results for the feedback section
      const analysisData = {
        googleDocs: analysisResult.google_docs_link,
        essayFeedback: feedbackResult.google_docs_link,
        timestamp: new Date().toISOString(),
        fileName: selectedFile.name
      };

      // Store in sessionStorage for immediate access
      sessionStorage.setItem('latestAnalysisResults', JSON.stringify(analysisData));
      
      // Store in user data for persistence (optional, if you want to keep it cached)
      

      // Step 7: Redirect to feedback section
      navigate("/feedback");
      
    } catch (err) {
      setError(`Error: ${err.message || "Unknown error occurred"}`);
      
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
    
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={styles.uploadContainer}>
          <h1 className={styles.title}>
            Upload your Chevening Application Essays
          </h1>
          
          <div className={styles.uploadSection}>
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

              {isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Analyzing your essays...</p>
                </div>
              )}
            </>
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;