import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Feedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // First, check if feedback exists in sessionStorage
        const cachedFeedback = sessionStorage.getItem("cachedFeedback");

        if (cachedFeedback) {
          // Use the cached feedback if available
          console.log("Using cached feedback from sessionStorage");
          setFeedback(cachedFeedback);
          setLoading(false);
          return;
        }

        // Get the chat history path from sessionStorage
        const chatHistoryPath = sessionStorage.getItem("chatHistoryPath");

        if (!chatHistoryPath) {
          throw new Error("Chat history path not found");
        }
        else {
          console.log("Chat history path:", chatHistoryPath);
        }

        // Fetch feedback from the API
        const API_URL = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || "http://localhost:8001";
        const response = await axios.post(
          `${API_URL}/feedback_from_server`,
          {
            chatHistoryPath: chatHistoryPath
          }
        );

        const newFeedback = response.data.feedback;

        // Store the feedback in sessionStorage for future use
        sessionStorage.setItem("cachedFeedback", newFeedback);

        setFeedback(newFeedback);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again later.");
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Rest of the component remains the same
  // ...existing code...

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

  if (error) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

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