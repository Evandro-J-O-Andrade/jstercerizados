import { SYSTEM_PROMPT, DEFAULT_MODEL } from '../../src/lib/openrouter';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'developer';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

export interface ChatResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}

export const onRequestPost = async (
  req: Request,
  env: { OPENROUTER_API_KEY: string },
) => {
  try {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: 'API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = (await req.json()) as ChatRequest;

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid messages array' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
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
      return new Response(
        JSON.stringify({
          ok: false,
          error: `OpenRouter error: ${response.status}`,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!reply) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Empty reply from model' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true, reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
