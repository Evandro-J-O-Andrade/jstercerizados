import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-5.2';

const SYSTEM_PROMPT = `Você é a assistente virtual oficial da J&S Empregos LTDA, uma Agência de Empregos e Assessoria em RH. Atenda visitantes do site com linguagem natural, cordial, objetiva e útil. Responda em português do Brasil. Direcione candidatos para /vagas e /trabalhe-conosco. Direcione empresas para /empresas e WhatsApp (11) 96838-0592. Nunca invente vagas, salários, benefícios, disponibilidade ou dados de candidatos. Quando não souber, ofereça atendimento humano.`;

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'http://localhost:3000',
  'http://localhost',
];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number, req: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(req),
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, req);
  }

  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    console.error('[chat] OPENROUTER_API_KEY not configured');
    return json({ ok: false, error: 'server_misconfigured' }, 500, req);
  }

  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const model = typeof body?.model === 'string' ? body.model : DEFAULT_MODEL;

    if (messages.length === 0) {
      return json({ ok: false, error: 'No messages provided' }, 400, req);
    }

    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://jsempregos.com.br',
        'X-OpenRouter-Title': 'J&S Empregos LTDA',
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[chat] OpenRouter error', {
        status: response.status,
        body: errText,
      });
      return json(
        { ok: false, error: `OpenRouter error: ${response.status}` },
        response.status,
        req,
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!reply) {
      return json({ ok: false, error: 'Empty reply from model' }, 502, req);
    }

    return json({ ok: true, reply }, 200, req);
  } catch (error) {
    console.error('[chat] exception', error);
    const err = error instanceof Error ? error.message : 'Unknown error';
    return json({ ok: false, error: err }, 500, req);
  }
});
