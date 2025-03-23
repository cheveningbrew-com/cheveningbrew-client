import React from "react";
import ReactMarkdown from "react-markdown";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";
import privacyPolicyText from "./PrivacyStatement";

const Privacy = () => {

  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <div>
            <h1 className={styles.pageTitle}>Privacy Policy</h1>
          </div>
          <div className={styles.description}>
            <ReactMarkdown>{privacyPolicyText}</ReactMarkdown>
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Privacy;
