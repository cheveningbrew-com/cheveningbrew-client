import React from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Feedback.module.css";
// import axios from "axios";
// import { completeInterview, getUserId, readUserField, getUserInterviews } from "../../services/api";
import ReactMarkdown from "react-markdown";
// import { downloadFeedbackPDFs } from "../../utils/downloadFeedback";

const Feedback = () => {
  // Static demo feedback
  const demoFeedback = `
# Interview Feedback

## Overall Performance
You presented yourself well during the interview. Your answers demonstrated good knowledge of your field and the Chevening program.

## Strengths
* Clear communication skills
* Good understanding of your chosen course
* Strong examples of leadership

## Areas for Improvement
* Provide more specific examples when discussing your achievements
* Further develop your post-study plan
* Connect your experiences more directly to your future goals

## Conclusion
Based on this mock interview, you have shown good potential as a Chevening candidate. Focus on the areas for improvement to strengthen your application.
  `;

  return (
    <MainLayout>
      <div className={styles.feedbackWrapper}>
        <ActionBox>
          <div className={`${styles.feedbackContent} customScroll`}>
            <div className={styles.title}>Interview Performance Feedback</div>
            <div className={styles.markdownContent}>
              <ReactMarkdown>{demoFeedback}</ReactMarkdown>
            </div>
          </div>
          <div className={styles.bottomContainer}>
            <div className={styles.attemptGroup}>
              <div className={styles.attemptTitle}>Select Attempt:</div>
              <div className={styles.attemptButtons}>
                <button className={`${styles.attemptButton} ${styles.active}`}>
                  1
                </button>
              </div>
            </div>
            <button className={styles.downloadButton} onClick={() => alert("Download feature disabled in demo mode")}>
              Download Sample Feedback (PDF)
            </button>
          </div>
        </ActionBox>
      </div>
    </MainLayout>
  );
};

export default Feedback;