"use client";

import { useEffect } from "react";

export default function ScrollToSection({ targetId }: { targetId: string }) {
  useEffect(() => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, [targetId]);

  return null;
}
