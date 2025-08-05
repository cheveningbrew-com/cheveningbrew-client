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
            Every single Chevening shortlisted candidate come February 2026 will have had their essays reviewed by at least one person. While there are  exceptions, reviewers tend to be Chevening alumni or scholars the candidate personally know. For the many aspirants who do not have such connections, the Chevening application is an exam where the few have the answer key.
            <br/><br/>
            Cheveningbrew's Aisha is here to help level the playing field. Aisha reflects her makers: Chevening alumni who wish to see the best candidates selected on merit and not the strength of their social connections. Aisha's feedback can make a radical difference to your application. She evaluates each of your four essays for:
            <br/><br/>
            • Grammar and style<br/>
            • Narrative strength<br/>
            • Alignment with Chevening scoring criteria*<br/>
            <br/>
            The Chevening Secretariat does prescribe strict AI usage guidelines for applications: using AI to **generate** your answers is strictly prohibited (See: <a href="https://www.chevening.org/faqs/can-i-use-ai-to-help-me-write-my-application/">Can I use AI to write Chevening essays</a>). Aisha provides feedback exactly how all shortlisted candidates will receive theirs from their buddy reviewers. She will share a word document(s) with comments and suggestions. She will never write your essays for you.
            <br/><br/>
            * Cheveningbrew is not affiliated with the Chevening Secretariat or the UK Foreign, Commonwealth & Development Office. It is an independent initiative by Chevening alumni to support prospective candidates. Chevening criteria are subject to change and applicants should always refer to the official Chevening website for the most current information. We use publicly available information to inform our rubrics and our personal experiences to guide our feedback.
          </p>
        </div>
      </ActionBox>
    </SupportPagesLayout>
  );
};

export default About;
