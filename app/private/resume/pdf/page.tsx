import type { Metadata } from "next";
import { loadResume } from "@/lib/resume";
import styles from "./resume-pdf.module.css";

export const metadata: Metadata = {
  title: "Resume PDF — Ryan Dharma",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResumePdfPage() {
  const content = await loadResume();

  return (
    <main className={styles.pdfBody}>
      <div className={styles.pdfSheet}>{content}</div>
    </main>
  );
}
