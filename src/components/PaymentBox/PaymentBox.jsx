// PaymentBox.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './PaymentBox.module.css';
import { updateUserField, readUserField, getUserId, subscribeUser } from '../../services/api';

const PaymentBox = ({ plan, onPaymentComplete, onPaymentError, onPaymentDismissed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payHereLoaded, setPayHereLoaded] = useState(false);

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
      // const userEmail = await readUserField(userEmail, "email");
      await subscribeUser({ user_id: user_id, plan: plan.id, price: plan.amount, attempts: plan.attempts });
      updateUserField("payment_completed", true);
      onPaymentComplete(orderId);
    } catch (err) {
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
    if (!window.payhere || isProcessing) {
      console.error("PayHere not loaded or payment already processing");
      alert("Payment system not loaded. Please refresh the page and try again.");
      return;
    }
setIsProcessing(true);

    const userEmail = getUserId(); // Get the email first
    const userName = readUserField(userEmail, "name");
    try {
      // Prepare payment details
      const paymentDetails = {
        order_id: `ORDER-${Date.now()}`,
        amount: plan.amount,
        currency: "USD",
        // first_name: firstName,
        // last_name: lastName,
        name:userName,
        email: userEmail,
        phone: "",
        address: "",
        city: "",
        country: "Sri Lanka",
        custom_1: "interview_prep",
        custom_2: "one_time",
      };

      // Get hash from server
      const API_URL = process.env.REACT_APP_PAYMENTS_SERVER_URL || "http://localhost:4001";
      const hashResponse = await axios.post(`${API_URL}/payment/start`, paymentDetails);

      if (!hashResponse.data || !hashResponse.data.hash) {
        throw new Error("Failed to generate payment hash");
      }

      const { hash, merchant_id } = hashResponse.data;
      console.log("Sandbox variable value", process.env.REACT_APP_SANDBOX);
      const isSandbox = process.env.REACT_APP_SANDBOX !== "false";
      console.log("Sandbox", isSandbox);

      // Configure payment object with hash from server
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
        first_name: paymentDetails.first_name,
        last_name: paymentDetails.last_name,
        email: paymentDetails.email,
        phone: paymentDetails.phone,
        address: paymentDetails.address,
        city: paymentDetails.city,
        country: paymentDetails.country,
        custom_1: paymentDetails.custom_1,
        custom_2: paymentDetails.custom_2,
      };

      // Set up PayHere event handlers
      window.payhere.onCompleted = handlePaymentComplete;
      window.payhere.onDismissed = handlePaymentDismissed;
      window.payhere.onError = handlePaymentError;

      // Start PayHere payment
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
    </div>
  );
};

export default PaymentBox;
