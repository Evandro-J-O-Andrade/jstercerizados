import { describe, it, expect } from 'vitest';
import {
  normalizeChatResponse,
  detectChatIntent,
  detectChatDepartment,
  getHumanHandoffMessage,
  getIntentReply,
} from '@/lib/chat-response-normalizer';
import type { Intent } from '@/lib/chat-response-normalizer';

describe('chat-response-normalizer', () => {
  it('replaces how_to_register with humanized reply', () => {
    const result = normalizeChatResponse('how_to_register');
    expect(result).not.toContain('how_to_register');
    expect(result).toContain('cadastrar seu currículo');
  });

  it('replaces human_support with humanized reply', () => {
    const result = normalizeChatResponse('human_support');
    expect(result).not.toContain('human_support');
    expect(result).toContain('atendimento humano');
  });

  it('replaces internal keys in longer strings', () => {
    const result = normalizeChatResponse('Algo sobre how_to_register e RH');
    expect(result).not.toContain('how_to_register');
    expect(result).toContain('cadastrar seu currículo');
  });

  it('does not change clean user messages', () => {
    const input = 'Olá, gostaria de saber mais sobre vagas';
    const result = normalizeChatResponse(input);
    expect(result).toBe(input);
  });

  it('detects candidate intent from natural text', () => {
    expect(detectChatIntent('Como faço para me cadastrar?')).toBe(
      'how_to_register',
    );
    expect(detectChatIntent('Quero me cadastrar no site')).toBe(
      'how_to_register',
    );
    expect(detectChatIntent('Quero candidatar-me a uma vaga')).toBe(
      'how_to_register',
    );
  });

  it('detects company intent from natural text', () => {
    expect(detectChatIntent('Como minha empresa pode contratar?')).toBe(
      'how_to_hire',
    );
  });

  it('detects rh_services intent', () => {
    expect(detectChatIntent('Quais serviços de RH vocês oferecem?')).toBe(
      'rh_services',
    );
  });

  it('detects request_quote intent', () => {
    expect(detectChatIntent('Quero solicitar um orçamento')).toBe(
      'request_quote',
    );
  });

  it('detects job_info intent', () => {
    expect(detectChatIntent('Quero informações sobre uma vaga')).toBe(
      'job_info',
    );
  });

  it('returns unknown for unmatched text', () => {
    expect(detectChatIntent('Texto aleatório sem intenção conhecida')).toBe(
      'unknown',
    );
  });

  it('detects rh department', () => {
    expect(detectChatDepartment('Quero falar com RH')).toBe('rh');
    expect(detectChatDepartment('Preciso de ajuda com currículo')).toBe('rh');
  });

  it('detects financeiro department', () => {
    expect(detectChatDepartment('Quero falar com financeiro')).toBe(
      'financeiro',
    );
    expect(detectChatDepartment('Tenho dúvidas sobre boleto')).toBe(
      'financeiro',
    );
  });

  it('detects comercial department', () => {
    expect(detectChatDepartment('Quero um orçamento')).toBe('comercial');
    expect(detectChatDepartment('Quero contratar serviços')).toBe('comercial');
  });

  it('detects suporte department', () => {
    expect(detectChatDepartment('Preciso de suporte')).toBe('suporte');
    expect(detectChatDepartment('Estou com um problema')).toBe('suporte');
  });

  it('detects central department for generic help', () => {
    expect(detectChatDepartment('Quero falar com atendimento humano')).toBe(
      'central',
    );
    expect(detectChatDepartment('Alô?')).toBe('central');
  });

  it('returns humanized handoff message for each department', () => {
    expect(getHumanHandoffMessage('rh')).toContain('RH');
    expect(getHumanHandoffMessage('financeiro')).toContain('financeiro');
    expect(getHumanHandoffMessage('comercial')).toContain('comercial');
    expect(getHumanHandoffMessage('suporte')).toContain('suporte');
    expect(getHumanHandoffMessage('central')).toContain('Central');
  });

  it('never exposes internal keys in intent replies', () => {
    const intents: Intent[] = [
      'how_to_register',
      'how_selection_works',
      'where_to_see_jobs',
      'how_to_hire',
      'rh_services',
      'request_quote',
      'human_support',
      'candidate',
      'company',
      'job_info',
      'hire',
      'unknown',
    ];

    for (const intent of intents) {
      const reply = getIntentReply(intent);
      expect(reply).not.toMatch(
        /how_to_register|how_selection_works|where_to_see_jobs|how_to_hire|rh_services|request_quote|human_support|candidate|company|job_info|hire|unknown_intent/,
      );
    }
  });

  it('handles accents, emojis and symbols in clean messages', () => {
    const input = 'Preciso de ajuda com o cadastro 😉';
    const result = normalizeChatResponse(input);
    expect(result).toBe(input);
  });

  it('handles empty string', () => {
    const result = normalizeChatResponse('');
    expect(result).toContain('atendente');
  });

  it('handles null-like strings without internal keys', () => {
    const result = normalizeChatResponse('undefined');
    expect(result).toBe('undefined');
  });

  it('does not expose raw internal keys even when embedded in text', () => {
    const result = normalizeChatResponse(
      'Usuário quer saber sobre how_to_register e request_quote',
    );
    expect(result).not.toContain('how_to_register');
    expect(result).not.toContain('request_quote');
  });
});
