import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import { getUserId, readUserField } from "../../services/api";
import ReactMarkdown from "react-markdown";

const Feedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch essay analysis feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setError("User session not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Check for cached essay analysis feedback
        const cachedFeedback = await readUserField(userId, "essay_feedback");
        if (cachedFeedback) {
          console.log("Using cached essay feedback");
          setFeedback(cachedFeedback);
          setLoading(false);
          return;
        }

        // If no feedback available, show message
        setError("No essay analysis found. Please upload your essay first.");
        setLoading(false);

      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load essay analysis. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <div className={styles.spinner}></div>
            <p>Loading your essay analysis...</p>
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

  return (
    <MainLayout>
      <div className={styles.feedbackWrapper}>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <div className={styles.title}>Essay Analysis Results</div>
            {feedback ? (
              <div className={styles.markdownContent}>
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            ) : (
              <div className={styles.feedbackSections}>
                <p>No essay analysis available. Please upload your Chevening essays to receive detailed feedback and analysis.</p>
                <div className={styles.uploadPrompt}>
                  <h3>To get started:</h3>
                  <ol>
                    <li>Go to the Upload page</li>
                    <li>Upload your Chevening application essays (PDF format)</li>
                    <li>Receive detailed writing style analysis and feedback</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </ActionBox>
      </div>
    </MainLayout>
  );
};

export default Feedback;