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
    <main className={`resume-body ${styles.resumeBody} mx-auto w-full max-w-4xl px-6 py-6`}>
      {content}
      <ResumeActions />
    </main>
  );
}
