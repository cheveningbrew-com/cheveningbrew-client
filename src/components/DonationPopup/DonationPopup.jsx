import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './DonationPopup.module.css';
import { getUserId, readUserField } from '../../services/api';

const DonationPopup = ({
  isOpen,
  onCancel,
  onDonate,
  documentName,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select"); // "select" | "processing" | "success"
  const [payHereLoaded, setPayHereLoaded] = useState(false);
  const [amountError, setAmountError] = useState("");

  // Load PayHere script
  useEffect(() => {
    if (!isOpen) return;

    const loadPayHereScript = () => {
      // Check if script already exists
      if (window.payhere) {
        setPayHereLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.async = true;
      script.onload = () => {
        console.log("PayHere script loaded for donation");
        setPayHereLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load PayHere script");
      };
      document.body.appendChild(script);
    };

    loadPayHereScript();
  }, [isOpen]);

  // Payment handling functions
  const handlePaymentComplete = useCallback(async (orderId) => {
    try {
      console.log("Donation payment completed successfully. Order ID:", orderId);
      setPaymentStep("success");
      setIsProcessingPayment(false);

      // Call success handler
      if (onPaymentSuccess) {
        onPaymentSuccess(orderId);
      }

      // Close popup after short delay and proceed with download
      setTimeout(() => {
        handleCancel(); // This will trigger download
      }, 1500);

    } catch (err) {
      console.error("Error during donation payment completion:", err);
      if (onPaymentError) {
        onPaymentError(err);
      }
      setIsProcessingPayment(false);
    }
  }, [onPaymentSuccess, onPaymentError]);

  const handlePaymentError = useCallback((error) => {
    console.error("Donation payment error:", error);
    if (onPaymentError) {
      onPaymentError(error);
    }
    setIsProcessingPayment(false);
    setPaymentStep("select");
  }, [onPaymentError]);

  const handlePaymentDismissed = useCallback(() => {
    console.log("Donation payment dismissed.");
    setIsProcessingPayment(false);
    setPaymentStep("select");
    // User dismissed payment, but document should still download
    handleCancel();
  }, []);

  // Initiate donation payment
  const initiateDonationPayment = useCallback(async (amount) => {
    const userId = getUserId();

    if (!userId) {
      setAmountError("User not found. Please log in again.");
      return;
    }

    try {
      if (!window.payhere || isProcessingPayment) {
        setAmountError("Payment system not loaded. Please try again.");
        return;
      }

      setIsProcessingPayment(true);
      setPaymentStep("processing");

      const userName = await readUserField(userId, "name");
      const userEmail = await readUserField(userId, "email");

      if (!userName || !userEmail) {
        setIsProcessingPayment(false);
        setAmountError("Missing user information. Please update your profile.");
        return;
      }

      const donationDetails = {
        order_id: `DONATION-${Date.now()}`,
        amount: amount.toFixed(2),
        attempts: 0, // Not applicable for donations
        plan_id: "one-time", // Donation type
        currency: "USD",
        name: userName,
        email: userEmail,
        phone: "",
        address: "",
        city: "",
        country: "Sri Lanka",
        user_id: userId,
      };

      const API_URL = process.env.REACT_APP_PAYMENTS_SERVER_URL || "http://localhost:4001";
      const hashResponse = await axios.post(`${API_URL}/payment/start`, donationDetails);

      if (!hashResponse.data || !hashResponse.data.hash) {
        throw new Error("Failed to generate payment hash");
      }

      const { hash, merchant_id } = hashResponse.data;

      const payment = {
        sandbox: false,
        merchant_id: merchant_id,
        return_url: process.env.REACT_APP_RETURN_URL || window.location.href,
        cancel_url: process.env.REACT_APP_CANCEL_URL || window.location.href,
        notify_url: process.env.REACT_APP_NOTIFY_URL || `${API_URL}/payment/notify`,
        order_id: donationDetails.order_id,
        items: "Donation",
        amount: donationDetails.amount,
        currency: donationDetails.currency,
        hash: hash,
        first_name: donationDetails.name.split(" ")[0],
        last_name: donationDetails.name.split(" ").slice(1).join(" "),
        email: donationDetails.email,
        phone: donationDetails.phone,
        address: donationDetails.address,
        city: donationDetails.city,
        country: donationDetails.country,
        custom_1: "one-time", // Donation type
        custom_2: donationDetails.user_id,
      };

      console.log("Donation payment details:", payment);

      // Set up PayHere event handlers
      window.payhere.onCompleted = handlePaymentComplete;
      window.payhere.onDismissed = handlePaymentDismissed;
      window.payhere.onError = handlePaymentError;

      // Start payment
      window.payhere.startPayment(payment);

    } catch (error) {
      console.error("Donation payment initialization error:", error);
      setAmountError("Failed to initialize payment. Please try again.");
      setIsProcessingPayment(false);
      setPaymentStep("select");
    }
  }, [isProcessingPayment, handlePaymentComplete, handlePaymentDismissed, handlePaymentError]);

  // Early return after all hooks
  if (!isOpen) return null;

  // Helper functions and variables
  const suggestedAmounts = [5, 10, 25, 50];

  // Validate donation amount
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return "Please enter a valid amount";
    }
    if (numAmount < 1) {
      return "Minimum donation amount is $1";
    }
    if (numAmount > 1000) {
      return "Maximum donation amount is $1000";
    }
    return "";
  };

  // Handle amount selection
  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setDonationAmount(amount.toString());
    setAmountError("");
  };

  // Handle custom amount input
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setDonationAmount(value);
    setSelectedAmount(null); // Clear selected amount when typing custom

    if (value) {
      const error = validateAmount(value);
      setAmountError(error);
    } else {
      setAmountError("");
    }
  };

  const handleCancel = () => {
    // Reset state
    setPaymentStep("select");
    setDonationAmount("");
    setSelectedAmount(null);
    setAmountError("");
    setIsProcessingPayment(false);
    onCancel();
  };

  const handleDonate = () => {
    // If no amount selected, trigger payment process
    if (!donationAmount || amountError) {
      setAmountError("Please select or enter a valid donation amount");
      return;
    }

    const amount = parseFloat(donationAmount);
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }

    // Start payment process
    initiateDonationPayment(amount);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup_box}>
        <div className={styles.icon}>💝</div>

        <h3 className={styles.title}>
          {paymentStep === "success" ? "Thank You!" : "Support Our Free Service"}
        </h3>

        {paymentStep === "success" ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>🎉</div>
            <p>Your donation has been processed successfully!</p>
            <p>Thank you for supporting our free service.</p>
          </div>
        ) : (
          <>
            <div className={styles.message}>
              <p>
                We provide comprehensive essay analysis for free to help students succeed.
                If you find our service valuable, consider making a small donation to help us continue supporting students like you.
              </p>
            </div>

            {/* Amount Selection */}
            <div className={styles.amountSection}>
              <h4>Choose your donation amount:</h4>

              {/* Quick Amount Buttons */}
              <div className={styles.amountButtons}>
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    className={`${styles.amountButton} ${
                      selectedAmount === amount ? styles.amountButtonSelected : ""
                    }`}
                    onClick={() => handleAmountSelect(amount)}
                    disabled={isProcessingPayment}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className={styles.customAmountSection}>
                <label className={styles.customAmountLabel}>
                  Or enter a custom amount:
                </label>
                <div className={styles.amountInputWrapper}>
                  <span className={styles.currencySymbol}>$</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="0.01"
                    placeholder="Enter amount"
                    value={donationAmount}
                    onChange={handleAmountChange}
                    className={`${styles.amountInput} ${amountError ? styles.amountInputError : ""}`}
                    disabled={isProcessingPayment}
                  />
                </div>

                {amountError && (
                  <div className={styles.errorMessage}>
                    {amountError}
                  </div>
                )}
              </div>

              <div className={styles.amountInfo}>
                <small>Minimum donation: $1 • Secure payment via PayHere</small>
              </div>
            </div>

            <div className={styles.benefitsSection}>
              <h4>Your support helps us:</h4>
              <ul>
                <li>✨ Keep the service free for all students</li>
                <li>🚀 Improve our AI analysis capabilities</li>
                <li>📚 Create more educational resources</li>
                <li>🌟 Support students worldwide</li>
              </ul>
            </div>

            <div className={styles.popup_actions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={isProcessingPayment}
              >
                Maybe Later
              </button>
              <button
                className={styles.donateButton}
                onClick={handleDonate}
                disabled={!donationAmount || !!amountError || isProcessingPayment || !payHereLoaded}
              >
                {isProcessingPayment ? (
                  <span>Processing...</span>
                ) : (
                  <span>
                    Donate {donationAmount ? `$${parseFloat(donationAmount).toFixed(2)}` : ""} ❤️
                  </span>
                )}
              </button>
            </div>

            <div className={styles.footnote}>
              <small>
                {!payHereLoaded
                  ? "Loading payment system..."
                  : "Your download will begin regardless of your choice • Secure payment via PayHere"}
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationPopup;