const API_BASE_URL = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || 'https://www.cheveningbrew.com/'; 
const REACT_APP_DB_SERVER_URL = 'http://localhost:5002'; // Ensure this is in your .env

export const uploadEssay = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
};

export const startInterview = async () => {
    const response = await fetch(`${API_BASE_URL}/interview`, {
        method: 'POST',
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
      const response = await fetch(`${process.env.REACT_APP_DB_SERVER_URL}/create_user`, {
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

// Get user Email from session storage
export const getUserEmail = () => sessionStorage.getItem("userEmail");

// Get user details from database
export const readUserField = async (email, field) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_DB_SERVER_URL}/read_user_field`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, field }),
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

// Update user field in database storage
export const updateUserField = async (field, value) => {
    const userEmail = getUserEmail();

    if (!userEmail) {
        throw new Error("User email not found in session storage");
    }

    const response = await fetch(`${process.env.REACT_APP_DB_SERVER_URL}/update_user_field`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userEmail,  // Ensure the email is sent
            field,
            value: typeof value === 'object' ? JSON.stringify(value) : value,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update user field: ${response.statusText}`);
    }

    return response.json();
};

// Clear user data from session storage and database
export const clearUser = async () => {
    const userEmail = getUserEmail();

    if (!userEmail) {
        throw new Error("User email not found in session storage");
    }

    const response = await fetch(`${REACT_APP_DB_SERVER_URL}/remove_user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userEmail,
        }),
    });

    return response.json();
};

// Clear user data like without name,email and id  from   database
export const SignOut_clearUser = async () => {
    try {
        const userEmail = getUserEmail();

        if (!userEmail) {
            throw new Error("User email not found in session storage");
        }

        const response = await fetch(`${REACT_APP_DB_SERVER_URL}/SignOut_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
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
export const subscribeUser = async ({ email, plan, price, attempts }) => {
    if (!email || !plan || price == null || attempts == null) {
        throw new Error("Missing subscription details");
    }

    const response = await fetch(`${REACT_APP_DB_SERVER_URL}/subscribe_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan, price, attempts }),
    });

    if (!response.ok) {
        throw new Error("Subscription failed");
    }

    return response.json();
};

// Get a specific field from a user's subscription
export const getUserSubscription = async ({ email, field }) => {
    if (!email || !field) {
        throw new Error("Missing id or field");
    }

    const response = await fetch(`${REACT_APP_DB_SERVER_URL}/read_Subcription_field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, field }),
    });

    if (!response.ok) {
        throw new Error("Failed to read subscription field");
    }

    return response.json();
};

// Update a specific field in a user's subscription
export const updateUserSubscription = async ({ field, value }) => {
    const userEmail = getUserEmail();

    // Debug log for quick inspection
    console.log("updateUserSubscription called with:", {
        email: userEmail,
        field,
        value,
    });

    // Proper null/undefined checks
    if (userEmail == null || field == null || value === undefined) {
        throw new Error("Missing email, field, or value");
    }

    const response = await fetch(`${REACT_APP_DB_SERVER_URL}/update_Subcription_field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, field, value }),
    });

    if (!response.ok) {
        throw new Error("Failed to update subscription");
    }

    return response.json();
};
