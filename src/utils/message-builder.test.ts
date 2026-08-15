import { describe, it, expect } from 'vitest';
import { buildJobApplicationMessage } from '@/utils/message-builder';

describe('GATE-MSG-UX-02: Candidate Message Contract', () => {
  it('does not expose internal vagaId', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: 'teste',
    });

    expect(message).not.toContain('ID da vaga');
    expect(message).not.toContain('15');
    expect(message).not.toContain('Slug:');
    expect(message).not.toContain('auxiliar-de-producao-oportunidade-3');
  });

  it('does not expose payload technical fields', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: 'teste',
    });

    expect(message).not.toContain('Abrir app');
    expect(message).not.toContain('Continuar para o WhatsApp Web');
    expect(message).not.toContain('Baixar agora');
    expect(message).not.toContain('tenant_id');
    expect(message).not.toContain('payload');
  });

  it('normalizes contract type labels', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: 'teste',
    });

    expect(message).toContain('Estágio');
  });

  it('does not render undefined/null/boolean/array/object as text', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: 'teste',
    });

    expect(message).not.toContain('undefined');
    expect(message).not.toContain('null');
    expect(message).not.toContain('true');
    expect(message).not.toContain('false');
    expect(message).not.toContain('[object');
  });

  it('formats phone number correctly', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: 'teste',
    });

    expect(message).toContain('(11) 91066-9810');
  });

  it('omits empty message block when message is empty', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: '   ',
    });

    expect(message).not.toContain('Mensagem:');
    expect(message).not.toContain('Mensagem :');
  });

  it('preserves message candidate text', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'ESTAGIO',
      experience: '1 ano',
      message: 'yrgdg',
    });

    expect(message).toContain('yrgdg');
  });

  it('does not expose job slug even when provided', () => {
    const message = buildJobApplicationMessage({
      jobTitle: 'Auxiliar de Produção',
      name: 'Evandro Andrade',
      email: 'evandro_j.o.a@hotmail.com',
      phone: '11910669810',
      city: 'Poá',
      contract: 'CLT',
      experience: '2 anos',
      message: 'Interessado na vaga',
    });

    expect(message).not.toContain('auxiliar-de-producao-oportunidade-3');
    expect(message).not.toContain('ID da vaga');
    expect(message).not.toContain('Slug');
  });
});
