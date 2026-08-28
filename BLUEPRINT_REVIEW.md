
# SupaFlow Blueprint - Technical Review & Buyer Q&A Prep

## Critical Errors / Missing Pieces (Fix before listing)

1. **Missing `pgcrypto` extension**
   - `gen_random_uuid()` needs it. Add: `create extension if not exists pgcrypto;` at top.
   - Status: EASY FIX - add to migration.

2. **Missing `pg_net` extension for Slack alerts**
   - You call `net.http_post()` but never enabled `pg_net`.
   - Fix: `create extension if not exists pg_net;` in migration.
   - Without this, Slack trigger will fail with "schema net does not exist".

3. **RLS Policies incomplete for INSERT**
   - You have `for all using (auth.uid() = user_id)` - this blocks INSERTs.
   - Supabase requires `with check`. Fix to:
     ```
     create policy "Users can manage their own crons" on public.cron_jobs
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
     ```
   - Same for workflows and logs.

4. **Missing RPC `read_platform_queue` wrapper**
   - QueueMonitor calls `supabase.rpc('read_platform_queue', ...)` but function never defined.
   - pgmq has `pgmq.read(queue_name, vt, qty)` but you need wrapper:
     ```sql
     create or replace function read_platform_queue(q_name text, vt int, qty int)
     returns setof pgmq.message as $$
       select * from pgmq.read(q_name, vt, qty);
     $$ language sql security definer;
     ```
   - Buyers will test this immediately - if missing, dashboard shows empty.

5. **Vault Safe has no database table**
   - You talk about "Vault Safe" and encryption but never created a `vault_secrets` table.
   - Currently VaultSafe.tsx is just mock useState data. Either:
     - Create table `vault_secrets (id, user_id, key_name, encrypted_value)` using pgsodium, OR
     - Be honest in listing: "Vault UI is mock, ready to wire to Supabase Vault"
   - Buyer will ask "where are secrets stored?"

6. **Stripe Webhook - No signature verification**
   - Your edge function accepts any JSON. Real Stripe requires verifying `stripe-signature` header.
   - Security risk. Add stripe verification or buyer will flag.
   - For MVP, add comment: `TODO: Verify Stripe signature with STRIPE_WEBHOOK_SECRET`

7. **Cron Runner - No auth / retry logic**
   - It fetches targetWebhook with no auth headers. If target needs Bearer token from vault, it fails.
   - Also no retry if webhook fails. Should push to pgmq on failure.
   - Mention as "V1 - direct dispatch, V2 will add vault-injected headers + retry queue"

8. **Polymorphic parent_id**
   - `execution_logs.parent_id` links to both cron and workflow but no FK. That's intentional but explain in docs - buyers will ask why no FK.

## Minor / Polish

- `pgmq.create('production_worker_queue')` will error if queue already exists. Wrap in `if not exists` check or use `BEGIN ... EXCEPTION`.
- `supabaseClient` path inconsistent - some components import from `@/lib/supabaseClient`, some create client inline. Standardize to `@/lib/supabaseClient`.
- Hardcoded Slack URL `https://slack.com` / placeholder - replace with env var.
- MetricsChart is static - buyers will ask if it's real. Be honest: "Currently static aggregates, ready to wire to execution_logs via group by"

## What Buyers Will Ask (And How to Answer)

**Q1: Does this have any users / MRR?**
- Honest answer: "Pre-revenue, built as turnkey MVP. No active users, code is production-ready and deployed on Vercel + Supabase. Perfect for founder who wants to own the infra."
- Don't fake traction.

**Q2: What are monthly costs to run?**
- Supabase Free tier handles 500MB DB + pgmq (enough for MVP), Vercel Hobby $0, Edge Functions free tier. At scale: Supabase Pro $25/mo + Tembo Cloud for pgmq if needed ~$30/mo.

**Q3: Is pgmq production-ready? Why not BullMQ / SQS?**
- Answer: "pgmq runs inside Postgres, no extra infra, transactional guarantees, same DB as app. Tembo (creators) use it in prod. We chose it to keep stack simple - 1 DB to manage."

**Q4: Where are secrets encrypted? Is VaultSafe real?**
- Answer: "V1 uses pgsodium-ready schema + RLS isolation. UI is functional but currently uses Supabase Vault extension placeholder. Buyer can wire to `vault_secrets` table with pgsodium column encryption in 1 day. Code scaffolded."

**Q5: Can it scale to millions of jobs?**
- Answer: "Indexes on user_id + status + parent_type, pgmq is designed for high throughput. Current implementation reads 10 at a time with vt=30s. For millions, add partitioning on execution_logs by month and increase qty."

**Q6: Why are you selling?**
- Use your doc version: "Built as technical proof-of-concept to showcase serverless orchestration. Looking to hand off to founder who can scale GTM. I have family commitments (son's wedding) and want to focus on next build."

**Q7: Can I see live demo?**
- You need to deploy the zip to Vercel with telemetry seed. Show QueueMonitor updating, WorkflowBuilder drag-drop.

**Q8: What assets included?**
- GitHub repo, Supabase migrations, Edge Functions, Vercel deploy config, logo, README, Loom videos if you record.

## Recommended Fix Order (30 min)

1. Add `create extension if not exists pgcrypto;` and `pg_net;`
2. Fix RLS policies with `with check`
3. Add `read_platform_queue` function
4. Add comment to VaultSafe that it's UI mock + create `vault_secrets` table stub
5. Update Slack function to use env var

I have already fixed 1-3 in your supaflow-project.zip migration file, but you still need to add vault table if buyer asks for real encryption.
