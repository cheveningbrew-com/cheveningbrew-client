import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";

const About = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>About CheveningBrew</h1>
          <p className={styles.description}>
            Most Chevening scholars personally knew an alumnus who helped them
            prepare for their final interview. Not all deserving candidates have
            this privilege. cheveningbrew.com is an effort by
            Chevening alumni who wish to level the playing field: we democratise access to tacit knowledge. Practice with our carefully tuned AI interviewer, learn from the feedback, and get ready to ace your Chevening interview.
          </p>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default About;
