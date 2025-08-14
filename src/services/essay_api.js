/**
 * Enhanced API service for essay analysis with comprehensive analysis support
 */

// Configure the API base URL
const API_BASE_URL =
  process.env.REACT_APP_ESSAY_API_URL || "http://localhost:6500";

/**
 * Upload a PDF file to extract and analyze Chevening essays
 * @param {File} file - The PDF file containing Chevening essays
 * @returns {Promise<Object>} Extraction result with path and success status
 */
export const uploadEssayFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload_to_server`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Failed to upload file");
      // Preserve the detailed errors for word count validation
      if (errorData.errors) {
        error.errors = errorData.errors;
      }
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Essay upload error:", error);
    throw error;
  }
};

/**
 * Check the status of the analysis queue
 * @returns {Promise<Object>} Queue status information
 */
export const getQueueStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/queue-status`);

    if (!response.ok) {
      throw new Error("Failed to get queue status");
    }

    return await response.json();
  } catch (error) {
    console.error("Queue status error:", error);
    throw error;
  }
};

/**
 * Check the status of a specific analysis task
 * @param {string} taskId - The task ID to check
 * @returns {Promise<Object>} Task status and result information
 */
export const getTaskStatus = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/task-status/${taskId}`);

    if (!response.ok) {
      throw new Error("Failed to get task status");
    }

    return await response.json();
  } catch (error) {
    console.error("Task status error:", error);
    throw error;
  }
};

/**
 * Map backend step to frontend 5-step system
 * Backend provides 4 steps (1/4, 2/4, 3/4, 4/4)
 * Frontend shows 5 steps: Upload + 4 backend steps
 * @param {string} backendStep - Backend step string (e.g., "2/4")
 * @returns {Object} Frontend step info with progress percentage
 */
const mapBackendStepToFrontend = (backendStep) => {
  if (!backendStep || !backendStep.includes("/")) {
    return { step: "2/5", progress: 20 }; // Default to step 2 if no backend step
  }
  
  try {
    const [current, total] = backendStep.split("/").map(Number);
    if (isNaN(current) || isNaN(total) || total === 0) {
      return { step: "2/5", progress: 20 };
    }
    
    // Map backend steps to frontend steps:
    // Backend 1/4 -> Frontend 2/5 (20-40%)
    // Backend 2/4 -> Frontend 3/5 (40-60%) 
    // Backend 3/4 -> Frontend 4/5 (60-80%)
    // Backend 4/4 -> Frontend 5/5 (80-100%)
    
    const frontendStepNumber = current + 1; // Backend step 1 becomes frontend step 2
    const frontendStep = `${frontendStepNumber}/5`;
    const progress = frontendStepNumber * 20; // Each step is 20%
    
    return { step: frontendStep, progress };
  } catch {
    return { step: "2/5", progress: 20 };
  }
};

/**
 * Get user-friendly message for task status based on frontend step
 * @param {string} status - Backend status
 * @param {string} backendMessage - Backend message
 * @param {string} frontendStep - Frontend step (e.g., "2/5")
 * @returns {string} User-friendly message
 */
const getProgressMessage = (status, backendMessage, frontendStep) => {
  // If backend provides a specific message, use it with step context
  if (backendMessage) {
    return `${backendMessage} (${frontendStep})`;
  }
  
  // Map frontend steps to user-friendly messages
  switch (frontendStep) {
    case "2/5":
      return "Running essay assessment analysis...";
    case "3/5": 
      return "Running grammar & style analysis...";
    case "4/5":
      return "Running strategic feedback analysis...";
    case "5/5":
      return "Creating documents & finalizing...";
    default:
      // Fallback to status-based messages
      switch (status) {
        case "ANALYZING": 
          return `Running AI analysis (${frontendStep})...`;
        case "GENERATING":
          return `Creating documents (${frontendStep})...`;
        case "FINALIZING":
          return `Finalizing and uploading (${frontendStep})...`;
        default:
          return `Processing (${frontendStep})...`;
      }
  }
};

/**
 * Poll task status until completion with 5-step progress tracking
 * @param {string} taskId - The task ID to monitor
 * @param {Function} onProgress - Callback for progress updates
 * @param {Function} onStatusChange - Callback for status changes
 * @param {number} pollingInterval - Polling interval in milliseconds (default: 3000)
 * @param {number} maxAttempts - Maximum polling attempts (default: 200)
 * @returns {Promise<Object>} Final task result
 */
export const pollTaskUntilComplete = async (
  taskId,
  onProgress = null,
  onStatusChange = null,
  pollingInterval = 3000,
  maxAttempts = 200
) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const statusResponse = await getTaskStatus(taskId);

      // Call status change callback
      if (onStatusChange) {
        onStatusChange(statusResponse);
      }

      // Handle different states
      switch (statusResponse.status) {
        case "COMPLETED":
          console.log("✅ Task completed successfully");
          if (onProgress) {
            onProgress({
              status: "COMPLETED",
              step: "5/5",
              message: "Analysis completed successfully!",
              progress: 100,
              phase: 'analysis'
            });
          }
          return statusResponse.result;

        case "FAILED":
          console.error("❌ Task failed:", statusResponse.error);
          throw new Error(statusResponse.error || "Task failed");
          
        case "PROCESSING":
        case "ANALYZING":
        case "GENERATING":
        case "FINALIZING":
        case "PENDING":
          if (onProgress && statusResponse.meta) {
            const backendStep = statusResponse.meta.step || "";
            const backendMessage = statusResponse.meta.status || "";
            
            // Map backend step to frontend 5-step system
            const { step: frontendStep, progress } = mapBackendStepToFrontend(backendStep);

            const progressData = {
              status: statusResponse.status,
              step: frontendStep,
              message: getProgressMessage(statusResponse.status, backendMessage, frontendStep),
              progress: progress,
              phase: 'analysis',
              current: statusResponse.meta.current || 0,
              total: statusResponse.meta.total || 100,
              taskStatus: statusResponse.status,
              backendStep: backendStep // Keep original for debugging
            };

            onProgress(progressData);
          }

          console.log(
            `🔄 Task ${statusResponse.status.toLowerCase()}: ${
              statusResponse.meta?.status || "Processing..."
            }`
          );
          break;

        default:
          console.log(`📋 Task status: ${statusResponse.status}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    } catch (error) {
      console.error(`Polling attempt ${attempts + 1} failed:`, error);
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error("Task polling timeout - maximum attempts reached");
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }
  }

  throw new Error("Task polling timeout");
};

