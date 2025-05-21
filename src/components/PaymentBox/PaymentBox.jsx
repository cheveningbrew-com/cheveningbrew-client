import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './PaymentBox.module.css';
import { updateUserField, readUserField, getUserId, subscribeUser } from '../../services/api';
import Popup from './Popup';


const PaymentBox = ({ plan, onPaymentComplete, onPaymentError, onPaymentDismissed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payHereLoaded, setPayHereLoaded] = useState(false);
  const [showPaidPopup, setShowPaidPopup] = useState(false);

  // Load PayHere script
  useEffect(() => {
    const loadPayHereScript = () => {
      const script = document.createElement("script");
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.async = true;
      script.onload = () => {
        console.log("PayHere script loaded successfully");
        setPayHereLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load PayHere script");
      };
      document.body.appendChild(script);
    };

    loadPayHereScript();
  }, []);

  const handlePaymentComplete = useCallback(async (orderId) => {
    try {
      const user_id = getUserId();
      if (!user_id) {
        console.error("User ID not found.");
        return;
      }

      // Subscribe the user and update payment status
      await subscribeUser({
        user_id: user_id,
        plan: plan.id,
        price: parseFloat(plan.amount),
        attempts: plan.attempts,
      });
      await updateUserField(user_id, "payment_completed", true);

      console.log("Payment completed successfully. Order ID:", orderId);
     

      // Call the parent's completion handler
      onPaymentComplete(orderId);
    } catch (err) {
      console.error("Error during payment completion:", err);
      onPaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  }, [onPaymentComplete, onPaymentError, plan]);

  // Handle payment errors
  const handlePaymentError = useCallback((error) => {
    console.error("Payment error:", error);
    onPaymentError(error);
    setIsProcessing(false);
  }, [onPaymentError]);

  // Handle payment dismissal
  const handlePaymentDismissed = useCallback(() => {
    console.log("Payment dismissed.");
    onPaymentDismissed();
    setIsProcessing(false);
  }, [onPaymentDismissed]);

  // Initiate payment
  const initiatePayment = useCallback(async () => {
    const userId = getUserId();

    // Case 1: If user_id not in sessionStorage
    if (!userId) {
      window.location.href = "/"; // Redirect to landing
      return;
    }

    try {
      // Check if user exists and payment status
      const userExists = await readUserField(userId, "id"); // if null → doesn't exist
      const paymentCompleted = await readUserField(userId, "payment_completed");

      if (!userExists) {
        // Case 1: user_id not in table
        window.location.href = "/";
        return;
      }

      if (paymentCompleted === true) {
        setShowPaidPopup(true);
        return;
      }

      // Case 2: user exists and payment_completed === false → proceed to payment
      if (!window.payhere || isProcessing) {
        alert("Payment system not loaded. Please refresh the page and try again.");
        return;
      }

      setIsProcessing(true);

      const userName = await readUserField(userId, "name");
      const userEmail = await readUserField(userId, "email");

      const paymentDetails = {
        order_id: `ORDER-${Date.now()}`,
        amount: plan.amount,
        currency: "USD",
        name: userName || "User",
        email: userEmail || "test@example.com",
        phone: "",
        address: "",
        city: "",
        country: "Sri Lanka",
        custom_1: "interview_prep",
        custom_2: "user_id",
      };

      const API_URL = process.env.REACT_APP_PAYMENTS_SERVER_URL || "http://localhost:4001";
      const hashResponse = await axios.post(`${API_URL}/payment/start`, paymentDetails);

      if (!hashResponse.data || !hashResponse.data.hash) {
        throw new Error("Failed to generate payment hash");
      }

      const { hash, merchant_id } = hashResponse.data;
      const isSandbox = process.env.REACT_APP_SANDBOX !== "false";

      const payment = {
        sandbox: isSandbox,
        merchant_id: merchant_id,
        return_url: process.env.REACT_APP_RETURN_URL || window.location.href,
        cancel_url: process.env.REACT_APP_CANCEL_URL || window.location.href,
        notify_url: process.env.REACT_APP_NOTIFY_URL || `${API_URL}/payment/notify`,
        order_id: paymentDetails.order_id,
        items: "Chevening Interview Prep - One-time Access",
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        hash: hash,
        first_name: paymentDetails.name,
        last_name: "",
        email: paymentDetails.email,
        phone: paymentDetails.phone,
        address: paymentDetails.address,
        city: paymentDetails.city,
        country: paymentDetails.country,
        custom_1: paymentDetails.custom_1,
        custom_2: paymentDetails.custom_2,

        authorization: 1 // This enables authorization mode
      };

      // Set up PayHere event handlers
      window.payhere.onCompleted = handlePaymentComplete;
      window.payhere.onDismissed = handlePaymentDismissed;
      window.payhere.onError = handlePaymentError;

      // Start payment
      window.payhere.startPayment(payment);

    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("There was an error initializing the payment. Please try again.");
      setIsProcessing(false);
    }
  }, [isProcessing, handlePaymentComplete, handlePaymentDismissed, handlePaymentError, plan]);

  return (
    <div className={styles.paymentBox}>
      <button
        className={styles.paymentButton}
        onClick={initiatePayment}
        disabled={!payHereLoaded || isProcessing}
      >
        {isProcessing ? (
          <span><i className={styles.loadingIcon}></i> Processing Payment...</span>
        ) : (
          <span><i className={styles.paymentIcon}></i> Pay ${plan.amount} Now</span>
        )}
      </button>
      {!payHereLoaded && <p className={styles.loadingMessage}>Loading payment system...</p>}
      
      {showPaidPopup && (
      <Popup
        message="You have already paid."
        onClose={() => setShowPaidPopup(false)}
      />
    )}
    </div>
  );
};

export default PaymentBox;

