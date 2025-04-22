import React from 'react';
import styles from './Price.module.css';
import PaymentBox from '../PaymentBox/PaymentBox';
import { updateUserField } from '../../services/api';

const handlePaymentComplete = (orderId) => {
  console.log("Payment completed. Order ID:", orderId);
  // sessionStorage.setItem("payment_completed", "true");
  updateUserField("payment_completed", true);
  // alert("Payment successful! You can now access the app.");
};

const handlePaymentError = (error) => {
  console.error("Payment error:", error);
  alert("Payment failed. Please try again.");
};

const handlePaymentDismissed = () => {
  console.log("Payment dismissed.");
  alert("Payment dismissed. Please try again.");
};


const plans = [
  {
    id: 'basic',
    name: 'Basic',
    amount: '5.00',
    attempts: 1,
    description: 'One-time fee of $5 for a 15 min interview',
  },
  {
    id: 'standard',
    name: 'Standard',
    amount: '10.00',
    attempts: 3,
    description: 'One-time fee of $10 for a 30 min interview',
  },
  {
    id: 'premium',
    name: 'Premium',
    amount: '15.00',
    attempts: 5,
    description: 'One-time fee of $15 for a 50 min interview',
  },
];

export default function Price() {
  return (
    <div className={styles.paymentPopupOverlay}>
      <div className={styles.priceBox}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.paymentPopup}>
            <div className={styles.paymentPopupHeader}>
              <h2 className={styles.h2}>{plan.name}</h2>
            </div>
            <div className={`${styles.pricingContent} customScroll`}>
              <div className={styles.pricingCard}>
                <p className={styles.pricingText}>{plan.description}</p>
              </div>
              <PaymentBox
                plan={plan}
                onPaymentComplete={handlePaymentComplete}
                onPaymentError={handlePaymentError}
                onPaymentDismissed={handlePaymentDismissed}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