/**
 * NEW: Comprehensive Essay Analysis with Database Integration
 * This replaces the separate essay feedback and grammar+hemingway calls
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share documents with
 * @param {string} userName - User name for personalized feedback
 * @param {string} userId - User ID for database operations (REQUIRED)
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Comprehensive analysis result
 */
export const getComprehensiveAnalysis = async (
  dirName,
  email = null,
  userName = null,
  userId,
  options = {}
) => {
  try {
    if (!userId) {
      throw new Error("User ID is required for comprehensive analysis");
    }

    const {
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000,
    } = options;

    // Build URL with required parameters
    const url = new URL(`${API_BASE_URL}/essay_reviver/${dirName}`);
    url.searchParams.append("user_id", userId); // Required parameter
    if (userName) {
      url.searchParams.append("user_name", userName);
    }
    if (email) {
      url.searchParams.append("email", email);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          errorData.detail ||
          `Failed to get comprehensive analysis for ${dirName}`
      );
    }

    const result = await response.json();

    // This endpoint always uses background processing
    if (result.task_id) {
      console.log(
        `🔄 Started comprehensive essay analysis task: ${result.task_id}`
      );

      // Poll until completion
      return await pollTaskUntilComplete(
        result.task_id,
        onProgress,
        onStatusChange,
        pollingInterval,
        200 // maxAttempts
      );
    }

    // Return direct result if no task ID (shouldn't happen with this endpoint)
    return result;
  } catch (error) {
    console.error(`Comprehensive analysis error for ${dirName}:`, error);
    throw error;
  }
};

