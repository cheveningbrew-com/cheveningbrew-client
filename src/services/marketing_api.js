/**
 * Marketing API service for CheveningBrew lead generation
 * Handles email marketing and guide distribution
 */

// Configure the marketing API base URL
const MARKETING_API_BASE_URL = process.env.REACT_APP_MARKETING_API_URL || 'http://localhost:8000';

/**
 * Send Chevening essay guide to a lead
 * @param {string} email - Lead's email address (required)
 * @param {string} name - Lead's name (optional)
 * @param {string} source - Traffic source (optional, defaults to "website")
 * @returns {Promise<Object>} Send guide response
 */
export const sendGuide = async (email, name = null, source = "website") => {
    try {
        if (!email) {
            throw new Error("Email is required");
        }

        const response = await fetch(`${MARKETING_API_BASE_URL}/send-guide`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: name,
                source: source
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to send guide');
        }

        return await response.json();
    } catch (error) {
        console.error('Send guide error:', error);
        throw error;
    }
};


/**
 * Utility function to validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Send guide with form validation and error handling
 * @param {Object} formData - Form data containing email, name, source
 * @returns {Promise<Object>} Validation and send result
 */
export const sendGuideWithValidation = async (formData) => {
    try {
        const { email, name, source = "website" } = formData;

        // Validate email
        if (!email || !isValidEmail(email)) {
            throw new Error("Please enter a valid email address");
        }

        // Optional name validation
        if (name && name.trim().length < 2) {
            throw new Error("Name must be at least 2 characters long");
        }

        return await sendGuide(email.trim(), name?.trim() || null, source);
    } catch (error) {
        console.error('Send guide with validation error:', error);
        throw error;
    }
};

// Export all functions as default
export default {
    sendGuide,
    isValidEmail,
    sendGuideWithValidation,
};