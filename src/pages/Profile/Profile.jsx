import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import styles from "./Profile.module.css";
import { useAuth } from "../../context/AuthContext";
import { getUserId, checkSubscriptionStatus } from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const { userName, userEmail, isAuthenticated, loading } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/");
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const userId = getUserId();
        if (userId) {
          const data = await checkSubscriptionStatus(userId);
          setSubscriptionData(data);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setError("Failed to load subscription information");
      } finally {
        setLoadingSubscription(false);
      }
    };

    if (isAuthenticated) {
      fetchSubscriptionStatus();
    }
  }, [isAuthenticated, loading, navigate]);

  const formatStatus = (status) => {
    return status ? "✅ Yes" : "❌ No";
  };

  const getStatusColor = (status) => {
    return status ? styles.statusGood : styles.statusBad;
  };

  if (loading) {
    return (
      <MainLayout>
        <ActionBox>
          <div className={styles.profileContainer}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </ActionBox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ActionBox>
        <div className={`${styles.profileContainer} customScroll`}>
          <div className={styles.profileHeader}>
            <h1>User Profile</h1>
            <button 
              className={styles.backButton}
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>

          {/* Auth Context Information */}
          <div className={styles.section}>
            <h2>Account Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{userName || "Not provided"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{userEmail || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Subscription Status Information */}
          <div className={styles.section}>
            <h2>Subscription Status</h2>
            {loadingSubscription ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading subscription data...</p>
              </div>
            ) : error ? (
              <div className={styles.errorMessage}>
                <p>{error}</p>
                <button 
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : subscriptionData ? (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Active Subscription:</span>
                  <span className={`${styles.value} ${getStatusColor(subscriptionData.has_active_subscription)}`}>
                    {formatStatus(subscriptionData.has_active_subscription)}
                  </span>
                </div>
                
                {/* Show subscription details only if Active Subscription is true */}
                {subscriptionData.has_active_subscription ? (
                  <>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Subscription Plan:</span>
                      <span className={styles.value}>
                        {subscriptionData.subscription_plan || "No plan"}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Remaining Attempts:</span>
                      <span className={`${styles.value} ${styles.attemptCount}`}>
                        {subscriptionData.remaining_attempts}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Total Attempts:</span>
                      <span className={styles.value}>
                        {subscriptionData.total_attempts}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Show free trial info only if Active Subscription is false */
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Free Trial Available:</span>
                    <span className={`${styles.value} ${getStatusColor(!subscriptionData.is_free_attempt_used)}`}>
                      {formatStatus(!subscriptionData.is_free_attempt_used)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.noData}>No subscription data available</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionSection}>
            <h2>Quick Actions</h2>
            <div className={styles.actionButtons}>
              <button 
                className={styles.actionButton}
                onClick={() => navigate("/upload")}
              >
                📝 Upload Essays
              </button>
              
              <button 
                className={styles.actionButton}
                onClick={() => navigate("/pricing")}
              >
                💳 View Pricing
              </button>
            
            </div>
          </div>
        </div>
      </ActionBox>
    </MainLayout>
  );
};

export default Profile;