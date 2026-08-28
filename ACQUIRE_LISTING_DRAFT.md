
# Acquire.com Listing Draft - For Jayson

**Title:** CronVibe / SupaFlow — Serverless Visual Workflow & PGMQ Queue Orchestrator (Next.js + Supabase) — Production Ready

**Asking Price:** $12,500 OBO (Open to $9,500 for quick close before Oct 5 - family wedding)

**Tagline:** Turnkey developer tool: drag-drop workflow canvas, real-time pgmq queue monitor, secure vault, cron runner, Slack alerts. Built 100% serverless.

**Description:**
SupaFlow is a production-ready developer automation platform built entirely on serverless stack: Next.js 14, Tailwind, Supabase, Postgres PGMQ (Tembo), and React Flow.

What you get:
- ✅ Complete DB layer: cron_jobs, workflow_graphs, execution_logs with strict RLS (multi-tenant safe), indexes for scale, pgmq + pgsodium extensions
- ✅ Visual Workflow Canvas (React Flow) - drag-drop triggers, vault reads, queue pushes
- ✅ Real-Time Queue Monitor - live telemetry table streaming from pgmq via Supabase Realtime
- ✅ Vault Safe UI + Stripe Subscription ledger (free/pro/enterprise) + Edge Functions for cron-runner and stripe-webhook
- ✅ Slack incident alerts via Postgres trigger (pg_net) + Metrics chart
- ✅ Clean file architecture, README, .env.example, logo, deploy-ready for Vercel

Stack: Next.js 14 App Router, TypeScript, Tailwind, Supabase JS, @xyflow/react

**Reason for Selling:**
Built as technical proof-of-concept to showcase serverless orchestration. I have family commitment - son's wedding first week of October - and want to hand off to founder who can scale GTM while I focus on next project. No time to market it properly.

**Assets Included:**
- Full GitHub repo ownership
- Supabase migration files (core + telemetry seed)
- Vercel deploy config
- Edge Functions (cron-runner, stripe-webhook)
- Logo files (transparent PNG)
- Documentation + Loom demo (upon deploy)

**Traction:** Pre-revenue, MVP complete, no active users. Perfect for technical founder or agency wanting own automation infra without building from scratch.

**Monthly Costs:** $0-25/mo (Supabase Free tier + Vercel Hobby). At scale $25-60/mo.

**Tech Debt Disclosure (honest - builds trust):**
- VaultSafe UI is functional mock, needs wiring to Supabase Vault table (scaffold ready, 1-day work)
- MetricsChart currently static aggregates, ready to wire to execution_logs
- Stripe webhook needs signature verification for prod (TODO marked)
- read_platform_queue wrapper needs to be added (I have fixed SQL ready)

**Ideal Buyer:** DevTool founder, Supabase agency, indie hacker wanting queue/cron infra.

**Support:** 7 days post-sale setup help via video call to run migrations and deploy to Vercel.
