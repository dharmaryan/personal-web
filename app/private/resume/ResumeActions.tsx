const baseButtonClass =
  "rounded-md border px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60";

export default function ResumeActions() {
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
          <a
            href="/25.12.26%20Ryan%20Dharma%20Resume.pdf"
            download
            className={`${baseButtonClass} border-zinc-200 bg-white text-zinc-900 hover:text-blue-600`}
          >
            Download PDF (1 page)
          </a>
        </div>
      </div>
    </div>
  );
}
