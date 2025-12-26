"use client";

import { usePathname } from "next/navigation";

export default function SiteActionBar() {
  const pathname = usePathname();

  if (pathname === "/private/resume" || pathname === "/private/resume/pdf") {
    return null;
  }

  return (
    <div className="site-action-bar fixed bottom-4 right-4 z-50">
      <div className="flex gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
        <a href="mailto:ryandharma04@gmail.com" className="px-2 py-1 hover:text-blue-600">Email</a>
        <a href="https://www.linkedin.com/in/ryandharma/" target="_blank" rel="noopener noreferrer" className="px-2 py-1 hover:text-blue-600">LinkedIn</a>
      </div>
    </div>
  );
}
