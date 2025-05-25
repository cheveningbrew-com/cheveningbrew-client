import React from 'react';
import styles from './Price.module.css';
import PaymentBox from '../PaymentBox/PaymentBox';
import { getUserId } from '../../services/api';

const handlePaymentComplete = async (orderId) => {
  try {
    console.log("Payment completed. Order ID:", orderId);
    const user_id = getUserId();
    if (!user_id) {
      console.error("User ID not found.");
      return;
    }
    //await updateUserField(user_id, "payment_completed", true);
    // console.log("User payment status updated successfully.");
  } catch (error) {
    console.error("Error updating user payment status:", error);
  }
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
    description: '1 attempt\n20 minutes\nquick practice!',
  },
  {
    id: 'standard',
    name: 'Standard',
    amount: '10.00',
    attempts: 3,
    description: '3 attempts\n60 minutes\nrefining answers!',
  },
  {
    id: 'premium',
    name: 'Premium',
    amount: '15.00',
    attempts: 5,
    description: '5 attempts\n100 minutes\nserious prep!',
  },
];

export default function Price({ 
  onPaymentComplete = () => {}, 
  onPaymentError = () => {}, 
  onPaymentDismissed = () => {},
  showContainerBox = true // New prop to control container box visibility
}) {
  return (
    <div className={`${styles.priceSection} ${showContainerBox ? styles.withContainer : ''}`}>
      {showContainerBox && (
        <div className={styles.priceContainerBox}>
          <div className={styles.priceGrid}>
            {plans.map((plan) => (
              <div key={plan.id} className={styles.priceCard}>
                <div className={styles.priceHeader}>
                  <h2 className={styles.priceTitle}>{plan.name}</h2>
                </div>
                <div className={styles.priceContent}>
                  <div className={styles.priceDescription}>
                    {plan.description.split('\n').map((line, i) => (
                      <p key={i} className={styles.priceText}>{line}</p>
                    ))}
                  </div>
                  <PaymentBox
                    plan={plan}
                    onPaymentComplete={async (orderId) => {
                      await handlePaymentComplete(orderId);
                      onPaymentComplete(orderId);
                    }}
                    onPaymentError={handlePaymentError}
                    onPaymentDismissed={handlePaymentDismissed}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showContainerBox && (
        <div className={styles.priceGrid}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.priceCard}>
              <div className={styles.priceHeader}>
                <h2 className={styles.priceTitle}>{plan.name}</h2>
              </div>
              <div className={styles.priceContent}>
                <div className={styles.priceDescription}>
                  {plan.description.split('\n').map((line, i) => (
                    <p key={i} className={styles.priceText}>{line}</p>
                  ))}
                </div>
                <PaymentBox
                  plan={plan}
                  onPaymentComplete={async (orderId) => {
                    await handlePaymentComplete(orderId);
                    onPaymentComplete(orderId);
                  }}
                  onPaymentError={handlePaymentError}
                  onPaymentDismissed={handlePaymentDismissed}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}