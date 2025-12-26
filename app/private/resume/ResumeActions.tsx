"use client";

import { useState } from "react";

const downloadName = "Ryan_Dharma_Resume.pdf";

export default function ResumeActions() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    if (typeof window === "undefined") {
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/resume.pdf");
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      setErrorMessage("Unable to generate the PDF right now. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="resume-actions fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading ? "Preparing PDF…" : "Download PDF (1 page)"}
        </button>
        {errorMessage ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 shadow-sm">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
