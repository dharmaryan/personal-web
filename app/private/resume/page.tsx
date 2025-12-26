import type { Metadata } from "next";
import { loadResume } from "@/lib/resume";
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
  const content = await loadResume();

  return (
    <main className={styles.resumePage}>
      <section className={`${styles.resumeSheet} ${styles.resumeBody}`}>{content}</section>
      <ResumeActions />
    </main>
  );
}
