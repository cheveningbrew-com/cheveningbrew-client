import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
import axios from "axios";
import { completeInterview, getUserId, readUserField, getUserInterviews } from "../../services/api";
import ReactMarkdown from "react-markdown";
import { downloadFeedbackPDFs } from "../../utils/downloadFeedback";

const Feedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewList, setInterviewList] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  // Load list of interviews with proper error handling
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setError("User session not found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await getUserInterviews(userId);
        if (!data || data.length === 0) {
          setInterviewList([]);
          setError("No interview attempts found.");
        } else {
          setInterviewList(data);
        }
      } catch (err) {
        console.error("Failed to load interview list:", err);
        setError("Failed to load interview history. Please try again later.");
      }
    };
    loadAttempts();
  }, []);

  // Fetch feedback with proper error handling and state management
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setError("User session not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Check for cached feedback first
        const cachedFeedback = await readUserField(userId, "cached_feedback");
        if (cachedFeedback) {
          console.log("Using cached feedback");
          setFeedback(cachedFeedback);
          setLoading(false);
          return;
        }

        const chatHistoryPath = sessionStorage.getItem("chatHistoryPath");
        if (!chatHistoryPath) {
          setError("No interview session found. Please start a new interview.");
          setLoading(false);
          return;
        }

        console.log("Fetching feedback from server...");
        const API_URL = process.env.REACT_APP_CHEVENINGBREW_SERVER_URL || "http://localhost:8001";
        const response = await axios.post(
          `${API_URL}/feedback_from_server`,
          { chatHistoryPath },
          { timeout: 10000 }
        );

        if (!response.data?.feedback) {
          throw new Error("No feedback data received from server.");
        }

        const newFeedback = response.data.feedback;
        await completeInterview("feedback", newFeedback);
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

  // Auto-select the latest interview if none selected
  useEffect(() => {
    if (interviewList.length > 0 && !feedback && selectedAttempt === null) {
      const latest = interviewList[interviewList.length - 1];
      setSelectedAttempt(latest.attempt_number);
      setFeedback(latest.feedback);
    }
  }, [interviewList, feedback, selectedAttempt]);

  const handleDownloadAll = () => {
    if (interviewList.length === 0) {
      setError("No interviews available to download.");
      return;
    }
    downloadFeedbackPDFs(interviewList);
  };

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
            <div className={styles.title}>Interview Performance Feedback</div>
            {feedback ? (
              <div className={styles.markdownContent}>
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            ) : (
              <div className={styles.feedbackSections}>
                <p>No feedback available. Please complete an interview to receive feedback.</p>
              </div>
            )}
          </div>
          {interviewList.length > 0 ? (
            <div className={styles.bottomContainer}>
              <div className={styles.attemptGroup}>
                <div className={styles.attemptTitle}>Select Attempt:</div>
                <div className={styles.attemptButtons}>
                  {interviewList.map((item) => (
                    <button
                      key={item.attempt_number}
                      className={`${styles.attemptButton} ${
                        selectedAttempt === item.attempt_number ? styles.active : ""
                      }`}
                      onClick={() => {
                        setSelectedAttempt(item.attempt_number);
                        setFeedback(item.feedback);
                      }}
                    >
                      {item.attempt_number}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleDownloadAll} className={styles.downloadButton}>
                Download All Attempts (PDF)
              </button>
            </div>
          ) : (
            <div className={styles.bottomContainer}>
              <p className={styles.noAttemptsMessage}>
                No interview attempts found. Start a new interview to receive feedback.
              </p>
            </div>
          )}
        </ActionBox>
      </div>
    </MainLayout>
  );
};

export default Feedback;