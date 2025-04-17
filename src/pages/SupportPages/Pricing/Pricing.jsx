import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";
import Price from "../../../components/Price_Popup/Price";

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
           <Price/>
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Pricing;
