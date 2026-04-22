---
mode: ask
description: "Use when building a client app that must implement global auth with Clerk, securely sync users to SAGAH, and enforce server-side identity for tracking/bookings/messages/payments."
---

You are implementing global authentication for a client app using Clerk, integrated with the SAGAH platform APIs.

Goal:
Build a secure, production-ready auth and identity-sync flow so end-users can create and access accounts in the client app, and all tracked actions are reliably linked in SAGAH.

Hard requirements:
1. Use Clerk for end-user authentication in the client app.
2. Keep the SAGAH API key sgk_* strictly server-side. Never expose it in browser code.
3. On sign-up/sign-in/session bootstrap, upsert the user to SAGAH via POST /api/v1/users from the client app server.
4. Include clerkUserId, email, and name in that sync payload.
5. Persist the returned sagah userId mapping in the client app database:
   - clerk_user_id -> sagah_user_id
6. For all tracked actions (bookings, messages, payments, events), derive identity from authenticated server session, not user-provided frontend fields.
7. Require backend-authenticated endpoints in the client app as a BFF layer; browser calls client-app API only.
8. Implement rate limiting and basic abuse protection on auth-adjacent and write endpoints.

Deliverables expected from you:
1. Architecture section (brief):
   - Client app frontend
   - Client app backend/BFF
   - Clerk auth/session
   - SAGAH API integration
2. Concrete file-level implementation plan for this codebase:
   - Middleware/session enforcement points
   - Auth callback/bootstrap route
   - User sync service module
   - Identity mapping storage
   - Protected API routes
3. Code implementation for:
   - Clerk auth guard middleware/layout
   - Server helper that calls SAGAH POST /api/v1/users
   - Session bootstrap endpoint returning { clerkUserId, sagahUserId, email, name }
   - Example protected endpoint that creates a booking/message using server-derived identity only
4. Security checklist with explicit pass/fail items.
5. Test plan with manual verification steps and edge cases.

SAGAH API contract to use for user sync:
- Endpoint: POST /api/v1/users
- Header: Authorization: Bearer sgk_<key>
- Body:
  {
    "email": "user@example.com",
    "name": "User Name",
    "clerkUserId": "user_...",
    "avatarUrl": "optional",
    "plan": "optional",
    "metadata": { "optional": "object" }
  }
- Success response: { "userId": "<sagah_user_id>", "isNew": boolean }

Implementation constraints:
- Never put sgk_* in client-side env vars or browser bundles.
- Use HttpOnly, Secure cookies for session behavior through Clerk defaults.
- If email changes in Clerk, keep identity continuity using clerkUserId.
- Use idempotent upsert behavior when syncing user records.
- Fail closed on auth checks (unauthenticated requests must not proceed).

Quality bar:
- Prefer minimal, composable modules over large monolithic handlers.
- Add concise comments only where logic is non-obvious.
- Include robust error handling and structured JSON errors.
- Ensure TypeScript types are explicit for auth/session payloads.

Output format:
1. Summary of implemented auth flow
2. Files changed with short reason for each
3. Security notes
4. Verification steps
5. Optional next hardening steps
