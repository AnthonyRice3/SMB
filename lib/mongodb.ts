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

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI environment variable");

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

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Reuse across hot-module reloads
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

export default clientPromise;
