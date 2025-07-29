import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Upload.module.css";
import { 
  uploadEssayFile, 
  getQueueStatus 
} from "../../services/essay_api";
import { getUserId, readUserField, getUserSubscription } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  
  // Access control states
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [accessMessage, setAccessMessage] = useState("");

  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
  }, [userName, navigate]);

  // Check subscription access on component mount
  useEffect(() => {
    checkSubscriptionAccess();
  }, []);

  const checkSubscriptionAccess = async () => {
    try {
      setAccessLoading(true);
      const userId = getUserId();
      
      if (!userId) {
        setHasAccess(false);
        setAccessMessage("Authentication required");
        return;
      }

      // Check payment status
      const paymentCompleted = await readUserField(userId, "payment_completed");
      
      if (!paymentCompleted) {
        setHasAccess(false);
        setAccessMessage("You need an active subscription to upload essays. Please subscribe to continue.");
        return;
      }

      // Get subscription details
      try {
        const subscription = await getUserSubscription({ user_id: userId, field: "remaining_attempts" });
        const plan = await getUserSubscription({ user_id: userId, field: "plan" });
        const totalAttempts = await getUserSubscription({ user_id: userId, field: "total_attempts" });
        
        if (subscription.remaining_attempts <= 0) {
          setHasAccess(false);
          setAccessMessage(`Your ${plan.plan} subscription has no remaining attempts. Please upgrade or purchase a new subscription.`);
          setSubscriptionInfo({
            plan: plan.plan,
            remaining: 0,
            total: totalAttempts.total_attempts
          });
          return;
        }

        // User has access
        setHasAccess(true);
        setSubscriptionInfo({
          plan: plan.plan,
          remaining: subscription.remaining_attempts,
          total: totalAttempts.total_attempts
        });
        
      } catch (subscriptionError) {
        console.error("Subscription check error:", subscriptionError);
        setHasAccess(false);
        setAccessMessage("No active subscription found. Please subscribe to upload essays.");
      }

    } catch (error) {
      console.error("Access check error:", error);
      setHasAccess(false);
      setAccessMessage("Unable to verify subscription status. Please try again.");
    } finally {
      setAccessLoading(false);
    }
  };

  // Check queue status on component mount
  useEffect(() => {
    if (hasAccess) {
      checkQueueStatus();
    }
  }, [hasAccess]);

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

  // NEW: Single comprehensive analysis function
  const getComprehensiveAnalysis = async (dirName, email = null, userName = null, userId = null, options = {}) => {
    try {
      const {
        onProgress = null,
        onStatusChange = null,
        pollingInterval = 10000
      } = options;
      
      // Build URL with required parameters
      const url = new URL(`${process.env.REACT_APP_ESSAY_API_URL || "http://localhost:8000"}/essay_reviver/${dirName}`);
      url.searchParams.append('user_id', userId); // Required parameter
      if (userName) {
        url.searchParams.append('user_name', userName);
      }
      if (email) {
        url.searchParams.append('email', email);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Failed to get comprehensive analysis for ${dirName}`);
      }
      
      const result = await response.json();
      
      // This endpoint always uses background processing
      if (result.task_id) {
        console.log(`🔄 Started comprehensive essay analysis task: ${result.task_id}`);
        
        // Poll until completion
        return await pollTaskUntilComplete(
          result.task_id,
          onProgress,
          onStatusChange,
          pollingInterval
        );
      }
      
      // Return direct result if no task ID (shouldn't happen with this endpoint)
      return result;
      
    } catch (error) {
      console.error(`Comprehensive analysis error for ${dirName}:`, error);
      throw error;
    }
  };

  // Utility function to poll task status (moved from essay_api.js)
  const pollTaskUntilComplete = async (
    taskId, 
    onProgress = null, 
    onStatusChange = null,
    pollingInterval = 3000,
    maxAttempts = 200
  ) => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${process.env.REACT_APP_ESSAY_API_URL || "http://localhost:8000"}/task-status/${taskId}`);
        
        if (!response.ok) {
          throw new Error("Failed to get task status");
        }
        
        const statusResponse = await response.json();
        
        // Call status change callback
        if (onStatusChange) {
          onStatusChange(statusResponse);
        }
        
        // Handle different states
        switch (statusResponse.status) {
          case 'COMPLETED':
            console.log("✅ Task completed successfully");
            return statusResponse.result;
            
          case 'FAILED':
            console.error("❌ Task failed:", statusResponse.error);
            throw new Error(statusResponse.error || "Task failed");
            
          case 'PROCESSING':
          case 'ANALYZING':
          case 'GENERATING':
          case 'FINALIZING':
            // Call progress callback if available
            if (onProgress && statusResponse.meta) {
              onProgress({
                status: statusResponse.status,
                step: statusResponse.meta.step || '',
                message: statusResponse.meta.status || '',
                progress: statusResponse.meta.progress || 0,
                current: statusResponse.meta.current || 0,
                total: statusResponse.meta.total || 100
              });
            }
            
            console.log(`🔄 Task ${statusResponse.status.toLowerCase()}: ${statusResponse.meta?.status || 'Processing...'}`);
            break;
            
          case 'PENDING':
            console.log("⏳ Task is pending...");
            break;
            
          default:
            console.log(`📋 Task status: ${statusResponse.status}`);
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        attempts++;
        
      } catch (error) {
        console.error(`Polling attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error("Task polling timeout - maximum attempts reached");
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      }
    }
    
    throw new Error("Task polling timeout");
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
        step: "1/2",
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
      const dirName = pathParts[1]; // Format: "text_outs/dirName"
      
      setAnalysisProgress({
        step: "2/2",
        message: "Starting comprehensive essay analysis...",
        progress: 25,
        status: "INITIALIZING"
      });

      // Step 3: Start single comprehensive analysis (replaces both previous calls)
      const comprehensiveResult = await getComprehensiveAnalysis(dirName, userEmail, userName, userId, {
        onProgress: (progress) => {
          handleProgress({
            ...progress,
            step: "2/2",
            message: progress.message || 'Running comprehensive analysis...',
            progress: 25 + (progress.progress || 0) * 0.75 // 25-100%
          });
        },
        onStatusChange: handleStatusChange
      });

      // Step 4: Extract the analysis results
      const analysisData = {
        // The comprehensive endpoint returns both documents in the summary
        googleDocs: comprehensiveResult.summary?.grammar_style_document?.google_docs_link,
        essayFeedback: comprehensiveResult.summary?.assessment_document?.google_docs_link,
        timestamp: new Date().toISOString(),
        fileName: selectedFile.name,
        taskId: comprehensiveResult.task_info?.task_id,
        // Additional information from comprehensive analysis
        totalDocuments: comprehensiveResult.summary?.total_documents_created || 2,
        databaseSaved: comprehensiveResult.summary?.database_saved || false,
        analysisType: "comprehensive_essay_revival"
      };

      // Store in sessionStorage for immediate access
      sessionStorage.setItem('latestAnalysisResults', JSON.stringify(analysisData));
      
      setAnalysisProgress({
        step: "2/2",
        message: "Analysis complete! Documents created and saved to database.",
        progress: 100,
        status: "COMPLETED"
      });

      // Refresh subscription info after successful upload
      await checkSubscriptionAccess();

      // Step 5: Redirect to feedback section
      setTimeout(() => {
        navigate("/feedback");
      }, 1500);
      
    } catch (err) {
      console.error("Upload and analysis error:", err);
      
      // Handle specific queue full error
      if (err.message?.includes("queue is full")) {
        setError("Analysis queue is currently full. Please try again in a few minutes.");
        await checkQueueStatus(); // Update queue status
      } else if (err.message?.includes("No attempts remaining")) {
        setError("You have no remaining attempts. Please upgrade your subscription.");
        await checkSubscriptionAccess(); // Refresh access status
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

  const handleGoToPricing = () => {
    navigate("/pricing");
  };

  if (accessLoading) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.uploadContainer} customScroll`}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Checking subscription status...</p>
            </div>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  if (!hasAccess) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.uploadContainer} customScroll`}>
            <h1 className={styles.title}>
              Upload your Chevening Application Essays
            </h1>
            
            <div className={styles.accessDeniedSection}>
              <div className={styles.accessDeniedMessage}>
                <h2>🔒 Subscription Required</h2>
                <p>{accessMessage}</p>
                
                {subscriptionInfo && (
                  <div className={styles.subscriptionInfo}>
                    <p><strong>Current Plan:</strong> {subscriptionInfo.plan}</p>
                    <p><strong>Attempts Used:</strong> {subscriptionInfo.total - subscriptionInfo.remaining}/{subscriptionInfo.total}</p>
                  </div>
                )}
              </div>
              
              {/* Inline Pricing Section */}
              <div className={styles.inlinePricing}>
                <h3>💳 Choose Your Plan</h3>
                <div className={styles.pricingGrid}>
                  <div className={styles.planCard}>
                    <h4>Basic</h4>
                    <div className={styles.price}>$5.00</div>
                    <ul>
                      <li>3 attempts</li>
                      <li>20 minutes</li>
                      <li>Quick practice!</li>
                    </ul>
                  </div>
                  <div className={styles.planCard}>
                    <h4>Standard</h4>
                    <div className={styles.price}>$10.00</div>
                    <ul>
                      <li>10 attempts</li>
                      <li>60 minutes</li>
                      <li>Refining answers!</li>
                    </ul>
                  </div>
                  <div className={styles.planCard}>
                    <h4>Premium</h4>
                    <div className={styles.price}>$15.00</div>
                    <ul>
                      <li>20 attempts</li>
                      <li>100 minutes</li>
                      <li>Serious prep!</li>
                    </ul>
                  </div>
                </div>
                <button 
                  className={styles.pricingButton}
                  onClick={handleGoToPricing}
                >
                  View Pricing & Subscribe
                </button>
              </div>
            </div>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.uploadContainer} customScroll`}>
          <h1 className={styles.title}>
            Upload your Chevening Application Essays
          </h1>
          
          {subscriptionInfo && (
            <div className={styles.subscriptionStatus}>
              <p><strong>Plan:</strong> {subscriptionInfo.plan} | <strong>Attempts Remaining:</strong> {subscriptionInfo.remaining}</p>
            </div>
          )}
          
          <div className={styles.uploadSection}>
            {/* Queue Status Display */}
            {queueStatus && queueStatus.status === "busy" && (
              <div className={styles.queueWarning}>
                ⚠️ Analysis queue is busy ({queueStatus.queue_length}/{queueStatus.max_queue_length} tasks). 
                Your analysis may take longer than usual.
              </div>
            )}

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
                  <h3>🎓 Comprehensive Analysis in Progress</h3>
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
                  <small>⏱️ Estimated time: 25-30 minutes for comprehensive analysis + database integration</small>
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

export default Upload;