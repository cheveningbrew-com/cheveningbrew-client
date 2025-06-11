import axios from "axios";

export class GoogleOAuthService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
    this.apiUrl = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || "http://localhost:8001";
  }

  /**
   * Authenticate user with the backend using Google OAuth token
   * @param {string} accessToken - The access token from Google OAuth
   * @returns {Promise<Object>} Authentication result from backend
   */
  async authenticate(accessToken) {
    try {
      const userInfo = await this.getUserInfo(accessToken);

      // Send the access token and user info to your backend
      const response = await axios.post(`${this.apiUrl}/auth/google`, {
        access_token: accessToken,
        user_info: userInfo,
      });

      return response.data;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    }
  }

  /**
   * Get user profile information using the access token
   * @param {string} accessToken - The access token from Google OAuth
   * @returns {Promise<Object>} User profile information
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  }

  /**
   * Handle successful login
   * @param {Object} credentialResponse - The response from Google OAuth
   * @returns {Promise<Object>} User profile information
   */
  async handleLoginSuccess(credentialResponse) {
    try {
      const { access_token } = credentialResponse;
      const userInfo = await this.getUserInfo(access_token);

      // You can add user session logic here
      return {
        accessToken: access_token,
        userInfo,
      };
    } catch (error) {
      console.error("Login processing failed:", error);
      throw error;
    }
  }
}

const googleOAuthService = new GoogleOAuthService();
export default googleOAuthService;
