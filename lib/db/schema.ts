/**
 * lib/db/schema.ts
 *
 * TypeScript interfaces for every MongoDB collection.
 *
 * Collection layout
 * ─────────────────
 *  Database: SAGAH  (MONGODB_DB env var)
 *
 *  Platform-level (shared):
 *    • clients            — one doc per SAGAH customer (the businesses)
 *    • tickets            — support tickets from clients
 *    • inquiries          — pre-signup inquiry / demo requests
 *
 *  Per-client (isolated, provisioned on account creation):
 *    • {clientId}_app_users     — end-users who auth into the client's custom app
 *    • {clientId}_app_events    — analytics events fired from the client's app
 *    • {clientId}_app_bookings  — calendar bookings from the client's app
 *    • {clientId}_app_revenue   — payment/subscription transactions
 *
 *  clientId is a sanitized slug derived from the client's email domain, e.g.
 *  "admin@acmecorp.com" → "acmecorp".  It is used as the collection prefix so
 *  each client's data is fully isolated — no cross-client queries are possible
 *  without knowing the exact clientId.
 */

import type { ObjectId } from "mongodb";

// ─── Platform: clients ──────────────────────────────────────────────────────

export interface ClientDoc {
  _id?: ObjectId;
  /** Sanitized slug used as collection prefix, e.g. "acme_corp" */
  clientId: string;
  name: string;
  email: string;
  plan: "Free" | "Starter" | "Growth" | "Pro" | "Enterprise";
  status: "active" | "trial" | "inactive" | "suspended";
  /** Index (0-5) into PIPELINE_STAGES array */
  pipelineStage: number;
  customDomain?: string;
  /** Stripe Connect Express account ID for this client */
  stripeAccountId?: string;
  /** True once the client has completed Stripe Express onboarding */
  stripeOnboardingComplete: boolean;
  /** Stripe Customer ID used for billing the client directly (seat subscriptions) */
  stripeCustomerId?: string;
  /** Stripe Subscription ID for the $25/mo seat plan (set when userCount > 25) */
  stripeSubscriptionId?: string;
  /** Clerk organization/user ID — wired after Clerk integration */
  clerkUserId?: string;
  /** Secret API key used by the client's app to call SAGAH's v1 API */
  apiKey?: string;
  /** Domain requests submitted by the client */
  domains?: Array<{
    domain: string;
    status: "pending" | "approved" | "declined" | "active";
    requestedAt: Date;
    resolvedAt?: Date;
  }>;
  /** True once the 4 per-client collections have been provisioned */
  collectionsProvisioned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Platform: tickets ──────────────────────────────────────────────────────

export type TicketCategory = "general" | "billing" | "technical" | "feature" | "urgent";
export type TicketStatus   = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketMessageDoc {
  id: string;
  from: "user" | "admin";
  text: string;
  createdAt: Date;
}

export interface TicketDoc {
  _id?: ObjectId;
  /** Foreign key → clients.clientId */
  clientId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessageDoc[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Platform: inquiries ────────────────────────────────────────────────────

export type InquiryType   = "inquiry" | "demo";
export type InquiryStatus = "new" | "read" | "replied";

export interface InquiryDoc {
  _id?: ObjectId;
  type: InquiryType;
  name: string;
  email: string;
  company: string;
  message?: string;
  topic?: string;
  /** ISO date string for demo requests */
  date?: string;
  time?: string;
  duration?: number;
  status: InquiryStatus;
  createdAt: Date;
}

// ─── Platform: consultations ────────────────────────────────────────────────

export interface ConsultationDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  company?: string;
  date: string;   // human-readable, e.g. "Apr 7, 2026"
  time: string;   // e.g. "10:00 AM"
  topic: string;
  notes?: string;
  duration: number; // minutes
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
}

// ─── Per-client: {clientId}_app_users ───────────────────────────────────────

export interface AppUserDoc {
  _id?: ObjectId;
  /** Clerk user ID — populated after Clerk integration */
  clerkUserId?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  /** Subscription tier inside the client's app */
  plan?: string;
  /** Arbitrary key-value metadata from the client's app */
  metadata?: Record<string, unknown>;
  firstSeenAt: Date;
  lastSeenAt: Date;
  pageViews: number;
  sessionCount: number;
}

// ─── Per-client: {clientId}_app_events ──────────────────────────────────────

export type AppEventType =
  | "pageview"
  | "click"
  | "conversion"
  | "booking"
  | "payment"
  | "signup"
  | "custom";

export interface AppEventDoc {
  _id?: ObjectId;
  /** Clerk user ID of the end-user who triggered the event */
  userId?: string;
  sessionId: string;
  type: AppEventType;
  /** Pathname, e.g. "/menu" or "/book" */
  page?: string;
  referrer?: string;
  /** Arbitrary payload — ad source, button label, etc. */
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ─── Per-client: {clientId}_app_bookings ────────────────────────────────────

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface AppBookingDoc {
  _id?: ObjectId;
  /** Clerk user ID of the end-user who booked */
  userId?: string;
  name: string;
  email: string;
  service: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Human-readable time, e.g. "2:00 PM" */
  time: string;
  /** Duration in minutes */
  duration: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Per-client: {clientId}_app_revenue ─────────────────────────────────────

export type RevenueStatus = "succeeded" | "pending" | "failed" | "refunded";
export type RevenueType   = "subscription" | "one_time";

export interface AppRevenueDoc {
  _id?: ObjectId;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  /** Clerk user ID of the paying end-user */
  userId?: string;
  /** Amount in cents */
  amount: number;
  currency: string;
  type: RevenueType;
  plan?: string;
  status: RevenueStatus;
  createdAt: Date;
}

// ─── Per-client: {clientId}_app_messages ────────────────────────────────────

export interface AppMessageDoc {
  _id?: ObjectId;
  /** End-user identifier (Clerk userId or any stable ID from the client app) */
  userId?: string;
  /** Always present — used as the primary thread key */
  userEmail: string;
  userName: string;
  /** "user" = sent by the end-user; "client" = reply sent by the SAGAH client (business) */
  from: "user" | "client";
  text: string;
  /** False until the receiving party has read it */
  read: boolean;
  createdAt: Date;
}

// ─── Per-client: {clientId}_app_expenses ────────────────────────────────────

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "software"
  | "payroll"
  | "marketing"
  | "supplies"
  | "travel"
  | "food"
  | "insurance"
  | "equipment"
  | "professional_services"
  | "other";

export type ExpenseRecurrence = "one_time" | "weekly" | "monthly" | "annual";

export interface AppExpenseDoc {
  _id?: ObjectId;
  /** Amount in dollars (float) */
  amount: number;
  category: ExpenseCategory;
  description: string;
  vendor?: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  recurrence: ExpenseRecurrence;
  taxDeductible: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
