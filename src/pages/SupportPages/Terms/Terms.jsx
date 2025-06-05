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
  
  // Parse the first section (introduction)
  const introContent = sections[0];
  
  // Create an array of section objects similar to faqSections in Help.jsx
  const termsContentSections = sections.slice(1).map((section) => {
    // Extract title from the first line
    const title = section.split('\n')[0].replace('## ', '');
    // Remove the title line from the content to prevent duplication
    const contentWithoutTitle = section.split('\n').slice(1).join('\n').trim();
    
    return {
      title: title,
      content: contentWithoutTitle
    };
  });

  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Terms and conditions</h1>
          <div className={styles.description}>
            {/* First section is always visible */}
            <div className={`${styles.termsContent} ${styles.noLeftPadding}`}>
              <div className={styles.customMarkdown}>
                <ReactMarkdown>{introContent}</ReactMarkdown>
              </div>
            </div>

            {/* Rest of the sections are collapsible - styled like faqSections in Help.jsx */}
            {termsContentSections.map((section, index) => {
              const sectionId = `section-${index + 1}`;
              const isOpen = openSections[sectionId];

              return (
                <div key={sectionId} className={styles.termsSection}>
                  <button 
                    className={`${styles.termsHeader} ${isOpen ? styles.open : ''}`}
                    onClick={() => toggleSection(sectionId)}
                  >
                    <span>{section.title}</span>
                    <span className={styles.arrow}>{isOpen ? '▼' : '▶'}</span>
                  </button>
                  <div className={`${styles.termsContent} ${isOpen ? styles.open : ''}`}>
                    {/* Render content directly to match Help.jsx styling */}
                    <div className={styles.customMarkdown}>
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
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
