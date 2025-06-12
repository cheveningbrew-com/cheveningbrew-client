import { STORAGE_KEYS } from '../constants/storage';

const API_BASE_URL = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || 'https://www.cheveningbrew.com/'; 
const DB_SERVER_URL = process.env.REACT_APP_DB_SERVER_URL || 'https://www.cheveningbrew.com/api/db'; // Ensure this is in your .env

export const uploadEssay = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
};

export const getFeedback = async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/feedback?session_id=${sessionId}`);
    return response.json();
};

export const sendAudioChunk = async (audioBlob, sessionId) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('session_id', sessionId);

    const response = await fetch(`${API_BASE_URL}/interview/audio`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
};

// Create a user (if not exists, update last login)
export const createUser = async (email, name, id, picture, auth_token) => {
    try {
      const response = await fetch(`${DB_SERVER_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, id, picture, auth_token}), // Convert to JSON
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating user:", error.message);
      throw error;
    }
  };

// Get user ID from session storage
export const getUserId = () => sessionStorage.getItem(STORAGE_KEYS.USER_ID);

// Get user details from database
export const readUserField = async (user_id, field) => {
    try {
        const response = await fetch(`${DB_SERVER_URL}/users/read_field`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id, field }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}, Details: ${errorText}`);
        }

        const data = await response.json();
        // console.log("User Field:", data);

        // Ensure boolean values are properly handled
        if (field === "payment_completed" && data[field] === null) {
            return false; // Convert null to false
        }

        return data[field]; 
    } catch (error) {
        console.error("Error fetching user field:", error.message);
        return null;
    }
};

// FIXED: Accept user_id, field, and value
export const updateUserField = async (user_id, field, value) => {
    if (!user_id) {
      throw new Error("User ID is required");
    }
  
    let finalValue = value;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      finalValue = JSON.stringify(value);
    }
  
    try {
      const response = await fetch(`${DB_SERVER_URL}/users/update_field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, field, value: finalValue }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error(`Failed to update user field: ${response.statusText}`);
      }
  
      return response.json();
    } catch (error) {
      console.error('Update user field error:', error);
      throw error;
    }
  };
  
// Clear user data from session storage and database
export const clearUser = async () => {
    const user_id = getUserId();
    if (!user_id) {
        throw new Error("User email not found in session storage");
    }

    const response = await fetch(`${DB_SERVER_URL}/remove_user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: user_id,
        }),
    });

    return response.json();
};

// Clear user data like without name,email and id  from   database
export const SignOut_clearUser = async () => {
    try {
        const user_id = getUserId();

        if (!user_id) {
            throw new Error("User email not found in session storage");
        }

        const response = await fetch(`${DB_SERVER_URL}/users/signout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user_id }),
        });

        if (!response.ok) {
            throw new Error("Failed to sign out user");
        }

        return await response.json();
    } catch (error) {
        console.error("Error signing out:", error);
        return { error: error.message };
    }
};

// Accept user subscription details as parameters
export const subscribeUser = async ({ user_id, plan, price, attempts }) => {
    if (!user_id || !plan || price == null || attempts == null) {
        throw new Error("Missing subscription details");
    }

    const response = await fetch(`${DB_SERVER_URL}/subscriptions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, plan, price, attempts }),
    });

    if (!response.ok) {
        throw new Error("Subscription failed");
    }

    return response.json();
};

// Get a specific field from a user's subscription
export const getUserSubscription = async ({ user_id, field }) => {
    if (!user_id || !field) {
        throw new Error("Missing id or field");
    }

    const response = await fetch(`${DB_SERVER_URL}/subscriptions/read_field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, field }),
    });

    if (!response.ok) {
        throw new Error("Failed to read subscription field");
    }

    return response.json();
};

// Update a specific field in a user's subscription
export const updateUserSubscription = async ({ field, value }) => {
    const user_id = getUserId();

    // Debug log for quick inspection
    console.log("updateUserSubscription called with:", {
        user_id: user_id,
        field,
        value,
    });

    // Proper null/undefined checks
    if (user_id == null || field == null || value === undefined) {
        throw new Error("Missing id, field, or value");
    }

    const response = await fetch(`${DB_SERVER_URL}/subscriptions/update_field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user_id, field, value }),
    });

    if (!response.ok) {
        throw new Error("Failed to update subscription");
    }

    return response.json();
};