import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    if (!prompt) throw new Error('Missing prompt')

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) throw new Error('OPENAI_API_KEY not set in Supabase secrets')

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are SupaFlow AI - expert in Postgres and React Flow. Convert user prompt into workflow JSON. Output ONLY valid JSON like: {"nodes": [{"id":"1","type":"input","position":{"x":100,"y":150},"data":{"label":"Stripe Webhook fails"}}], "edges": [{"id":"e1-2","source":"1","target":"2"}]}',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    const data = await openaiRes.json()
    const content = data.choices?.[0]?.message?.content || ''

    let workflow
    try {
      workflow = JSON.parse(content)
    } catch {
      // Fallback if AI returns text
      workflow = {
        nodes: [
          { id: '1', type: 'input', position: { x: 100, y: 150 }, data: { label: 'Stripe Webhook fails' } },
          { id: '2', position: { x: 380, y: 150 }, data: { label: 'Read STRIPE_SECRET from Vault' } },
        ],
        edges: [{ id: 'e1-2', source: '1', target: '2' }],
      }
    }

    return new Response(JSON.stringify(workflow), {
      headers: {...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, nodes: [], edges: [] }), {
      status: 500,
      headers: {...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})