import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './PaymentBox.module.css';
import { updateUserField, readUserField, getUserId, subscribeUser } from '../../services/api';
import Popup from './Popup';

const PaymentBox = ({ plan, onPaymentComplete, onPaymentError, onPaymentDismissed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payHereLoaded, setPayHereLoaded] = useState(false);
  const [showPaidPopup, setShowPaidPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFreeTrialUsedPopup, setShowFreeTrialUsedPopup] = useState(false);
  
  const navigate = useNavigate();

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

      console.log("Payment completed successfully. Order ID:", orderId);

      // Show success message briefly
      setShowSuccessMessage(true);
      
      // Call the parent's completion handler if provided
      if (onPaymentComplete) {
        onPaymentComplete(orderId);
      }

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        console.log("Redirecting to upload page...");
        navigate('/upload');
      }, 1000);

    } catch (err) {
      console.error("Error during payment completion:", err);
      if (onPaymentError) {
        onPaymentError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onPaymentComplete, onPaymentError, plan, navigate]);

  // Handle payment errors
  const handlePaymentError = useCallback((error) => {
    console.error("Payment error:", error);
    if (onPaymentError) {
      onPaymentError(error);
    }
    setIsProcessing(false);
  }, [onPaymentError]);

  // Handle payment dismissal
  const handlePaymentDismissed = useCallback(() => {
    console.log("Payment dismissed.");
    if (onPaymentDismissed) {
      onPaymentDismissed();
    }
    setIsProcessing(false);
  }, [onPaymentDismissed]);

  // Handle free trial
  const handleFreeTrial = useCallback(async () => {
    const userId = getUserId();

    // Case 1: If user_id not in sessionStorage
    if (!userId) {
      window.location.href = "/"; // Redirect to landing
      return;
    }

    try {
      // Check if user exists
      const userExists = await readUserField(userId, "id");
      if (!userExists) {
        window.location.href = "/";
        return;
      }

      // First check if user has already paid
      const paymentCompleted = await readUserField(userId, "payment_completed");
      if (paymentCompleted === true) {
        setShowPaidPopup(true);
        return;
      }

      // Then check if free attempt was already used
      const freeAttemptUsed = await readUserField(userId, "free_attempt_used");
      if (freeAttemptUsed === true) {
        setShowFreeTrialUsedPopup(true);
        return;
      }

      // If neither condition met, proceed to upload
      navigate('/upload');

    } catch (error) {
      console.error("Error checking free trial status:", error);
      alert("There was an error checking your trial status. Please try again.");
    }
  }, [navigate]);

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

      // Validate that user information is available before proceeding
      if (!userName || !userEmail) {
        setIsProcessing(false);
        alert("Missing user information. Please update your profile with your name and email before making a payment.");
        return;
      }

      const paymentDetails = {
        order_id: `ORDER-${Date.now()}`,
        amount: plan.amount,
        attempts: plan.attempts,
        plan_id: plan.id,
        currency: "USD",
        name: userName,
        email: userEmail,
        phone: "",
        address: "",
        city: "",
        country: "Sri Lanka",
        plan_id: plan.id,  
        user_id: userId,
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
        items: paymentDetails.plan_id,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        hash: hash,
        first_name: paymentDetails.name.split(" ")[0],
        last_name: paymentDetails.name.split(" ").slice(1).join(" "),
        email: paymentDetails.email,
        phone: paymentDetails.phone,
        address: paymentDetails.address,
        city: paymentDetails.city,
        country: paymentDetails.country,
        custom_1: paymentDetails.plan_id,
        custom_2: paymentDetails.user_id,
      };

      // log payment details
      console.log("Payment details:", payment);

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
        onClick={plan.id === 'free' ? handleFreeTrial : initiatePayment}
        disabled={!payHereLoaded || isProcessing || showSuccessMessage}
      >
        {showSuccessMessage ? (
          <span><i className={styles.successIcon}></i> Payment Successful! Redirecting...</span>
        ) : isProcessing ? (
          <span><i className={styles.loadingIcon}></i> Processing Payment...</span>
        ) : plan.id === 'free' ? (
          <span>Free Trial</span>
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

      {showFreeTrialUsedPopup && (
        <Popup
          message="You have already used your free trial."
          onClose={() => setShowFreeTrialUsedPopup(false)}
        />
      )}
    </div>
  );
};

export default PaymentBox;