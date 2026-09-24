import Link from "next/link";
import { track } from "@vercel/analytics";
import { Check, Download, FolderCode, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GenerateProjectResult } from "@/lib/setup/types";

type Props = {
  result: GenerateProjectResult;
  summary: string[];
  onStartOver: () => void;
};

export function GenerateSuccess({ result, summary, onStartOver }: Props) {
  const canDownload = Boolean(result.downloadUrl);

  return (
    <div className="mx-auto max-w-xl animate-fade-up py-8 text-center sm:py-14">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-8" strokeWidth={2.5} />
      </span>
      <h2 className="mt-6 text-3xl font-semibold tracking-tight">Your framework is ready</h2>
      <p className="mt-3 text-muted-foreground">
        We&apos;ve prepared <span className="font-medium text-foreground">{result.fileCount} files</span>{" "}
        for your project.
      </p>

      <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-xs">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderCode className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold">{result.projectName}</p>
          <p className="truncate text-sm text-muted-foreground">{summary.join(" · ")}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {canDownload ? (
          <Button asChild size="lg" className="h-11 px-6">
            <a
              href={result.downloadUrl!}
              download={`${result.projectName}.zip`}
              onClick={() => track("project_downloaded", { project: result.projectName })}
            >
              <Download data-icon="inline-start" /> Download ZIP
            </a>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Wrapper keeps the tooltip working on a disabled button */}
              <span tabIndex={0} className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Button type="button" size="lg" className="h-11 w-full px-6" disabled>
                  <Download data-icon="inline-start" /> Download ZIP
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Downloads will be available soon</TooltipContent>
          </Tooltip>
        )}
        <Button type="button" variant="outline" size="lg" className="h-11 px-6" onClick={onStartOver}>
          <RotateCcw data-icon="inline-start" /> Start a new setup
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {canDownload
          ? "Unzip it, follow the setup steps in the README, and run your first test."
          : "ZIP downloads are coming soon. Your selections are saved in this summary."}
      </p>

      <Button asChild variant="link" className="mt-4">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
