"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

export type ProjectItem = {
  title: string;
  description: string;
  href: string;
  variant?: "view" | "download";
};

const COLLAPSED_COUNT = 4;

export default function ProjectsSection({ items }: { items: ProjectItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isExpandable = items.length > COLLAPSED_COUNT;

  const updateHeights = () => {
    if (!containerRef.current) return;
    const fullHeight = containerRef.current.scrollHeight;
    setExpandedHeight(fullHeight);

    const targetItem = itemRefs.current[COLLAPSED_COUNT - 1];
    if (!targetItem) {
      setCollapsedHeight(fullHeight);
      return;
    }

    const containerTop = containerRef.current.getBoundingClientRect().top;
    const targetBottom = targetItem.getBoundingClientRect().bottom;
    setCollapsedHeight(targetBottom - containerTop);
  };

  useLayoutEffect(() => {
    updateHeights();
  }, [items.length]);

  useEffect(() => {
    const handleResize = () => updateHeights();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items.length]);

  const maxHeight = !isExpandable
    ? expandedHeight
    : expanded
    ? expandedHeight
    : collapsedHeight;

  return (
    <section id="projects" className="rounded-3xl border border-zinc-200 bg-white p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">Projects</h2>
          <p className="text-base text-zinc-600">Documenting passion projects and what I've been up to lately.</p>
        </div>
      </div>
      <div
        ref={containerRef}
        className="mt-6 grid gap-4 md:grid-cols-2 transition-[max-height] duration-300 ease-in-out overflow-hidden"
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        {items.map((item, index) => (
          <div
            key={item.title}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
          >
            <ProjectCard item={item} />
          </div>
        ))}
      </div>
      {isExpandable ? (
        <div className="mt-6 flex justify-start">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:border-blue-600 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? "Show fewer projects" : "Show more projects"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function ProjectCard({ item }: { item: ProjectItem }) {
  const label = item.variant === "download" ? "Download" : "View";
  const indicatorColor = item.variant === "download" ? "bg-emerald-600" : "bg-zinc-900";

  return (
    <Link
      href={item.href}
      className="block h-full rounded-3xl border border-zinc-200 bg-white p-6 hover:border-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-950">{item.title}</h3>
        <span className="text-sm text-zinc-500" aria-hidden>
          →
        </span>
      </div>
      <p className="mt-3 text-sm text-zinc-700">{item.description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
        <span className={`h-2 w-2 rounded-full ${indicatorColor}`} aria-hidden />
        <span>{label}</span>
      </div>
    </Link>
  );
}
