# PICT Finance Society — Contribution Tracker

A shared full-stack contribution-hours tracker built with Next.js, MongoDB Atlas and Vercel.

## Live website

- **Website:** https://pict-finance-society.vercel.app/
- **Coordinator / admin login:** https://pict-finance-society.vercel.app/admin/login
- **Admin workspace:** https://pict-finance-society.vercel.app/admin

## Features

- Public dashboard showing approved society hours, members, categories, leaderboard and recent approved contributions.
- Member registration and password-based sign-in.
- Members submit work logs with category, date, description and hours.
- Every member submission is pending until a coordinator approves it.
- A separate admin sign-in at `/admin/login` and protected admin workspace at `/admin`.
- Admins can add approved hours for any member, edit any contribution's hours/details/status/date, and delete records.
- Admin-only changes are recorded in an audit-log collection.
- Credited hours are calculated from approved contribution records only.
- Public dashboard, member directory and personal activity refresh every 15 seconds.

## Stack

- Next.js App Router
- MongoDB Atlas (official Node.js driver)
- Vercel
- bcryptjs password hashing and signed HTTP-only JWT session cookies

## Deploy

This repository stores the application bundle in numbered `pictsrc.*.b64` chunks to keep the initial upload manageable. The root `postinstall` script automatically joins and extracts the source archive before the Next.js build.

1. In Vercel, import `taarak09/pict-finance-society` as a Next.js project.
2. Set the Node.js version to 22.x or later.
3. Add these Environment Variables for Production (and Preview if needed):
   - `MONGODB_URI`: MongoDB Atlas connection string.
   - `MONGODB_DB`: `pict_finance_society`.
   - `AUTH_SECRET`: a strong random string of at least 32 characters.
4. Deploy the project.
5. Visit `/api/health` to check database connectivity.
6. For a fresh database, register the first account through `/register` and promote it to the `coordinator` role using trusted database administration before signing in. Do not expose an unauthenticated public coordinator-creation endpoint.
7. Sign in at `/admin/login`; keep coordinator credentials private.

Generate an authentication secret locally with:
```bash
openssl rand -base64 48
```

Never commit real secrets, database passwords, or `.env.local` to GitHub.

## How hours work

A member creates a contribution with a number of hours. It is stored as `pending` and does not count toward totals. A coordinator approves or rejects it. Only `approved` records count toward member totals and the public dashboard. Admin edits and direct hour adjustments are stored as contribution records and written to `admin_audit_logs`.

## Required account setup

- The MongoDB Atlas organization must allow AI client access in Organization Settings → App Connections if Atlas is to be configured through the connected Atlas integration.
- Vercel must have a GitHub Login Connection before this project can be linked to the GitHub repository for automatic deploy-on-push.
- For a public college-wide website, ensure deployment protection does not require Vercel team sign-in on the production domain.

## Security notes

Use a dedicated least-privilege database user for the app. Do not share coordinator passwords with regular members. The production coordinator account is already provisioned, and the public bootstrap/setup flow is disabled. Public pages should contain only the member fields and approved hour totals intended to be visible to the society.
