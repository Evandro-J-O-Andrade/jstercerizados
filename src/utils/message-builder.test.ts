import { describe, it, expect } from 'vitest';
import {
  buildServiceRequestMessage,
  buildJobApplicationMessage,
  buildContactMessage,
  buildPartnerMessage,
  buildSupplierMessage,
  buildCandidateMessage,
} from '@/utils/message-builder';
import { getWhatsAppUrl } from '@/config/contacts';

describe('message-builder', () => {
  it('builds service request message with optional fields', () => {
    const message = buildServiceRequestMessage({
      name: 'João',
      company: undefined,
      email: 'joao@example.com',
      phone: '11999999999',
      city: 'São Paulo',
      environment: null,
      bestTime: '',
      message: 'Quero limpeza',
    });

    expect(message).toContain('*Serviço:* Não informado');
    expect(message).toContain('*Nome:* João');
    expect(message).toContain('*Empresa:* -');
    expect(message).toContain('*E-mail:* joao@example.com');
    expect(message).toContain('*Telefone:* 11999999999');
    expect(message).toContain('*Cidade:* São Paulo');
    expect(message).toContain('*Ambiente:* -');
    expect(message).toContain('*Melhor horário:* -');
    expect(message).toContain('*Mensagem:* Quero limpeza');
  });

  it('builds job application message with optional fields', () => {
    const message = buildJobApplicationMessage({
      name: 'Maria',
      email: 'maria@example.com',
      phone: '11999999999',
      city: 'Poá',
      contract: undefined,
      experience: null,
      message: '',
    });

    expect(message).toContain('*Vaga:* -');
    expect(message).toContain('*ID da vaga:* -');
    expect(message).toContain('*Slug:* -');
    expect(message).toContain('*Nome:* Maria');
    expect(message).toContain('*E-mail:* maria@example.com');
    expect(message).toContain('*Telefone:* 11999999999');
    expect(message).toContain('*Cidade:* Poá');
    expect(message).toContain('*Tipo de contrato:* -');
    expect(message).toContain('*Experiência:* -');
    expect(message).toContain('*Mensagem:* -');
  });

  it('builds contact message', () => {
    const message = buildContactMessage({
      name: 'Ana',
      company: 'ABC',
      email: 'ana@example.com',
      phone: '11999999999',
      subject: 'Orçamento',
      message: undefined,
    });

    expect(message).toContain('*Novo contato pelo site*');
    expect(message).toContain('*Nome:* Ana');
    expect(message).toContain('*Empresa:* ABC');
    expect(message).toContain('*Assunto:* Orçamento');
    expect(message).toContain('*Mensagem:* -');
  });

  it('builds partner message', () => {
    const message = buildPartnerMessage({
      company: 'XPTO',
      cnpj: '12345678901234',
      responsible: 'Carlos',
      phone: '11999999999',
      email: 'carlos@example.com',
      area: 'TI',
      city: 'São Paulo',
      state: 'SP',
      documentation: '',
    });

    expect(message).toContain('*Novo cadastro de parceiro*');
    expect(message).toContain('*Empresa:* XPTO');
    expect(message).toContain('*CNPJ:* 12345678901234');
    expect(message).toContain('*Responsável:* Carlos');
    expect(message).toContain('*Documentação:* -');
  });

  it('builds supplier message', () => {
    const message = buildSupplierMessage({
      company: 'Fornecedor XYZ',
      cnpj: null,
      products: 'Papel',
      representative: 'José',
      phone: '11999999999',
      email: 'jose@example.com',
    });

    expect(message).toContain('*Novo cadastro de fornecedor*');
    expect(message).toContain('*Empresa:* Fornecedor XYZ');
    expect(message).toContain('*CNPJ:* -');
    expect(message).toContain('*Produtos/Serviços:* Papel');
  });

  it('builds candidate message with positions array', () => {
    const message = buildCandidateMessage({
      name: 'Luísa',
      cpf: undefined,
      rg: null,
      phone: '11999999999',
      email: 'luisa@example.com',
      city: 'Campinas',
      positions: ['auxiliar-logistico', 'assistente-administrativo'],
      experience: '2 anos',
      courses: 'Administração',
      availability: 'Integral',
      schedule: '1º turno',
      resume: 'Experiência em estoque',
    });

    expect(message).toContain('*Nova candidatura - Banco de Talentos*');
    expect(message).toContain('*Nome:* Luísa');
    expect(message).toContain('*CPF:* -');
    expect(message).toContain('*RG:* -');
    expect(message).toContain(
      '*Áreas de interesse:* auxiliar-logistico, assistente-administrativo',
    );
    expect(message).toContain('*Currículo:* Experiência em estoque');
  });

  it('preserves accents, emojis, symbols and newlines', () => {
    const message = buildServiceRequestMessage({
      serviceName: 'Limpeza & Conservação',
      name: 'Ação José',
      company: 'Soluçãoção LTDA',
      email: 'joao@example.com',
      phone: '11999999999',
      city: 'São Paulo',
      environment: 'Comercial',
      bestTime: '14h às 17h',
      message: 'Preciso de uma limpeza pesada!\nCom urgência 😉',
    });

    expect(message).toContain('Ação José');
    expect(message).toContain('Soluçãoção LTDA');
    expect(message).toContain('Limpeza & Conservação');
    expect(message).toContain('14h às 17h');
    expect(message).toContain(
      'Preciso de uma limpeza pesada!\nCom urgência 😉',
    );
  });

  it('does not expose %20 or %0A in the raw message', () => {
    const message = buildServiceRequestMessage({
      serviceName: 'Limpeza',
      name: 'João da Silva',
      company: 'ABC',
      email: 'joao@example.com',
      phone: '11999999999',
      city: 'São Paulo',
      environment: 'Comercial',
      bestTime: '14h às 17h',
      message: 'Mensagem com espaços e\nquebra de linha',
    });

    expect(message).not.toContain('%20');
    expect(message).not.toContain('%0A');
    expect(message).toContain('João da Silva');
    expect(message).toContain('Mensagem com espaços e\nquebra de linha');
  });
});

describe('getWhatsAppUrl', () => {
  it('encodes message exactly once', () => {
    const url = getWhatsAppUrl('5511968380592', 'Olá, mundo!');
    expect(url).toBe('https://wa.me/5511968380592?text=Ol%C3%A1%2C%20mundo!');
  });

  it('does not double-encode already encoded text', () => {
    const url = getWhatsAppUrl('5511968380592', 'Olá, mundo!');
    expect(url).not.toContain('%2520');
    expect(url).not.toContain('%250A');
  });

  it('preserves accents and emojis through encodeURIComponent', () => {
    const url = getWhatsAppUrl('5511968380592', 'Ação 😉');
    expect(url).toContain('A%C3%A7%C3%A3o%20%F0%9F%98%89');
  });
});
