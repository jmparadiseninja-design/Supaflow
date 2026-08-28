
-- FIXED telemetry seed - handles existing queue
DO $$
DECLARE
    v_user_id uuid;
    v_cron_id uuid;
    v_workflow_id uuid;
    v_queue_exists boolean;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user in auth.users. Create account first in Supabase Auth.';
    END IF;

    INSERT INTO public.cron_jobs (user_id, name, cron_expression, target_action, is_active)
    VALUES (v_user_id, 'Production DB Auto-Vacuum', '0 2 * * *', '{"url": "https://getsupaflow.com/api/optimize", "payload": {"optimize": true}}'::jsonb, true)
    RETURNING id INTO v_cron_id;

    INSERT INTO public.workflow_graphs (user_id, name, nodes, edges, is_active)
    VALUES (v_user_id, 'Stripe -> Ledger Pipeline', 
        '[{"id": "1", "type": "input", "data": {"label": "Stripe Webhook"}}, {"id": "2", "data": {"label": "Decrypt Vault"}}]'::jsonb,
        '[{"id": "e1-2", "source": "1", "target": "2", "animated": true}]'::jsonb, true)
    RETURNING id INTO v_workflow_id;

    INSERT INTO public.execution_logs (user_id, parent_type, parent_id, status, execution_time_ms, payload)
    VALUES (v_user_id, 'cron', v_cron_id, 'success', 142, '{"status": "completed"}'::jsonb);

    INSERT INTO public.execution_logs (user_id, parent_type, parent_id, status, execution_time_ms, retry_count, payload, error_message)
    VALUES (v_user_id, 'workflow', v_workflow_id, 'retry', 890, 2, '{"step": "vault_handshake"}'::jsonb, '504 Gateway Timeout');

    INSERT INTO public.vault_secrets (user_id, key_name, encrypted_value, description)
    VALUES (v_user_id, 'STRIPE_LIVE_SECRET_KEY', 'sk_live_***REPLACE***', 'Stripe payments')
    ON CONFLICT (user_id, key_name) DO NOTHING;

    -- FIXED: Check if queue exists before create
    SELECT EXISTS (SELECT 1 FROM pgmq.list_queues() WHERE queue_name = 'production_worker_queue') INTO v_queue_exists;
    IF NOT v_queue_exists THEN
        PERFORM pgmq.create('production_worker_queue');
    END IF;

    PERFORM pgmq.send('production_worker_queue', '{"event": "invoice.payment_succeeded", "amount": 29900, "tier": "Enterprise"}'::jsonb);
    PERFORM pgmq.send('production_worker_queue', '{"event": "user.provision", "domain": "cluster-04.io"}'::jsonb);
    PERFORM pgmq.send('production_worker_queue', '{"event": "rotate_vault_keys"}'::jsonb);

    RAISE NOTICE 'Seed complete: 2 logs + 3 queue items + 1 vault secret';
END $$;
