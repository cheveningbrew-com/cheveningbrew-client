/**
 * Utility functions for managing donation promotion feature flags
 */

/**
 * Check if the donation promotion is currently active
 * Uses environment variables for flexible control:
 * - REACT_APP_DONATION_PROMO_ACTIVE: Manual override (true/false)
 * - REACT_APP_DONATION_PROMO_END_DATE: Automatic expiry date (ISO string)
 * - REACT_APP_DONATION_PROMO_MESSAGE: Custom promotional message
 *
 * @returns {boolean} True if donation promotion is active
 */
export const isDonationPromoActive = () => {
  // Check if promotion is manually enabled
  const isActive = process.env.REACT_APP_DONATION_PROMO_ACTIVE === 'true';

  if (!isActive) {
    return false;
  }

  // Check if there's an end date and if we're still within the promo period
  const endDate = process.env.REACT_APP_DONATION_PROMO_END_DATE;

  if (endDate) {
    try {
      const now = new Date();
      const promoEndDate = new Date(endDate);

      // Return false if current time is past the end date
      if (now > promoEndDate) {
        console.log('🎉 Donation promotion has expired');
        return false;
      }

      console.log('🎉 Donation promotion is active until:', promoEndDate.toLocaleDateString());
      return true;
    } catch (error) {
      console.error('Invalid REACT_APP_DONATION_PROMO_END_DATE format:', endDate);
      // If date is invalid, fall back to just the boolean check
      return isActive;
    }
  }

  // If no end date is specified, rely only on the boolean flag
  console.log('🎉 Donation promotion is active (no end date specified)');
  return true;
};

/**
 * Get the promotional message for the donation campaign
 * @returns {string} Promotional message
 */
export const getDonationPromoMessage = () => {
  const customMessage = process.env.REACT_APP_DONATION_PROMO_MESSAGE;

  if (customMessage) {
    return customMessage;
  }

  // Default promotional message
  return "🎉 Limited Time: Get full analysis of all four essays for FREE!";
};

/**
 * Get the analysis configuration based on promotion status
 * @returns {Object} Analysis configuration object
 */
export const getAnalysisConfig = () => {
  if (isDonationPromoActive()) {
    return {
      endpoint: "donation",
      analysisType: "donation_comprehensive",
      estimatedTime: "25-30 minutes",
      userMessage: getDonationPromoMessage(),
      progressMessage: "🎉 Special Offer: Analyzing all four essays for free!",
      isPromotion: true
    };
  } else {
    return {
      endpoint: "leadership",
      analysisType: "leadership_comprehensive",
      estimatedTime: "12-15 minutes",
      userMessage: "🆓 Free Trial: Leadership essay analysis",
      progressMessage: "🆓 Free Trial: Analyzing your leadership essay",
      isPromotion: false
    };
  }
};

/**
 * Get the appropriate analysis function based on promotion status
 * @param {Object} analysisModules - Object containing analysis functions
 * @returns {Function} The appropriate analysis function
 */
export const getAnalysisFunction = (analysisModules) => {
  const { getDonationComprehensiveAnalysis, getLeadershipComprehensiveAnalysis } = analysisModules;

  if (isDonationPromoActive()) {
    return getDonationComprehensiveAnalysis;
  } else {
    return getLeadershipComprehensiveAnalysis;
  }
};

/**
 * Get display text for the current free offering
 * @returns {string} Description of what the free trial offers
 */
export const getFreeOfferingDescription = () => {
  if (isDonationPromoActive()) {
    return "For all four essays, one round of feedback";
  } else {
    return "For leadership essay only";
  }
};

/**
 * Get the donation promotion end date
 * @returns {Date|null} The promotion end date or null if not set/invalid
 */
export const getDonationPromoEndDate = () => {
  const endDate = process.env.REACT_APP_DONATION_PROMO_END_DATE;

  if (!endDate) {
    return null;
  }

  try {
    return new Date(endDate);
  } catch (error) {
    console.error('Invalid REACT_APP_DONATION_PROMO_END_DATE format:', endDate);
    return null;
  }
};

// Export configuration object for easy access
export const PROMO_CONFIG = {
  isDonationPromoActive,
  getDonationPromoMessage,
  getAnalysisConfig,
  getAnalysisFunction,
  getFreeOfferingDescription,
  getDonationPromoEndDate
};

export default PROMO_CONFIG;