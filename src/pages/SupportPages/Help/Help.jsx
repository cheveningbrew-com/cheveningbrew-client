import React, { useState } from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";

const Help = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const faqSections = [
    {
      title: "I have run out of attempts but want to retake the interview",
      content: "Simply, sign out and sign in again. You can choose a new plan."
    },
    {
      title: "I am unhappy with my purchase, I want a refund",
      content: "Please email us at help@cheveningbrew.com with the topic \"REFUND REQUEST\", indicate the payment ID you received from us at the time of purchase in the email. We will get back to you in 3-5 working days."
    },
    {
      title: "Other queries",
      content: (
        <>
          If you need any other assistance, please contact us at{" "}
          <a href="mailto:help@cheveningbrew.com">
            <strong>
              <u>
                <span className={styles.email}>help@cheveningbrew.com</span>
              </u>
            </strong>
          </a>
        </>
      )
    }
  ];

  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>FAQs and further help</h1>
          <div className={styles.description}>
            {/* Introduction section always visible */}
            {/* <div className={styles.termsContent}>
              <p className={styles.privacyParagraph}>
                Welcome to our help center. Below you'll find answers to frequently asked questions and information about our services.
              </p>
            </div> */}

            {/* FAQ sections as collapsible items */}
            {faqSections.map((section, index) => {
              const sectionId = `section-${index}`;
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
                    {section.content}
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

export default Help;
