import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";
import Price from "../../../components/PricePopUp/Price";

const Pricing = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} ${styles.pricingPage} ${styles.pricingPageMobile} customScroll`}>
          <h1 className={styles.pageTitle}>Pricing</h1>
          
          <div className="mobileScrollContainer">
            <Price showContainerBox={true} />
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default Pricing;