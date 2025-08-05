import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "./GetEssayCollection.module.css";

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
        // In a real application, this would be an API call to send the email
        // For now, we'll simulate a successful submission after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>Grab your copy of our annotated Chevening essays</h1>
          
          <div className={styles.description}>
  <div className={styles.termsContent}>
    <p>
      Unlock a unique library of anonymised Chevening essays—featuring both successful and unsuccessful applications. Our collection includes first drafts, final submissions, and even side-by-side comparisons of drafts and their polished versions. Each essay is accompanied by expert commentary highlighting what works, what doesn’t, and why.
    </p>
    <ul>
      <li>Discover the strengths that helped essays stand out—and the pitfalls that held others back.</li>
      <li>See candid feedback and analysis on structure, storytelling, and clarity.</li>
      <li>Learn from real outcomes: every essay notes whether it was shortlisted, accepted, or missed the mark.</li>
    </ul>
    <p>
      Whether you’re starting your first draft or refining your final version, these real-world examples and insights will help you craft a more compelling Chevening application.
    </p>
    <p>
      Complete the form below, and we'll email you a free PDF collection of annotated Chevening essays.
    </p>
  </div>
            
            {isSubmitted ? (
              <div className={styles.successMessage}>
                <h3>Thank you for your request!</h3>
                <p>We've received your information and will send the annotated Chevening essays collection to your email shortly. Please check your inbox (and spam folder) in the next few minutes.</p>
                <p>
                  If you don't receive the email or have any questions, please contact us at{" "}
                  <a href="mailto:reviewer@cheveningbrew.com">
                    <strong>
                      <u>
                        <span className={styles.email}>reviewer@cheveningbrew.com</span>
                      </u>
                    </strong>
                  </a>
                </p>
                <button 
                  className={styles.submitButton} 
                  onClick={() => setIsSubmitted(false)}
                >
                  Request Another Copy
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
                  {isSubmitting ? "Sending..." : "Get Essay Collection"}
                </button>
                
                <p className={styles.privacyNote}>
                  We respect your privacy. Your information will only be used to send you the requested essay collection and
                  will not be shared with third parties. See our <a href="/privacy">Privacy Policy</a> for more information.
                </p>
              </form>
            )}
          </div>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default GetEssayCollection;