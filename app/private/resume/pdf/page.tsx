import type { Metadata } from "next";
import ResumeContent from "../ResumeContent";
import styles from "./resume-pdf.module.css";
import "./print.css";

export const metadata: Metadata = {
  title: "Resume PDF — Ryan Dharma",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResumePdfPage() {
  return (
    <main className={styles.pdfBody}>
      <div className={styles.pdfSheet}>
        <ResumeContent />
      </div>
    </main>
  );
}
