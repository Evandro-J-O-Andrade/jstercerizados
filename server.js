import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve } from 'path';
const SYSTEM_PROMPT = `Você é o assistente virtual da J&S Empregos LTDA. A J&S Empregos LTDA atua como Agência de Empregos e Assessoria em RH, oferecendo: 1. Mão de obra temporária, 2. Mão de obra efetiva, 3. Processo de RH, 4. Recrutamento e seleção, 5. Terceirização, 6. Serviços de facilities (limpeza, segurança patrimonial, portaria, jardinagem e zeladoria). Prioridades: - Se perguntar sobre vagas, oriente para /vagas. Nunca invente vaga, salário ou afirme disponibilidade sem confirmar. - Se for empresa, explique serviços e encaminhe para WhatsApp (11) 96838-0592. - Se for candidato, explique cadastro de currículo e processo seletivo. - Quando não souber, admita e ofereça atendimento humano.`;
const DEFAULT_MODEL = 'openai/gpt-5.2';

function loadEnvFile() {
  try {
    const contents = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {}
}
loadEnvFile();

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (url.pathname === '/api/chat' && req.method === 'POST') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { ok: false, error: 'API key not configured' });
      return;
    }

    try {
      const rawBody = await getBody(req);
      const body = JSON.parse(rawBody);

      if (!body.messages || !Array.isArray(body.messages)) {
        sendJson(res, 400, { ok: false, error: 'Invalid messages array' });
        return;
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...body.messages,
      ];

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://jstercerizados.com.br',
            'X-OpenRouter-Title': 'J&S Empregos LTDA',
          },
          body: JSON.stringify({
            model: body.model ?? DEFAULT_MODEL,
            messages,
            stream: false,
          }),
        },
      );

      if (!response.ok) {
        sendJson(res, response.status, {
          ok: false,
          error: `OpenRouter error: ${response.status}`,
        });
        return;
      }

      const data = await response.json();

      const reply = data.choices?.[0]?.message?.content?.trim() ?? '';

      if (!reply) {
        sendJson(res, 502, { ok: false, error: 'Empty reply from model' });
        return;
      }

      sendJson(res, 200, { ok: true, reply });
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      sendJson(res, 500, { ok: false, error: err });
    }
  } else if (url.pathname === '/api/handoff' && req.method === 'POST') {
    const n8nWebhook = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhook) {
      sendJson(res, 500, { ok: false, error: 'N8N webhook not configured' });
      return;
    }

    try {
      const rawBody = await getBody(req);
      const body = JSON.parse(rawBody);

      const response = await fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          sentAt: new Date().toISOString(),
          source: 'website-dev',
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n responded with ${response.status}`);
      }

      sendJson(res, 200, { ok: true });
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      sendJson(res, 500, { ok: false, error: err });
    }
  } else {
    sendJson(res, 404, { ok: false, error: 'Not found' });
  }
});

const PORT = 9001;
server.listen(PORT, () => {
  console.log(`[dev-server] API server running at http://localhost:${PORT}`);
});
