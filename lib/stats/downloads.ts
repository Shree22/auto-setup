/**
 * Download log: one record per download.
 *
 * Stored in MongoDB when MONGO_URI is set, otherwise appended to a plain text
 * file. The file works locally but does NOT survive on Vercel, whose
 * filesystem is read-only apart from /tmp and wiped on every deploy — so
 * production wants Mongo.
 *
 * Keeping every record (rather than a single counter) means the totals can be
 * re-sliced later — per framework, per week — without changing the format.
 */
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { catalog } from "../setup/catalog";
import { downloadsCollection, usingMongo } from "./mongo";

export { usingMongo };

export const statsFile =
  process.env.STATS_FILE ?? path.join(process.cwd(), "data", "downloads.log");

/** Human-readable counts, rewritten after every download. */
export const summaryFile = statsFile.replace(/\.log$|$/, "-summary.txt");

export type DownloadRecord = {
  /** ISO timestamp. */
  at: string;
  tool: string;
  language: string;
  framework: string;
  structure: string;
  project: string;
  /** Where the download was started from, e.g. wizard or examples. */
  source: string;
};

/** Records one download. Never throws: storage must not break a download. */
export async function recordDownload(record: DownloadRecord): Promise<void> {
  try {
    if (usingMongo) {
      const collection = await downloadsCollection();
      await collection.insertOne({ ...record, at: new Date(record.at) });
      return;
    }

    await mkdir(path.dirname(statsFile), { recursive: true });
    await appendFile(statsFile, `${JSON.stringify(record)}\n`, "utf8");
    await writeSummary();
  } catch (error) {
    console.warn("[stats] Could not record the download:", error);
  }
}

/** Rewrites the readable counts file from the log. */
async function writeSummary(): Promise<void> {
  const records = await readDownloads();
  const total = records.length;

  const section = (title: string, rows: Tally[]) =>
    [
      title,
      ...rows.map(
        (row) =>
          `  ${String(row.count).padStart(4)}  ${row.label}` +
          `  (${Math.round((row.count / total) * 100)}%)`
      ),
      "",
    ].join("\n");

  const text = [
    "AutoSetup — download counts",
    `Updated: ${new Date().toISOString()}`,
    `Total downloads: ${total}`,
    "",
    section("By stack (the full combination)", tallyStacks(records)),
    section("By tool", named(tallyBy(records, "tool"))),
    section("By language", named(tallyBy(records, "language"))),
    section("By framework", named(tallyBy(records, "framework"))),
    section("By structure", named(tallyBy(records, "structure"))),
    section("By source", tallyBy(records, "source")),
    "Generated from downloads.log — edit nothing here, it is overwritten.",
    "",
  ].join("\n");

  await writeFile(summaryFile, text, "utf8");
}

/** Reads every recorded download, oldest first. Returns [] when there are none. */
export async function readDownloads(): Promise<DownloadRecord[]> {
  if (usingMongo) {
    try {
      const collection = await downloadsCollection();
      // Counting in JS is fine at this size; switch to an aggregation
      // pipeline if the collection ever grows past a few thousand rows.
      const documents = await collection
        .find({}, { sort: { at: 1 }, limit: 50_000 })
        .toArray();

      return documents.map((doc) => ({
        at: new Date(doc.at).toISOString(),
        tool: doc.tool,
        language: doc.language,
        framework: doc.framework,
        structure: doc.structure,
        project: doc.project,
        source: doc.source,
      }));
    } catch (error) {
      console.warn("[stats] Could not read downloads from MongoDB:", error);
      return [];
    }
  }

  let contents: string;
  try {
    contents = await readFile(statsFile, "utf8");
  } catch {
    return [];
  }

  return contents
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      try {
        return JSON.parse(line) as DownloadRecord;
      } catch {
        return null; // Skip a half-written or corrupted line.
      }
    })
    .filter((record): record is DownloadRecord => record !== null);
}

export type Tally = { label: string; count: number };

/** Counts records by one field, most downloaded first. */
export function tallyBy(
  records: DownloadRecord[],
  field: keyof DownloadRecord
): Tally[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = record[field] || "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Turns an id from the log into the name people recognise. */
export function labelFor(id: string): string {
  const match =
    catalog.tools.find((t) => t.id === id) ??
    catalog.languages.find((l) => l.id === id) ??
    catalog.frameworks.find((f) => f.id === id) ??
    catalog.structures.find((s) => s.id === id);

  return match?.name ?? id;
}

const named = (rows: Tally[]): Tally[] =>
  rows.map((row) => ({ ...row, label: labelFor(row.label) }));

/**
 * Counts whole stacks, so repeated downloads of the same combination add up:
 * "Selenium · Python · Pytest · Page Object Model — 3".
 */
export function tallyStacks(records: DownloadRecord[]): Tally[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = [record.tool, record.language, record.framework, record.structure]
      .map(labelFor)
      .join(" · ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
