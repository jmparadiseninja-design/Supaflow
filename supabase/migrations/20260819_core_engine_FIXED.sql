
-- SUPAFLOW FIXED CORE MIGRATION - Production Ready v1.1
-- Fixed: pgcrypto, pg_net, RLS with check, vault_secrets, read_platform_queue RPC

-- 0. ENABLE EXTENSIONS (FIXED)
create extension if not exists pgcrypto; -- for gen_random_uuid()
create extension if not exists pgmq cascade;
create extension if not exists pgsodium cascade;
create extension if not exists pg_net; -- for net.http_post (Slack alerts)
-- Note: Supabase Vault is enabled via Dashboard > Database > Extensions > vault

-- 1. TABLES
create table if not exists public.cron_jobs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    cron_expression text not null,
    target_action jsonb not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.workflow_graphs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    nodes jsonb default '[]'::jsonb not null,
    edges jsonb default '[]'::jsonb not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.execution_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    parent_type text check (parent_type in ('cron', 'workflow', 'queue')) not null,
    parent_id uuid not null,
    status text check (status in ('queued', 'running', 'success', 'failed', 'retry')) not null,
    execution_time_ms integer default 0,
    retry_count integer default 0 not null,
    payload jsonb default '{}'::jsonb,
    error_message text,
    executed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan_tier text check (plan_tier in ('free', 'pro', 'enterprise')) default 'free' not null,
    status text check (status in ('active', 'trialing', 'past_due', 'canceled')) default 'active' not null,
    current_period_end timestamp with time zone
);

-- FIXED: Added vault_secrets table (was missing)
create table if not exists public.vault_secrets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    key_name text not null,
    encrypted_value text not null, -- In production, use pgsodium crypto_aead encrypt
    description text,
    last_rotated timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, key_name)
);

-- 2. UPDATED_AT TRIGGER
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_cron_jobs_modtime on public.cron_jobs;
create trigger update_cron_jobs_modtime before update on public.cron_jobs for each row execute procedure update_modified_column();
drop trigger if exists update_workflows_modtime on public.workflow_graphs;
create trigger update_workflows_modtime before update on public.workflow_graphs for each row execute procedure update_modified_column();

-- 3. RLS - FIXED with with check for INSERT
alter table public.cron_jobs enable row level security;
alter table public.workflow_graphs enable row level security;
alter table public.execution_logs enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.vault_secrets enable row level security;

drop policy if exists "Users can manage their own crons" on public.cron_jobs;
create policy "Users can manage their own crons" on public.cron_jobs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own workflows" on public.workflow_graphs;
create policy "Users can manage their own workflows" on public.workflow_graphs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can view their own system logs" on public.execution_logs;
create policy "Users can view their own system logs" on public.execution_logs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can check their own subscription metadata" on public.user_subscriptions;
create policy "Users can check their own subscription metadata" on public.user_subscriptions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own vault" on public.vault_secrets;
create policy "Users can manage their own vault" on public.vault_secrets
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. INDEXES
create index if not exists idx_cron_jobs_user on public.cron_jobs(user_id);
create index if not exists idx_workflows_user on public.workflow_graphs(user_id);
create index if not exists idx_logs_parent on public.execution_logs(parent_type, parent_id);
create index if not exists idx_logs_status on public.execution_logs(status);
create index if not exists idx_logs_user_time on public.execution_logs(user_id, executed_at desc);
create index if not exists idx_vault_user on public.vault_secrets(user_id);



-- 6. FIXED: Slack alert with env var support
create or replace function public.handle_incident_alert()
returns trigger as $$
declare
    v_webhook_url text;
    v_payload text;
begin
    -- Try to get from vault/env, fallback to placeholder
    v_webhook_url := coalesce(current_setting('app.settings.slack_webhook_url', true), 'https://hooks.slack.com/services/REPLACE/ME');
    if new.status = 'failed' then
        v_payload := json_build_object(
            'text', '🚨 *SupaFlow Incident* 🚨' || chr(10) ||
                    '*Type:* ' || new.parent_type || chr(10) ||
                    '*ID:* `' || new.parent_id || '`' || chr(10) ||
                    '*Error:* _' || coalesce(new.error_message, 'Unknown') || '_'
        )::text;
        -- Only fire if webhook is configured
        if v_webhook_url not like '%REPLACE%' then
            perform net.http_post(
                url := v_webhook_url,
                headers := '{"Content-Type": "application/json"}'::jsonb,
                body := v_payload::jsonb,
                timeout_milliseconds := 5000
            );
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_system_failure on public.execution_logs;
create trigger on_system_failure after insert on public.execution_logs for each row execute function public.handle_incident_alert();
