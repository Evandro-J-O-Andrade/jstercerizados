const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1';
const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173';
const APP_NAME = import.meta.env.VITE_COMPANY_NAME ?? 'J&S Empregos';

export async function sendToOpenRouter(
  messages: Array<{ role: string; content: string }>,
) {
  if (!OPENROUTER_API_KEY) {
    console.warn('VITE_OPENROUTER_API_KEY is not configured');
    return { ok: false, reason: 'missing_api_key' as const };
  }

  try {
    const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-OpenRouter-Title': APP_NAME,
      },
      body: JSON.stringify({
        model: 'openai/gpt-5.2',
        messages: [
          {
            role: 'system',
            content:
              'Você é o assistente virtual da J&S Empregos LTDA. Responda de forma profissional, amigável e objetiva. A empresa oferece: recrutamento e seleção, mão de obra temporária e efetiva, terceirização, assessoria em RH, limpeza, segurança patrimonial, portaria, jardinagem e zeladoria. Se o usuário quiser falar com atendimento humano, informe que ele pode clicar na opção "Falar com atendimento humano" ou entrar em contato pelo WhatsApp (11) 96838-0592.',
          },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return { ok: false, reason: 'api_error' as const };
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
      return { ok: false, reason: 'empty_reply' as const };
    }

    return { ok: true, reply };
  } catch (error) {
    console.error('Error sending to OpenRouter:', error);
    return { ok: false, reason: 'network_error' as const };
  }
}
