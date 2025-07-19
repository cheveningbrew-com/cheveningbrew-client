/**
 * Enhanced API service for essay analysis with background processing support
 */

// Configure the API base URL
const API_BASE_URL = process.env.REACT_APP_ESSAY_API_URL || "http://localhost:8000";

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
      throw new Error(errorData.message || "Failed to upload file");
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
 * Poll task status until completion with progress callbacks
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

/**
 * Start essay feedback analysis with background processing
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share the assessment document with
 * @param {Object} options - Analysis options
 * @param {string} userName - Optional user name for personalized feedback
 * @returns {Promise<Object>} Task information or direct result
 */
export const getEssayFeedback = async (dirName, email = null, userName = null, options = {}) => {
  try {
    const {
      useBackground = true,
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000
    } = options;
    
    // Build URL with parameters
    const url = new URL(`${API_BASE_URL}/essay_feedback/${dirName}`);
    if (userName) {
      url.searchParams.append('user_name', userName);
    }
    if (email) {
      url.searchParams.append('email', email);
    }
    url.searchParams.append('use_background', useBackground.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to get essay feedback for ${dirName}`);
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
        pollingInterval
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
 * Start combined grammar and Hemingway analysis with background processing
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share the document with
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Task information or direct result
 */
export const getCombinedGrammarHemingwayAnalysis = async (dirName, email = null, userName = null, options = {}) => {
  try {
    const {
      useBackground = true,
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000
    } = options;
    
    const url = new URL(`${API_BASE_URL}/combined_analysis/grammar_hemingway/${dirName}`);
    if (userName) {
      url.searchParams.append('user_name', userName);
    }
    if (email) {
      url.searchParams.append('email', email);
    }
    url.searchParams.append('use_background', useBackground.toString());

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
        pollingInterval
      );
    }
    
    // Return direct result for synchronous processing
    return result;
    
  } catch (error) {
    console.error(`Combined grammar + Hemingway analysis error for ${dirName}:`, error);
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
export const analyzeLeadershipGrammar = async (dirName, email = null, options = {}) => {
  try {
    const {
      useBackground = true,
      onProgress = null,
      onStatusChange = null,
      pollingInterval = 10000
    } = options;
    
    // Build URL with optional email parameter
    const url = new URL(`${API_BASE_URL}/grammar_analysis/leadership/${dirName}`);
    if (email) {
      url.searchParams.append('email', email);
    }
    url.searchParams.append('use_background', useBackground.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to analyze leadership grammar for ${dirName}`);
    }
    
    const result = await response.json();
    
    // If background processing is used and we got a task ID
    if (useBackground && result.task_id) {
      console.log(`👑 Started leadership grammar analysis task: ${result.task_id}`);
      
      // Poll until completion
      return await pollTaskUntilComplete(
        result.task_id,
        onProgress,
        onStatusChange,
        pollingInterval
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
    onError = () => {}
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
    const statusPromises = taskIds.map(taskId => 
      getTaskStatus(taskId).catch(error => ({
        task_id: taskId,
        status: 'ERROR',
        error: error.message
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
      method: 'POST'
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
  getEssayFeedback,
  getCombinedGrammarHemingwayAnalysis,
  analyzeLeadershipGrammar,
  createTaskMonitor,
  getMultipleTaskStatuses,
  cancelTask
};