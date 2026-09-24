/**
 * MongoDB connection, cached across invocations.
 *
 * Serverless functions are created and destroyed constantly. Without caching
 * the client, every invocation opens a new connection and Atlas runs out of
 * them, so the promise is stored on globalThis and reused — this also survives
 * hot reloads in development.
 */
import { MongoClient, type Collection } from "mongodb";

const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;

/** Which storage the app is using, shown on the stats page. */
export const usingMongo = Boolean(uri);

export type DownloadDocument = {
  at: Date;
  tool: string;
  language: string;
  framework: string;
  structure: string;
  project: string;
  source: string;
};

const DB_NAME = process.env.MONGO_DB ?? "autosetup";
const COLLECTION = "downloads";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGO_URI is not set");

  globalForMongo.mongoClientPromise ??= new MongoClient(uri, {
    // Fail fast rather than hanging a download request.
    serverSelectionTimeoutMS: 5000,
  }).connect();

  return globalForMongo.mongoClientPromise;
}

export async function downloadsCollection(): Promise<Collection<DownloadDocument>> {
  const client = await clientPromise();
  return client.db(DB_NAME).collection<DownloadDocument>(COLLECTION);
}

/** Checks the connection works, for the stats page and for setup checks. */
export async function pingMongo(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const client = await clientPromise();
    await client.db(DB_NAME).command({ ping: 1 });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
