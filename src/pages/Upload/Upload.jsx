import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Upload.module.css";
import { uploadEssayFile, getWritingStyleAnalysis, shareGoogleDoc} from "../../services/essay_api";
import { getUserId, updateUserField } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState(null);
  const [error, setError] = useState(null);
  const { userName, userEmail, logout } = useAuth();
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

  // Handle file upload and get links
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
      
      const userId = getUserId();
      
      // Step 1: Upload the file
      const uploadResult = await uploadEssayFile(selectedFile);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Upload failed");
      }
      
      // Step 2: Extract directory name from path
      const extractedTextPath = uploadResult.extracted_text_path;
      const pathParts = extractedTextPath.split('/');
      const dirName = pathParts[1]; // Format: "text_outs/dirName/extracted_text.txt"
      
      // Step 3: Get the analysis with links
      const analysisResult = await getWritingStyleAnalysis(dirName);
      
      // Step 4: Share the Google Doc with the user
      const docId = analysisResult.file_id;

      // Share a document with writer access
      shareGoogleDoc(docId, userEmail, "writer")
        .then(result => {
          console.log('Document shared successfully:', result);
          // Handle success - maybe show a confirmation message or link
        })
        .catch(error => {
          console.error('Failed to share document:', error);
          // Handle error - show error message to user
        });

      
      // Step 5: Set the links
      setLinks({
        googleDrive: analysisResult.google_drive_link,
        googleDocs: analysisResult.google_docs_link,
        download: analysisResult.download_link
      });
      
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
    setLinks(null);
    setError(null);
    
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  // If not authenticated, this could show a loading state
  // The useEffect will handle redirecting
 

  return (
    <MainLayout>
      <ActionBox>
        <div className={styles.uploadContainer}>
          <h1 className={styles.title}>
            Upload your Chevening Application Essays
          </h1>
          
          <div className={styles.uploadSection}>
            {!links ? (
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
              </>
            ) : (
              <div className={styles.linksContainer}>
                <h2 className={styles.linksTitle}>Your Analysis is Ready!</h2>
                
                <div className={styles.linkButtons}>
                  <a 
                    href={links.googleDrive} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.linkButton} ${styles.driveButton}`}
                  >
                    View in Google Drive
                  </a>
                  
                  <a 
                    href={links.googleDocs} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.linkButton} ${styles.docsButton}`}
                  >
                    Open in Google Docs
                  </a>
                  
                  <a 
                    href={links.download} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.linkButton} ${styles.downloadButton}`}
                  >
                    Download DOCX
                  </a>
                </div>
                
                <button 
                  className={styles.resetButton} 
                  onClick={handleReset}
                >
                  Upload Another Document
                </button>
              </div>
            )}
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Upload;