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

export default {
  uploadEssayFile,
  getWritingStyleAnalysis
};