/**
 * NEW: Leadership Essay Comprehensive Analysis with Database Integration
 * For Try Upload - combines leadership assessment + grammar analysis
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share documents with
 * @param {string} userName - User name for personalized feedback
 * @param {string} userId - User ID for database operations (REQUIRED)
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Leadership comprehensive analysis result
 */
export const getLeadershipComprehensiveAnalysis = async (
  dirName,
  email = null,
  userName = null,
  userId,
  options = {}
) => {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required for leadership comprehensive analysis"
      );
    }

    const {
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000,
    } = options;

    // Build URL with required parameters
    const url = new URL(`${API_BASE_URL}/leadership_reviewer/${dirName}`);
    url.searchParams.append("user_id", userId); // Required parameter
    if (userName) {
      url.searchParams.append("user_name", userName);
    }
    if (email) {
      url.searchParams.append("email", email);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          errorData.detail ||
          `Failed to get leadership comprehensive analysis for ${dirName}`
      );
    }

    const result = await response.json();

    // This endpoint always uses background processing
    if (result.task_id) {
      console.log(
        `👑 Started leadership comprehensive analysis task: ${result.task_id}`
      );

      // Poll until completion
      return await pollTaskUntilComplete(
        result.task_id,
        onProgress,
        onStatusChange,
        pollingInterval,
        200 // maxAttempts
      );
    }

    // Return direct result if no task ID (shouldn't happen with this endpoint)
    return result;
  } catch (error) {
    console.error(
      `Leadership comprehensive analysis error for ${dirName}:`,
      error
    );
    throw error;
  }
};

/**
 * LEGACY: Essay feedback analysis (still available but deprecated)
 * Use getComprehensiveAnalysis instead for new implementations
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share the assessment document with
 * @param {string} userName - Optional user name for personalized feedback
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Task information or direct result
 */
export const getEssayFeedback = async (
  dirName,
  email = null,
  userName = null,
  options = {}
) => {
  try {
    const {
      useBackground = true,
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000,
    } = options;

    // Build URL with parameters
    const url = new URL(`${API_BASE_URL}/essay_feedback/${dirName}`);
    if (userName) {
      url.searchParams.append("user_name", userName);
    }
    if (email) {
      url.searchParams.append("email", email);
    }
    url.searchParams.append("use_background", useBackground.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to get essay feedback for ${dirName}`
      );
    }

    const result = await response.json();

    // If background processing is used and we got a task ID
    if (useBackground && result.task_id) {
      console.log(`🎓 Started essay feedback analysis task: ${result.task_id}`);

      // Poll until completion
      return await pollTaskUntilComplete(
        result.task_id,
        onProgress,
        onStatusChange,
        pollingInterval,
        200 // maxAttempts
      );
    }

    // Return direct result for synchronous processing
    return result;
  } catch (error) {
    console.error(`Essay feedback error for ${dirName}:`, error);
    throw error;
  }
};

/**
 * LEGACY: Combined grammar and Hemingway analysis (still available but deprecated)
 * Use getComprehensiveAnalysis instead for new implementations
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share the document with
 * @param {string} userName - User name for personalized feedback
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Task information or direct result
 */
export const getCombinedGrammarHemingwayAnalysis = async (
  dirName,
  email = null,
  userName = null,
  options = {}
) => {
  try {
    const {
      useBackground = true,
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000,
    } = options;

    const url = new URL(
      `${API_BASE_URL}/combined_analysis/grammar_hemingway/${dirName}`
    );
    if (userName) {
      url.searchParams.append("user_name", userName);
    }
    if (email) {
      url.searchParams.append("email", email);
    }
    url.searchParams.append("use_background", useBackground.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to get combined analysis for ${dirName}`);
    }

    const result = await response.json();

    // If background processing is used and we got a task ID
    if (useBackground && result.task_id) {
      console.log(`📝 Started combined analysis task: ${result.task_id}`);

      // Poll until completion
      return await pollTaskUntilComplete(
        result.task_id,
        onProgress,
        onStatusChange,
        pollingInterval,
        200 // maxAttempts
      );
    }

    // Return direct result for synchronous processing
    return result;
  } catch (error) {
    console.error(
      `Combined grammar + Hemingway analysis error for ${dirName}:`,
      error
    );
    throw error;
  }
};

