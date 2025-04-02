const API_BASE_URL = process.env.REACT_APP_DB_SERVER_URL || "http://localhost:8000";
const REACT_APP_DB_SERVER_URL = 'http://localhost:8000'; // Ensure this is in your .env

export const uploadEssay = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
};

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
        console.log("User Field:", data);

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

export const updateUserField = async (field, value) => {
    const userEmail = sessionStorage.getItem("userEmail");

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



export const clearUser = async () => {
    const userEmail = sessionStorage.getItem("userEmail");

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


export const SignOut_clearUser = async () => {
    try {
        const userEmail = sessionStorage.getItem("userEmail");

        if (!userEmail) {
            throw new Error("User email not found in session storage");
        }

        const response = await fetch(`${REACT_APP_DB_SERVER_URL}/SignOut_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
