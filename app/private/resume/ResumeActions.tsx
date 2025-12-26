"use client";

import { useState } from "react";

const downloadName = "Ryan_Dharma_Resume.pdf";
const baseButtonClass =
  "rounded-md border px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60";

export default function ResumeActions() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    if (typeof window === "undefined") {
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch("/api/resume.pdf", {
        signal: controller.signal,
      });
      if (!response.ok) {
        let message = "Failed to generate PDF.";
        try {
          const data = await response.json();
          if (typeof data?.error === "string" && data.error.length > 0) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing errors and use the default message.
        }
        throw new Error(message);
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
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("PDF generation timed out. Please try again.");
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to generate the PDF right now. Please try again.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsDownloading(false);
    }
  };

  return (
    <div className="resume-actions fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <a
            href="https://rdharma.xyz"
            className={`${baseButtonClass} border-blue-600 bg-blue-600 text-white hover:bg-blue-500`}
          >
            See my main website
          </a>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={`${baseButtonClass} border-zinc-200 bg-white text-zinc-900 hover:text-blue-600`}
          >
            {isDownloading ? "Preparing PDF…" : "Download PDF (1 page)"}
          </button>
        </div>
        {errorMessage ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 shadow-sm">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
