import React, { useState, useEffect } from "react";
import Tabs from "../components/Header/Tabs/Tabs";
import Footer from "../components/Footer/Footer";
import Logo from "../components/Logo/Logo";
import NameDisplay from "../components/NameDisplay/NameDisplay";
import SignOUt from "../components/SignOut/SignOut";
import styles from "./layout.module.css";
import { getUserId, readUserField, checkSubscriptionStatus } from "../services/api";
import { isDonationPromoActive, isPromoBannerEnabled } from "../utils/promoConfig";

const MainLayout = ({ children, isLoading = false }) => {
  const [userName, setUserName] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchUserName = async () => {
      const user_id = getUserId();
      if (user_id) {
        const storedName = await readUserField(user_id, "name");
        if (storedName) {
          setUserName(storedName);
        }
      }
    };

    fetchUserName();
  }, []);

  // Calculate time remaining for donation promotion
  const calculateTimeRemaining = () => {
    const endDate = process.env.REACT_APP_DONATION_PROMO_END_DATE;

    if (!endDate) {
      return null;
    }

    try {
      const now = new Date();
      const promoEndDate = new Date(endDate);
      const difference = promoEndDate - now;

      if (difference <= 0) {
        return null; // Promotion has ended
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return null;
    }
  };

  // Check subscription status
  const checkUserStatus = async () => {
    try {
      setStatusLoading(true);
      const user_id = getUserId();

      if (user_id) {
        const status = await checkSubscriptionStatus(user_id);
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setSubscriptionStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  // Check subscription status on component mount
  useEffect(() => {
    checkUserStatus();
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Check if countdown should be displayed
  const shouldShowCountdown =
    !isLoading &&
    !statusLoading &&
  isPromoBannerEnabled() &&
    isDonationPromoActive() &&
    subscriptionStatus &&
    !subscriptionStatus.is_free_attempt_used &&
    !subscriptionStatus.payment_completed &&
    !subscriptionStatus.has_active_subscription &&
    timeRemaining;

  return (
    <div className={styles.pageContainer}>
      {/* Countdown Timer Banner */}
      {shouldShowCountdown && (
        <div className={styles.countdownBanner}>
          <div className={styles.countdownContent}>
            <span className={styles.countdownText}>⏰ Limited Time: Get full analysis of all four essays for FREE!</span>
            <div className={styles.countdownNumbers}>
              <span className={styles.timeUnit}>
                <span className={styles.number}>{timeRemaining.days}</span>
                <span className={styles.label}>Days</span>
              </span>
              <span className={styles.timeUnit}>
                <span className={styles.number}>{timeRemaining.hours}</span>
                <span className={styles.label}>Hours</span>
              </span>
              <span className={styles.timeUnit}>
                <span className={styles.number}>{timeRemaining.minutes}</span>
                <span className={styles.label}>Minutes</span>
              </span>
              <span className={styles.timeUnit}>
                <span className={styles.number}>{timeRemaining.seconds}</span>
                <span className={styles.label}>Seconds</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainLayout}>
        <div className={styles.navigationContainer}>
          <div className={styles.navigationHead}>
            <Logo isLoading={isLoading} />
            <div className={styles.navigationUser}>
              <NameDisplay userName={userName} isLoading={isLoading} />
              <SignOUt isLoading={isLoading} />
            </div>
          </div>

          <Tabs isLoading={isLoading} />
        </div>
        <div className={styles.contentContainer}>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
