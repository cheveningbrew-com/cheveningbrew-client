import React from 'react'
import styles from './Price.module.css'
import PaymentBox from '../PaymentBox/PaymentBox'
import { updateUserField } from '../../services/api'

const handlePaymentComplete = (orderId) => {
  console.log("Payment completed. Order ID:", orderId);
  // Store payment status in sessionStorage
  sessionStorage.setItem("payment_completed", "true");
  updateUserField("payment_completed", true);
  alert("Payment successful! You can now access the app.");
}
const handlePaymentError = (error) => {
  console.error("Payment error:", error);
  alert("Payment failed. Please try again.");
}   
const handlePaymentDismissed = () => {
  console.log("Payment dismissed.");
  alert("Payment dismissed. Please try again.");
}

export default function Price() {
  return (
    <div className={styles.paymentPopupOverlay}>
      <div className={styles.priceBox}>
        <div className={styles.paymentPopup}>
          <div className={styles.paymentPopupHeader}>
            <h2 className={styles.h2}>Basic</h2>
          </div>
          <div className={`${styles.pricingContent} customScroll`}>
            <div className={styles.pricingCard}>
              <p className={styles.pricingText}>
              one-time fee of $5 for a 15 min
              interview
              </p>
            </div>
            <PaymentBox
              onPaymentComplete={handlePaymentComplete}
              onPaymentError={handlePaymentError}
              onPaymentDismissed={handlePaymentDismissed}
            />
          </div>
        </div>
        <div className={styles.paymentPopup}>
          <div className={styles.paymentPopupHeader}>
            <h2 className={styles.h2}>Standed</h2>
          </div>
          <div className={`${styles.pricingContent} customScroll`}>
            <div className={styles.pricingCard}>
              <p className={styles.pricingText}>
              one-time fee of $10 for a 30 min
              interview
              </p>
            </div>
            <PaymentBox
              onPaymentComplete={handlePaymentComplete}
              onPaymentError={handlePaymentError}
              onPaymentDismissed={handlePaymentDismissed}
            />
          </div>
        </div>
        <div className={styles.paymentPopup}>
          <div className={styles.paymentPopupHeader}>
            <h2 className={styles.h2}>Primum</h2>
          </div>
          <div className={`${styles.pricingContent} customScroll`}>
            <div className={styles.pricingCard}>
              <p className={styles.pricingText}>
                one-time fee of $20 for a 50 min
                interview
              </p>
            </div>
            <PaymentBox
              onPaymentComplete={handlePaymentComplete}
              onPaymentError={handlePaymentError}
              onPaymentDismissed={handlePaymentDismissed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
