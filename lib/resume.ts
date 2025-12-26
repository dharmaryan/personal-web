import fs from "fs/promises";
import path from "path";
import type { ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";

const RESUME_PATH = path.join(process.cwd(), "content", "private", "resume.mdx");

export async function loadResume(): Promise<ReactElement> {
  const source = await fs.readFile(RESUME_PATH, "utf-8");

  const compiled = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        format: "md",
      },
    },
  });

  return compiled.content;
}
