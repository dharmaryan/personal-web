import type { Metadata } from "next";
import ResumeActions from "./ResumeActions";
import styles from "./resume.module.css";

export const metadata: Metadata = {
  title: "Ryan Dharma — Resume",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResumePage() {
  return (
    <main className={styles.resumePage}>
      <section className={`${styles.resumeSheet} ${styles.resumeBody}`}>
        <img
          src="/ryan-resume.png"
          alt="Resume preview"
          className={styles.resumePreview}
        />
      </section>
      <ResumeActions />
    </main>
  );
}
