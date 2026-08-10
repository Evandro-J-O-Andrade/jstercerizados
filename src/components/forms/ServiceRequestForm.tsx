import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { COMPANY, getWhatsAppUrl } from '@/config';

type ServiceRequestFormProps = {
  serviceSlug?: string;
  serviceName?: string;
};

const serviceOptions = [
  { value: '', label: 'Selecione um serviço' },
  { value: 'assessoria-rh', label: 'Assessoria em RH' },
  { value: 'recrutamento-selecao', label: 'Recrutamento e Seleção' },
  { value: 'mao-de-obra-temporaria', label: 'Mão de Obra Temporária' },
  { value: 'mao-de-obra-efetiva', label: 'Mão de Obra Efetiva' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'limpeza-conservacao', label: 'Limpeza e Conservação' },
  { value: 'limpeza-de-fachada', label: 'Limpeza de Fachada' },
  { value: 'limpeza-de-vidros', label: 'Limpeza de Vidros' },
  { value: 'limpeza-pre-mudanca', label: 'Limpeza Pré-Mudança' },
  { value: 'limpeza-pos-mudanca', label: 'Limpeza Pós-Mudança' },
  { value: 'limpeza-pos-obra', label: 'Limpeza Pós-Obra' },
  { value: 'jardinagem', label: 'Jardinagem' },
  { value: 'terceirizacao', label: 'Terceirização' },
  { value: 'outro', label: 'Outro' },
];

const environmentOptions = [
  { value: '', label: 'Selecione o tipo de ambiente' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'condominio', label: 'Condomínio' },
  { value: 'outro', label: 'Outro' },
];

export function ServiceRequestForm({
  serviceSlug,
  serviceName,
}: ServiceRequestFormProps) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: '',
    service: serviceSlug ?? '',
    environment: '',
    message: '',
    bestTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  useEffect(() => {
    if (serviceSlug) {
      setForm((prev) => ({ ...prev, service: serviceSlug }));
    }
  }, [serviceSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const message = encodeURIComponent(
      `*Nova solicitação de serviço*\n\n` +
        `*Serviço:* ${serviceName || form.service || 'Não informado'}\n` +
        `*Nome:* ${form.name}\n` +
        `*Empresa:* ${form.company || '-'}\n` +
        `*E-mail:* ${form.email}\n` +
        `*Telefone:* ${form.phone}\n` +
        `*Cidade:* ${form.city}\n` +
        `*Ambiente:* ${form.environment || '-'}\n` +
        `*Melhor horário:* ${form.bestTime || '-'}\n` +
        `*Mensagem:* ${form.message || '-'}`,
    );

    window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');

    setLoading(false);
    setSuccess(true);
    setForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      city: '',
      service: serviceSlug ?? '',
      environment: '',
      message: '',
      bestTime: '',
    });
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-border rounded-2xl border p-8 text-center"
      >
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-2 text-2xl font-bold">
          Solicitação enviada!
        </h3>
        <p className="text-muted-foreground mb-6">
          Recebemos sua solicitação. Nossa equipe entrará em contato em breve.
        </p>
        <Button variant="secondary" onClick={() => setSuccess(false)}>
          Nova solicitação
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border-border rounded-2xl border p-6 sm:p-8"
    >
      <div className="mb-6">
        <h3 className="text-foreground mb-2 text-xl font-bold">
          Solicitar orçamento
        </h3>
        <p className="text-muted-foreground text-sm">
          Preencha o formulário e nossa equipe entrará em contato.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nome completo"
          name="name"
          value={form.name}
          onChange={update('name')}
          required
        />
        <Input
          label="Empresa"
          name="company"
          value={form.company}
          onChange={update('company')}
        />
        <Input
          label="E-mail"
          type="email"
          name="email"
          value={form.email}
          onChange={update('email')}
          required
        />
        <Input
          label="Telefone/WhatsApp"
          name="phone"
          value={form.phone}
          onChange={update('phone')}
          required
        />
        <Input
          label="Cidade"
          name="city"
          value={form.city}
          onChange={update('city')}
          required
        />
        <Select
          label="Serviço"
          name="service"
          value={form.service}
          onChange={update('service')}
          required
        >
          {serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          label="Tipo de ambiente"
          name="environment"
          value={form.environment}
          onChange={update('environment')}
        >
          {environmentOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Input
          label="Melhor horário para contato"
          name="bestTime"
          value={form.bestTime}
          onChange={update('bestTime')}
          placeholder="Ex.: 14h às 17h"
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Mensagem"
          name="message"
          value={form.message}
          onChange={update('message')}
          rows={4}
          placeholder="Descreva sua necessidade..."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          <Phone className="mr-2 h-4 w-4" />
          Solicitar orçamento
        </Button>

        <div className="text-muted-foreground flex flex-col gap-1 text-xs">
          <span className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            {COMPANY.email}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Seg a Sex, 08h às 18h
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {COMPANY.address.city} - SP
          </span>
        </div>
      </div>
    </form>
  );
}
