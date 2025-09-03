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
          <h1 className={styles.pageTitle}>Get shortlisted Chevening essays &  tips – free to your inbox</h1>

          <p className={styles.descriptionText}>
            Enter your email to unlock a series of real Chevening essays and expert guidance. As soon as you sign up, you’ll receive Issue 1: early and final versions of all four Chevening essays from a shortlisted candidate—straight to your inbox.
          </p>

          <p className={styles.descriptionText}>
            Here’s what you’ll get in Chevening Essay Inspiration:
          </p>

          <ul className={styles.featureList}>
            <li>You’ll see early drafts and final versions of successful Chevening essays</li>
            <li>You’ll get expert commentary showing exactly what makes an essay stand out</li>
            <li>You’ll learn how to structure your own story for maximum impact</li>
          </ul>

          <p className={styles.descriptionText}>
            Fill in your details below and start receiving your Chevening Essay Inspiration series. Issue 1 arrives instantly, with more real essays and tips coming over the next two weeks.
          </p>

          {isSubmitted ? (
            <div className={styles.successMessage}>
              <h3>You're in!</h3>
              <p>Check your inbox for Issue 1—your first set of real Chevening essays and expert tips.</p>
              <p>Over the next two weeks, you'll get at least five more real essays and actionable advice.</p>
              <p>
                Questions or missing your email? Contact us at{' '}
                <a href="mailto:reviewer@cheveningbrew.com">
                  <span className={styles.email}>reviewer@cheveningbrew.com</span>
                </a>
              </p>
              <div className={styles.buttonContainer}>
                <button
                  className={styles.submitButton}
                  onClick={() => setIsSubmitted(false)}
                >
                  Subscribe with another email
                </button>
              </div>
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
                {isSubmitting ? "Subscribing..." : "Subscribe to Essay Inspiration"}
              </button>

              <p className={styles.privacyNote}>
                We respect your privacy. Your information will only be used to send you the Chevening Essay Inspiration series and
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