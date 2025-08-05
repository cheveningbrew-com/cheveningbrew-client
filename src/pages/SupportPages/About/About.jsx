import React from "react";
import SupportPagesLayout from "../../../layouts/SupportPagesLayout";
import ActionBox from "../../../components/ActionBox/ActionBox";
import styles from "../SupportPages.module.css";

const aboutSections = [
  {
    type: "heading",
    content: "About CheveningBrew"
  },
  {
    type: "paragraph",
    content:
      "Come February 2026, nearly every Chevening-shortlisted candidate will have had their essays reviewed—usually by someone who's walked the path before. Often, that means a Chevening alum or scholar personally known to them. But for many exceptional candidates without those connections, the Chevening application can feel like an exam where a lucky few already have the answer key."
  },
  {
    type: "paragraph",
    content: "Aisha is here to change that."
  },
  {
    type: "paragraph",
    content:
      "Aisha is an AI — short for AI-sha — built by Chevening alumni to democratize access to the kind of insightful, experience-backed feedback that helps strong candidates rise. Trained on dozens of successful Chevening essays and grounded in official guidance, Aisha evaluates each of your four essays with a human-like focus on:"
  },
  {
    type: "list",
    items: [
      "Grammar and style",
      "Narrative strength",
      "Alignment with Chevening's selection criteria*"
    ]
  },
  {
    type: "paragraph",
    content:
      "Her feedback mirrors what shortlisted candidates often receive from alumni mentors: thoughtful comments, suggestions, and guidance that push your writing to its best version — never writing it for you."
  },
  {
    type: "paragraph",
    content:
      "Chevening's guidelines are clear: using AI to generate your essays is strictly prohibited. And we agree — not just because of the rules, but because your story deserves to be yours. This is why Aisha is not a ghostwriter."
  },
  {
    type: "paragraph",
    content:
      "At Cheveningbrew, we believe that a fundamentally rewarding part of the application process is the act of self-reflection: learning to articulate your values, your journey, and your vision. Letting AI do that for you is not only against policy — it's a disservice to yourself."
  },
  {
    type: "paragraph",
    content: "Aisha doesn't replace that process. She enhances it."
  },
  {
    type: "paragraph",
    content:
      "* Cheveningbrew is not affiliated with the Chevening Secretariat or the UK Foreign, Commonwealth & Development Office. We are an independent initiative by Chevening alumni. Our feedback is informed by publicly available information and personal experience. For official information, always refer to the Chevening website."
  }
];

const About = () => {
  return (
    <SupportPagesLayout>
      <ActionBox>
        <div className={`${styles.supportContent} customScroll`}>
          {aboutSections.map((section, idx) => {
            if (section.type === "heading") {
              return (
                <h1 className={styles.pageTitle} key={idx}>
                  {section.content}
                </h1>
              );
            }
            if (section.type === "paragraph") {
              return (
                <p className={styles.description} key={idx}>
                  {section.content}
                </p>
              );
            }
            if (section.type === "list") {
              return (
                <ul className={styles.privacyList} key={idx}>
                  {section.items.map((item, i) => (
                    <li className={styles.privacyListItem} key={i}>
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default About;
