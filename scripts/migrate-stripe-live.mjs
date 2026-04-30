/**
 * migrate-stripe-live.mjs
 *
 * Targeted script to clear test-mode Stripe IDs from specific client accounts.
 * Run from the client/ directory:
 *
 *   node scripts/migrate-stripe-live.mjs [--dry-run]
 *
 * Add --dry-run to preview changes without writing anything.
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Config ──────────────────────────────────────────────────────────────────

const TARGET_EMAILS = [
  "rice.alia@yahoo.com",
  "tech@tristarlabs.io",
];

// ── Load .env manually (no dotenv dependency needed) ────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env");
const envLines = readFileSync(envPath, "utf8").split("\n");
const env = {};
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const MONGODB_URI = env.MONGODB_URI;
const MONGODB_DB  = env.MONGODB_DB;

if (!MONGODB_URI || !MONGODB_DB) {
  console.error("❌  MONGODB_URI or MONGODB_DB missing from .env");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

// ── Main ─────────────────────────────────────────────────────────────────────

const mongo = new MongoClient(MONGODB_URI);

try {
  await mongo.connect();
  const db     = mongo.db(MONGODB_DB);
  const clients = db.collection("clients");

  console.log(`\n${DRY_RUN ? "🔍  DRY RUN — no changes will be written\n" : "🚀  Running live migration\n"}`);
  console.log(`Targeting ${TARGET_EMAILS.length} account(s):\n  ${TARGET_EMAILS.join("\n  ")}\n`);

  for (const email of TARGET_EMAILS) {
    const doc = await clients.findOne({ email });

    if (!doc) {
      console.log(`⚠️  ${email} — NOT FOUND in clients collection`);
      continue;
    }

    console.log(`✅  Found: ${doc.name} (${email}) — clientId: ${doc.clientId}`);
    console.log(`    Current plan              : ${doc.plan}`);
    console.log(`    stripeAccountId           : ${doc.stripeAccountId ?? "—"}`);
    console.log(`    stripeCustomerId          : ${doc.stripeCustomerId ?? "—"}`);
    console.log(`    stripeSubscriptionId      : ${doc.stripeSubscriptionId ?? "—"}`);
    console.log(`    stripeOnboardingComplete  : ${doc.stripeOnboardingComplete ?? false}`);

    if (!DRY_RUN) {
      const result = await clients.updateOne(
        { email },
        {
          $set: {
            plan: "Free",
            stripeOnboardingComplete: false,
            updatedAt: new Date(),
          },
          $unset: {
            stripeAccountId: "",
            stripeCustomerId: "",
            stripeSubscriptionId: "",
          },
        }
      );
      console.log(`    → Modified: ${result.modifiedCount === 1 ? "yes ✓" : "no (already clean)"}\n`);
    } else {
      console.log(`    → Would reset plan → Free, clear all Stripe IDs\n`);
    }
  }

  if (!DRY_RUN) {
    console.log("✅  Migration complete. Clients must re-connect Stripe and re-subscribe in live mode.");
  } else {
    console.log("ℹ️  Dry run done. Run without --dry-run to apply changes.");
  }
} catch (err) {
  console.error("❌  Error:", err);
  process.exit(1);
} finally {
  await mongo.close();
}
