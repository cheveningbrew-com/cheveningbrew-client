import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";

const About = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          <h1 className={styles.pageTitle}>About CheveningBrew</h1>
          <p className={styles.description}>
            Come February 2026, nearly every Chevening-shortlisted candidate will have had their essays reviewed—usually by someone who's walked the path before. Often, that means a Chevening alum or scholar personally known to them. But for many exceptional candidates without those connections, the Chevening application can feel like an exam where a lucky few already have the answer key.
          </p>
          
          <p className={styles.description}>
            Aisha is here to change that.
          </p>
          
          <p className={styles.description}>
            Aisha is an AI — short for AI-sha — built by Chevening alumni to democratize access to the kind of insightful, experience-backed feedback that helps strong candidates rise. Trained on dozens of successful Chevening essays and grounded in official guidance, Aisha evaluates each of your four essays with a human-like focus on:
          </p>
          
          <ul className={styles.privacyList}>
            <li className={styles.privacyListItem}>Grammar and style</li>
            <li className={styles.privacyListItem}>Narrative strength</li>
            <li className={styles.privacyListItem}>Alignment with Chevening's selection criteria*</li>
          </ul>
          
          <p className={styles.description}>
            Her feedback mirrors what shortlisted candidates often receive from alumni mentors: thoughtful comments, suggestions, and guidance that push your writing to its best version — never writing it for you.
          </p>
          
          <p className={styles.description}>
            Chevening's guidelines are clear: using AI to generate your essays is strictly prohibited. And we agree — not just because of the rules, but because your story deserves to be yours. This is why Aisha is not a ghostwriter.
          </p>
          
          <p className={styles.description}>
            At Cheveningbrew, we believe that a fundamentally rewarding part of the application process is the act of self-reflection: learning to articulate your values, your journey, and your vision. Letting AI do that for you is not only against policy — it's a disservice to yourself.
          </p>
          
          <p className={styles.description}>
            Aisha doesn't replace that process. She enhances it.
          </p>
          
          <p className={styles.description}>
            * Cheveningbrew is not affiliated with the Chevening Secretariat or the UK Foreign, Commonwealth & Development Office.
            We are an independent initiative by Chevening alumni. Our feedback is informed by publicly available information and personal experience. For official information, always refer to the Chevening website.
          </p>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default About;
