import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";
import ReactMarkdown from "react-markdown";

const About = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>About us</h1>
          <div className={styles.description}>
            <div className={`${styles.termsContent} ${styles.noLeftPadding}`}>
              <div className={styles.customMarkdown}>
                <ReactMarkdown>
                  Most Chevening scholars personally knew alumni who reviewed their essays and mocked their final interview. Not all deserving candidates have this privilege. cheveningbrew.com is an effort by Chevening alumni who wish to level the playing field: we democratise access to tacit knowledge. Practice with our carefully tuned AI interviewer, learn from the feedback, and get ready to ace your Chevening interview.
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default About;
