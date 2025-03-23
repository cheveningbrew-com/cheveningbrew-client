import React from "react";
import ReactMarkdown from "react-markdown";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import termsPolicyText from "./TermsStatement";
import styles from "../SupportPages.module.css";

const Terms = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Terms and Conditions</h1>
          <div className={styles.description}>
            <ReactMarkdown>{termsPolicyText}</ReactMarkdown>
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Terms;