/**
 * Analyze leadership essay for grammar and spelling issues with background processing
 * @param {string} dirName - Directory name containing the extracted essays
 * @param {string} email - Optional email address to share the document with
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Grammar analysis results and Google Drive file links
 */
export const analyzeLeadershipGrammar = async (
  dirName,
  email = null,
  options = {}
) => {
  try {
    const {
      useBackground = true,
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000,
    } = options;

    // Build URL with optional email parameter
    const url = new URL(
      `${API_BASE_URL}/grammar_analysis/leadership/${dirName}`
    );
    if (email) {
      url.searchParams.append("email", email);
    }
    url.searchParams.append("use_background", useBackground.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Failed to analyze leadership grammar for ${dirName}`
      );
    }

    const result = await response.json();

    // If background processing is used and we got a task ID
    if (useBackground && result.task_id) {
      console.log(
        `👑 Started leadership grammar analysis task: ${result.task_id}`
      );

      // Poll until completion
      return await pollTaskUntilComplete(
        result.task_id,
        onProgress,
        onStatusChange,
        pollingInterval,
        200 // maxAttempts
      );
    }

    // Return direct result for synchronous processing
    return result;
  } catch (error) {
    console.error(`Leadership grammar analysis error for ${dirName}:`, error);
    throw error;
  }
};

/**
 * Utility function to create a task monitor with automatic UI updates
 * @param {string} taskId - Task ID to monitor
 * @param {Object} callbacks - UI callback functions
 * @returns {Promise<Object>} Task result
 */
export const createTaskMonitor = async (taskId, callbacks = {}) => {
  const {
    onStart = () => {},
    onProgress = () => {},
    onStatusChange = () => {},
    onComplete = () => {},
    onError = () => {},
  } = callbacks;

  try {
    onStart(taskId);

    const result = await pollTaskUntilComplete(
      taskId,
      onProgress,
      onStatusChange
    );

    onComplete(result);
    return result;
  } catch (error) {
    onError(error);
    throw error;
  }
};

/**
 * Get analysis history and manage multiple tasks
 * @param {Array} taskIds - Array of task IDs to check
 * @returns {Promise<Array>} Array of task statuses
 */
export const getMultipleTaskStatuses = async (taskIds) => {
  try {
    const statusPromises = taskIds.map((taskId) =>
      getTaskStatus(taskId).catch((error) => ({
        task_id: taskId,
        status: "ERROR",
        error: error.message,
      }))
    );

    return await Promise.all(statusPromises);
  } catch (error) {
    console.error("Error getting multiple task statuses:", error);
    throw error;
  }
};

/**
 * Cancel a running task (if supported by backend)
 * @param {string} taskId - Task ID to cancel
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelTask = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cancel-task/${taskId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to cancel task");
    }

    return await response.json();
  } catch (error) {
    console.error("Task cancellation error:", error);
    throw error;
  }
};

// Export all functions as default
export default {
  uploadEssayFile,
  getQueueStatus,
  getTaskStatus,
  pollTaskUntilComplete,
  getComprehensiveAnalysis, // For paid subscription users
  getLeadershipComprehensiveAnalysis, // For free trial users
  getEssayFeedback, // Legacy
  getCombinedGrammarHemingwayAnalysis, // Legacy
  analyzeLeadershipGrammar, // Legacy
  createTaskMonitor,
  getMultipleTaskStatuses,
  cancelTask,
};
