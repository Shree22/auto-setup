import type { Metadata } from "next";
import { Database, Download, FileText, TriangleAlert } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { Badge } from "@/components/ui/badge";
import {
  labelFor,
  readDownloads,
  statsFile,
  summaryFile,
  tallyBy,
  tallyStacks,
  usingMongo,
  type Tally,
} from "@/lib/stats/downloads";

// The log file changes between requests, so never cache this page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download stats",
  robots: { index: false, follow: false },
};

export default async function StatsPage() {
  const downloads = await readDownloads();
  const total = downloads.length;

  const breakdowns: { title: string; rows: Tally[] }[] = [
    { title: "By tool", rows: tallyBy(downloads, "tool") },
    { title: "By language", rows: tallyBy(downloads, "language") },
    { title: "By framework", rows: tallyBy(downloads, "framework") },
    { title: "By structure", rows: tallyBy(downloads, "structure") },
    { title: "By source", rows: tallyBy(downloads, "source") },
  ];

  const stacks = tallyStacks(downloads);
  const recent = [...downloads].reverse().slice(0, 10);

  return (
    <>
      <PageHero
        eyebrow="Internal"
        title="Download stats"
        description="How many projects have been downloaded, and which stacks people choose."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 shadow-xs">
            <Download className="size-5 text-primary" />
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-sm text-muted-foreground">
              {total === 1 ? "download" : "downloads"}
            </span>
          </span>
          {usingMongo ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="size-3.5 text-primary" />
              Stored in MongoDB
              <code className="font-mono">autosetup.downloads</code>
            </span>
          ) : (
            <>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="size-3.5" />
                <code className="font-mono">{statsFile}</code>
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="size-3.5" />
                <code className="font-mono">{summaryFile}</code>
              </span>
            </>
          )}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {!usingMongo && (
          <div className="mb-8 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                These counts live in a text file on the server.
              </span>{" "}
              That works locally, but on Vercel the filesystem is read-only and
              reset on every deploy, so counts will not survive there. Set
              MONGO_URI to store them in MongoDB instead.
            </p>
          </div>
        )}

        {total === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-xs">
            <p className="font-medium">No downloads recorded yet</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Generate a project and download the ZIP — it will appear here.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-4 rounded-2xl border bg-card p-5 shadow-xs">
              <h2 className="mb-1 text-sm font-semibold">
                By stack — the full combination
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                How often each exact setup has been downloaded.
              </p>
              <ul className="space-y-3">
                {stacks.map((stack) => (
                  <li key={stack.label}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{stack.label}</span>
                      <span className="shrink-0 tabular-nums">
                        <span className="text-base font-semibold">{stack.count}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({Math.round((stack.count / total) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(stack.count / total) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {breakdowns.map((breakdown) => (
                <section
                  key={breakdown.title}
                  className="rounded-2xl border bg-card p-5 shadow-xs"
                >
                  <h2 className="mb-4 text-sm font-semibold">{breakdown.title}</h2>
                  <ul className="space-y-3">
                    {breakdown.rows.map((row) => (
                      <li key={row.label}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate font-medium">
                            {labelFor(row.label)}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {row.count}
                            <span className="ml-1.5 text-xs">
                              ({Math.round((row.count / total) * 100)}%)
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(row.count / total) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <section className="mt-8 rounded-2xl border bg-card p-5 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold">Most recent downloads</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">When</th>
                      <th className="py-2 pr-4 font-medium">Project</th>
                      <th className="py-2 pr-4 font-medium">Stack</th>
                      <th className="py-2 font-medium">From</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((record, i) => (
                      <tr key={`${record.at}-${i}`} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                          {new Date(record.at).toLocaleString("en-GB")}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{record.project}</td>
                        <td className="py-2.5 pr-4">
                          {labelFor(record.tool)} · {labelFor(record.language)} ·{" "}
                          {labelFor(record.framework)}
                        </td>
                        <td className="py-2.5">
                          <Badge variant="secondary" className="rounded-full">
                            {record.source}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
