import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";

const Help = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={styles.supportContent}>
          <h1 className={styles.pageTitle}>FAQs and further help</h1>
          <p className={styles.description}>
            <br />
            <br />
            <strong> Q: I have done the interview once and I want to do it again. How can I do that? </strong>
            <br />
            A: Simply, sign out and sign in again to retake the interview.
            <br />
            <br />
            <strong>Q: I have done my interview and I am unsatisfied. How do I get a refund?</strong>
            <br />
            A: Please email as at help@cheveningbrew.com with the topic "REFUND REQUEST" and we will get back to you.
            <br />
            <br />
          </p>

          <p className={styles.description}>
            If you need any other assistance, please contact us at{" "}
            <a href="mailto:">
              <strong>
                <u>
                  <span className={styles.email}>help@cheveningbrew.com</span>
                </u>
              </strong>
            </a>
          </p>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Help;
