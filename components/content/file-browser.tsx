"use client";

import { useState } from "react";
import { FileCode2 } from "lucide-react";
import { CodeBlock } from "@/components/content/code-block";
import { cn } from "@/lib/utils";

export type BrowsableFile = { path: string; content: string };

/** File list on the left, the selected file's contents on the right. */
export function FileBrowser({ files }: { files: BrowsableFile[] }) {
  const [active, setActive] = useState(files[0]?.path ?? "");
  const current = files.find((f) => f.path === active) ?? files[0];

  if (!current) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="rounded-xl border bg-card p-2">
        <p className="px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Files
        </p>
        <ul className="max-h-[28rem] overflow-y-auto">
          {files.map((file) => {
            const name = file.path.split("/").pop();
            const dir = file.path.split("/").slice(0, -1).join("/");
            const selected = file.path === current.path;
            return (
              <li key={file.path}>
                <button
                  type="button"
                  onClick={() => setActive(file.path)}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected && "bg-primary/10 hover:bg-primary/10"
                  )}
                >
                  <FileCode2
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      selected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate font-mono text-[13px]",
                        selected && "font-semibold text-primary"
                      )}
                    >
                      {name}
                    </span>
                    {dir && (
                      <span className="block truncate font-mono text-[11px] text-muted-foreground">
                        {dir}/
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <CodeBlock code={current.content} label={current.path} className="min-w-0" />
    </div>
  );
}
