
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    const start = performance.now();
    const { cronId, targetWebhook, payload, userId, secretKeyName } = await req.json();
    
    // FIXED: Try to fetch secret from vault_secrets if secretKeyName provided
    let extraHeaders: Record<string,string> = { 'Content-Type': 'application/json' };
    if (secretKeyName && userId) {
      const { data } = await supabase.from('vault_secrets').select('encrypted_value').eq('user_id', userId).eq('key_name', secretKeyName).single();
      if (data) extraHeaders['Authorization'] = `Bearer ${data.encrypted_value}`;
    }

    let response: Response | null = null;
    try {
      response = await fetch(targetWebhook, { method: 'POST', headers: extraHeaders, body: JSON.stringify({ ...payload, triggered_by: 'SupaFlow' }) });
    } catch (fetchErr) {
      // FIXED: On fetch failure, push to dead-letter queue for retry
      await supabase.rpc('pgmq_send', { queue_name: 'production_worker_queue', message: { event: 'cron_failed_retry', cronId, error: (fetchErr as Error).message, payload } } as any);
      throw fetchErr;
    }

    const executionTimeMs = Math.round(performance.now() - start);
    await supabase.from('execution_logs').insert({
      user_id: userId, parent_type: 'cron', parent_id: cronId,
      status: response.ok ? 'success' : 'failed',
      execution_time_ms: executionTimeMs, payload,
      error_message: response.ok ? null : `Status ${response.status}`
    });

    return new Response(JSON.stringify({ success: response?.ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
