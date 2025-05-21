import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import termsPolicyText from "./TermsStatement";
import styles from "../SupportPages.module.css";

const Terms = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Split the markdown content into sections based on h2 headers
  const sections = termsPolicyText.split(/(?=## )/).filter(Boolean);

  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Terms and Conditions</h1>
          <div className={styles.description}>
            {/* First section is always visible */}
            <div className={styles.termsContent}>
              <ReactMarkdown>{sections[0]}</ReactMarkdown>
            </div>

            {/* Rest of the sections are collapsible */}
            {sections.slice(1).map((section, index) => {
              const sectionId = `section-${index + 1}`;
              const isOpen = openSections[sectionId];
              const title = section.split('\n')[0].replace('## ', '');

              return (
                <div key={sectionId} className={styles.termsSection}>
                  <button 
                    className={`${styles.termsHeader} ${isOpen ? styles.open : ''}`}
                    onClick={() => toggleSection(sectionId)}
                  >
                    <span>{title}</span>
                    <span className={styles.arrow}>{isOpen ? '▼' : '▶'}</span>
                  </button>
                  <div className={`${styles.termsContent} ${isOpen ? styles.open : ''}`}>
                    <ReactMarkdown>{section}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Terms;
