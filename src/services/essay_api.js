/**
 * Simplified API service for essay analysis
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
 * Get essay feedback for Chevening essays with optional email sharing
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share the assessment document with
 * @returns {Promise<Object>} Feedback results with essay analysis and Google Drive links
 */
export const getEssayFeedback = async (dirName, email = null) => {
  try {
    // Build URL with optional email parameter
    let url = `${API_BASE_URL}/essay_feedback/${dirName}`;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to get essay feedback for ${dirName}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Essay feedback error for ${dirName}:`, error);
    throw error;
  }
};

/**
 * Get combined grammar and Hemingway analysis
 * @param {string} dirName - Directory name containing the extraction
 * @param {string} email - Optional email address to share the document with
 * @returns {Promise<Object>} Combined analysis results with Google Drive links
 */
export const getCombinedGrammarHemingwayAnalysis = async (dirName, email = null) => {
  try {
    const url = new URL(`${API_BASE_URL}/combined_analysis/grammar_hemingway/${dirName}`);
    if (email) {
      url.searchParams.append('email', email);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to get combined analysis for ${dirName}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Combined grammar + Hemingway analysis error for ${dirName}:`, error);
    throw error;
  }
};

/**
 * Analyze leadership essay for grammar and spelling issues
 * Creates a DOCX file with Word comments, uploads to Google Drive and shares
 * @param {string} dirName - Directory name containing the extracted essays
 * @param {string} email - Optional email address to share the document with
 * @returns {Promise<Object>} Grammar analysis results and Google Drive file links
 */
export const analyzeLeadershipGrammar = async (dirName, email = null) => {
  try {
    // Build URL with optional email parameter
    const url = new URL(`${API_BASE_URL}/grammar_analysis/leadership/${dirName}`);
    if (email) {
      url.searchParams.append('email', email);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to analyze leadership grammar for ${dirName}`);
    }
    
    console.log(`Leadership grammar analysis completed for ${dirName}`);
    
    return await response.json();
    
  } catch (error) {
    console.error(`Leadership grammar analysis error for ${dirName}:`, error);
    throw error;
  }
};


// Export all functions as default
export default {
  uploadEssayFile,
  getEssayFeedback,
  getCombinedGrammarHemingwayAnalysis,
  analyzeLeadershipGrammar
};