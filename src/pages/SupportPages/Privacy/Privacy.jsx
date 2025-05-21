import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";
import privacyPolicyText from "./PrivacyStatement";

const Privacy = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Split the privacy policy text into sections
  const sections = privacyPolicyText.split('##').filter(Boolean);

  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <div className={styles.description}>
            {/* First section is always visible */}
            <div className={styles.termsContent}>
              <ReactMarkdown>{sections[0]}</ReactMarkdown>
            </div>

            {/* Rest of the sections are collapsible */}
            {sections.slice(1).map((section, index) => {
              const [title, ...content] = section.split('\n');
              const sectionId = `section-${index + 1}`;
              const isOpen = openSections[sectionId];

              return (
                <div key={sectionId} className={styles.termsSection}>
                  <button 
                    className={`${styles.termsHeader} ${isOpen ? styles.open : ''}`}
                    onClick={() => toggleSection(sectionId)}
                  >
                    <span>{title.trim()}</span>
                    <span className={styles.arrow}>{isOpen ? '▼' : '▶'}</span>
                  </button>
                  <div className={`${styles.termsContent} ${isOpen ? styles.open : ''}`}>
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p className={styles.privacyParagraph} {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className={styles.privacyList} {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className={styles.privacyListItem} {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className={styles.privacyHighlight} {...props} />
                        ),
                      }}
                    >
                      {content.join('\n')}
                    </ReactMarkdown>
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

export default Privacy;
