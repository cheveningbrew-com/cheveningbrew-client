const API_BASE_URL = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || 'https://www.cheveningbrew.com/'; // Update this with your FastAPI server URL
const REACT_APP_DB_SERVER_URL = process.env.REACT_APP_DB_SERVER_URL || 'https://www.cheveningbrew.com/'; // Update this with your Express server URL

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

export const updateUserField = async (field, value) => {
    const userEmail = sessionStorage.getItem("userEmail");

    const response = await fetch(`${REACT_APP_DB_SERVER_URL}/update_user_field`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userEmail,
            field: field,
            value: String(typeof value === 'object' ? JSON.stringify(value) : value)
        }),
    });

    return response.json();
};