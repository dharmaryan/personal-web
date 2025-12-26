"use client";

import { useEffect, useMemo, useState } from "react";

const shareTitle = "Ryan Dharma — Resume";
const fallbackUrl = "https://rdharma.xyz/private/resume";

export default function ResumeActions() {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(fallbackUrl);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const encodedUrl = useMemo(() => encodeURIComponent(currentUrl), [currentUrl]);

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: currentUrl });
      } catch (_error) {
        // ignore user cancellation
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (_error) {
        // ignore clipboard failures
      }
    }

    setShareOpen((prev) => !prev);
  };

  return (
    <div className="resume-actions fixed bottom-4 right-4 z-50">
      <div className="relative flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
        <a
          href="mailto:ryandharma04@gmail.com"
          className="px-2 py-1 transition hover:text-blue-600"
        >
          Email
        </a>
        <a
          href="https://www.linkedin.com/in/ryandharma/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 transition hover:text-blue-600"
        >
          LinkedIn
        </a>
        <button
          type="button"
          onClick={handleDownload}
          className="px-2 py-1 transition hover:text-blue-600"
        >
          Download
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="relative px-2 py-1 transition hover:text-blue-600"
        >
          {copied ? "Copied" : "Share"}
        </button>
        {shareOpen ? (
          <div className="absolute bottom-full right-0 mb-2 w-56 rounded-md border border-zinc-200 bg-white p-2 text-xs font-medium text-zinc-700 shadow-sm">
            <div className="flex flex-col gap-1">
              <a
                href={`mailto:?subject=Ryan%20Dharma%20Resume&body=${encodedUrl}`}
                className="rounded px-2 py-1 transition hover:bg-zinc-50"
              >
                Share via email
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-2 py-1 transition hover:bg-zinc-50"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
