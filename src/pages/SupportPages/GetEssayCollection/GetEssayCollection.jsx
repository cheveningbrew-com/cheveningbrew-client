import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import { sendGuide } from "../../../services/marketing_api";
import styles from "./GetEssayCollection.module.css";
import supportStyles from "../SupportPages.module.css";

const GetEssayCollection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        await sendGuide(formData.email, formData.name, "essay-collection");
        
        // Show success message
        setIsSubmitted(true);
        setFormData({ name: "", email: "" });
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: "Failed to submit. Please try again later." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${supportStyles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Grab your free annotated Chevening essays</h1>

          <p>
            Get instant access to a unique library of real Chevening essays—both winners and near-misses. See first drafts, polished finals, and side-by-side comparisons, all with expert notes on what shines and what falls flat.
          </p>
          <ul>
            <li>Spot the winning moves—and the mistakes to avoid.</li>
            <li>Read candid feedback on structure, storytelling, and clarity.</li>
            <li>Know the outcome: every essay is tagged as accepted, shortlisted, or not selected.</li>
          </ul>
          <p>
            Whether you're starting out or perfecting your draft, these real examples and insights will help you write a standout Chevening application.
          </p>
          <p>
            Fill in the form below and we'll send your free PDF straight to your inbox.
          </p>
              
          {isSubmitted ? (
            <div className={styles.successMessage}>
              <h3>Thanks for your request!</h3>
              <p>Your annotated Chevening essays are on their way. Check your inbox (or spam folder).</p>
              <p>
                Questions or missing your email? Contact us at{' '}
                <a href="mailto:reviewer@cheveningbrew.com">
                  <span className={styles.email}>reviewer@cheveningbrew.com</span>
                </a>
              </p>
              <button
                className={styles.submitButton}
                onClick={() => setIsSubmitted(false)}
              >
                Request another copy
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.name && <p className={styles.errorText}>{errors.name}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.email ? styles.inputError : ""}`}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
              
              {errors.submit && <p className={styles.errorText}>{errors.submit}</p>}
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Grab Chevening essays"}
              </button>
              
              <p className={styles.privacyNote}>
                We respect your privacy. Your information will only be used to send you the requested essay collection and
                will not be shared with third parties. See our <a href="/privacy">Privacy Policy</a> for more information.
              </p>
            </form>
          )}
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default GetEssayCollection;