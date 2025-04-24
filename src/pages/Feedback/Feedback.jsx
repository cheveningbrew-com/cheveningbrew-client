import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import axios from "axios";
import { completeInterview, getUserId, readUserField } from "../../services/api";
import ReactMarkdown from "react-markdown";

const Feedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const user_id = getUserId();
        
        // 1. Check for cached feedback first
        const cachedFeedback = await readUserField(user_id, "cached_feedback");
        if (cachedFeedback) {
          console.log("Using cached feedback");
          setFeedback(cachedFeedback);
          setLoading(false);
          return;
        }

        // 2. If no cached feedback, fetch from server
        const chatHistoryPath = sessionStorage.getItem("chatHistoryPath");
        if (!chatHistoryPath) {
          throw new Error("Chat history path not found in session storage.");
        }

        console.log("Fetching feedback from server...");
        const API_URL = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || "http://localhost:8001";
        const response = await axios.post(
          `${API_URL}/feedback_from_server`,
          { chatHistoryPath },
          { timeout: 10000 } // Timeout after 10 seconds
        );

        if (!response.data?.feedback) {
          throw new Error("No feedback data received from server.");
        }

        const newFeedback = response.data.feedback;
        
        // 3. Cache the new feedback
        // sessionStorage.setItem("cached_feedback", newFeedback);
        await completeInterview("feedback", newFeedback);

        console.log("Feedback fetched and cached successfully.");
        
        setFeedback(newFeedback);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load feedback. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Loading State
  if (loading) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <div className={styles.spinner}></div>
            <p>Generating your feedback...</p>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  // Success State
  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.feedbackContent} customScroll`}>
          <div className={styles.title}>Interview Performance Feedback</div>
          {feedback ? (
            <div className={styles.markdownContent}>
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          ) : (
            <div className={styles.feedbackSections}>
              <p>No feedback available.</p>
            </div>
          )}
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Feedback;