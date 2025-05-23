/**
 * Validates the JWT token stored in sessionStorage
 * @returns {boolean} True if token is valid and not expired
 */
export const validateToken = () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Parse the token payload
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join('')
        )
      );

      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  /* Clears all authentication data from sessionStorage*/
  export const clearAuthData = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userEmail');
};