/**
 * lib/mongodb.ts
 *
 * Singleton MongoDB client for Next.js App Router.
 * In development, the global is reused across hot-reloads to avoid
 * exhausting connection pool limits.  In production a single client
 * is created per serverless invocation lifecycle.
 *
 * Import `clientPromise` in server-only files (API routes, Server Actions,
 * Server Components).  NEVER import this in "use client" components.
 */
import { MongoClient, ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Module-level cache for production (one per serverless instance lifecycle)
let _prodClientPromise: Promise<MongoClient> | undefined;

/**
 * Returns a lazily-initialised MongoClient promise.
 * Calling this at request time (not module load time) prevents build
 * failures when MONGODB_URI is unavailable during static analysis.
 */
export default function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    return global._mongoClientPromise;
  }

  if (!_prodClientPromise) {
    _prodClientPromise = new MongoClient(uri, options).connect();
  }
  return _prodClientPromise;
}
