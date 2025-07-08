import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./TryFeedback.module.css";
import { analyzeLeadershipGrammar } from "../../services/essay_api";
import { useAuth } from "../../context/AuthContext";

const TryFeedback = () => {
  const [dirName, setDirName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and auto-analyze if coming from Try Upload
  useEffect(() => {
    if (!userName) {
      navigate("/");
      return;
    }

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

  // Automatic analysis function
  const performAutomaticAnalysis = async (directoryName) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      console.log("Starting automatic leadership grammar analysis for:", directoryName);
      
      // Call the leadership grammar analysis API
      const analysisResult = await analyzeLeadershipGrammar(directoryName, userEmail);
      
      setResult(analysisResult);
      console.log("Automatic leadership grammar analysis completed successfully:", analysisResult);
      
    } catch (err) {
      setError(`Analysis failed: ${err.message || "Unknown error occurred"}`);
      
      // If the error is due to authentication issues, redirect to login
      if (err.message?.includes("unauthorized") || err.message?.includes("not authenticated")) {
        logout();
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to Try Upload
  const goToTryUpload = () => {
    // Clear any existing flags
    sessionStorage.removeItem('autoAnalyze');
    navigate("/try-upload");
  };

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.tryFeedbackContainer} customScroll`}>
          <h1 className={styles.title}>
            Try Feedback - Auto Grammar Analysis
          </h1>
          
          <div className={styles.feedbackSection}>
            {isLoading ? (
              // Show loading state during automatic analysis
              <div className={styles.autoAnalysisContainer}>
                <h2 className={styles.autoAnalysisTitle}>🔍 Analyzing Leadership Essay</h2>

                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Running leadership grammar analysis...</p>
                  <small>Please wait while we analyze your essay</small>
                </div>
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

                

                <div className={styles.actionButtons}>
                  <button 
                    className={styles.uploadNavButton} 
                    onClick={goToTryUpload}
                  >
                    ← Try Another Upload
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
                </div>
              </div>
            ) : (
              // Show when no analysis is running (direct navigation)
              <div className={styles.waitingContainer}>
                <h2 className={styles.waitingTitle}>📋 Ready for Analysis</h2>
                <div className={styles.infoBox}>
                  <h3 className={styles.infoTitle}>🔍 Leadership Grammar Analysis</h3>
                  <div className={styles.infoContent}>
                    <p>Upload a PDF in the <strong>Try Upload</strong> tab to automatically analyze your leadership essay for grammar and spelling issues.</p>
                    <p>The system will automatically:</p>
                    <ul className={styles.featureList}>
                      <li>✅ Extract text from your PDF</li>
                      <li>✅ Analyze leadership essay grammar</li>
                      <li>✅ Create DOCX with Word comments</li>
                      <li>✅ Share via Google Drive & Docs</li>
                    </ul>
                  </div>
                </div>
                <button 
                  className={styles.uploadNavButton} 
                  onClick={goToTryUpload}
                >
                  ← Go to Try Upload
                </button>
              </div>
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default TryFeedback;