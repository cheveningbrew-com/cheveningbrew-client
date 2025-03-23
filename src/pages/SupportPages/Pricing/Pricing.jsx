import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";

const Pricing = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Pricing</h1>
          <p className={styles.description}>
            Explore our pricing plans to find the perfect fit for your needs.
            Each interview slot is 15 minutes long, covering the breadth of the
            Chevening interview.
          </p>
          <div className={styles.pricingContainer}>
            <div className={styles.pricingContent}>
              <h3 className={styles.pricingTitle}>Basic</h3>
              Two slots for $10
            </div>
            <div className={styles.pricingContent}>
              <h3 className={styles.pricingTitle}>Standard</h3>
              Five slots for $20
            </div>
            <div className={styles.pricingContent}>
              <h3 className={styles.pricingTitle}>Premium</h3>
              Ten slots for $30
            </div>
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Pricing;
