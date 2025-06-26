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
 * Get Writer's Diet analysis of writing style
 * @param {string} dirName - Directory name containing the extraction
 * @returns {Promise<Object>} Analysis results with Google Drive links
 */
export const getWritingStyleAnalysis = async (dirName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/writers_diet_analysis/${dirName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to analyze writing style for ${dirName}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Writing style analysis error for ${dirName}:`, error);
    throw error;
  }
};

/**
 * Get essay feedback for Chevening essays
 * @param {string} dirName - Directory name containing the extraction
 * @returns {Promise<Object>} Feedback results with essay analysis
 */
export const getEssayFeedback = async (dirName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/essay_feedback/${dirName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get essay feedback for ${dirName}`);
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
 * Create a new Google Doc with optional content and sharing
 * @param {string} title - Title for the new document
 * @param {string} content - Optional content to add to the document
 * @param {string} shareWith - Optional email address to share the document with
 * @returns {Promise<Object>} Creation result with document ID and links
 */
export const createGoogleDoc = async (title, content = null, shareWith = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/google_docs/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
        share_with: shareWith
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to create Google Doc: ${title}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Google Doc creation error for ${title}:`, error);
    throw error;
  }
};

/**
 * Share a Google Doc with a specific email address
 * @param {string} docId - The Google Document ID to share
 * @param {string} email - Email address to share the document with
 * @param {string} role - Optional role: "writer", "reader", or "commenter" (defaults to "writer")
 * @returns {Promise<Object>} Sharing result with document ID and view link
 */
export const shareGoogleDoc = async (docId, email, role = "writer") => {
  try {
    const response = await fetch(`${API_BASE_URL}/google_docs/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doc_id: docId,
        email: email,
        role: role
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to share document ${docId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Google Doc sharing error for doc ${docId}:`, error);
    throw error;
  }
};

// Export all functions as default
export default {
  uploadEssayFile,
  getWritingStyleAnalysis,
  getEssayFeedback,
  getCombinedGrammarHemingwayAnalysis,
  createGoogleDoc,
  shareGoogleDoc
};