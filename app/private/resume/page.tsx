import type { Metadata } from "next";
import ResumeContent from "./ResumeContent";
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
        <ResumeContent />
      </section>
      <ResumeActions />
    </main>
  );
}
