import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { COMPANY, getWhatsAppUrl } from '@/config';
import { Mail, MapPin, Clock, CheckCircle2, Upload } from 'lucide-react';

type JobApplicationFormProps = {
  jobTitle?: string;
  jobSlug?: string;
  vagaId?: string;
};

const contractOptions = [
  { value: '', label: 'Selecione' },
  { value: 'CLT', label: 'CLT' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'TEMPORARIO', label: 'Temporário' },
  { value: 'FREELA', label: 'Freelance' },
  { value: 'TERCEIRIZADO', label: 'Terceirizado' },
  { value: 'CD', label: 'C/D' },
];

export function JobApplicationForm({
  jobTitle,
  jobSlug,
  vagaId,
}: JobApplicationFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    contract: '',
    experience: '',
    message: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const message = encodeURIComponent(
      `*Nova candidatura*\n\n` +
        `*Vaga:* ${jobTitle || 'Não informada'}\n` +
        `*ID da vaga:* ${vagaId || '-'}\n` +
        `*Slug:* ${jobSlug || '-'}\n` +
        `*Nome:* ${form.name}\n` +
        `*E-mail:* ${form.email}\n` +
        `*Telefone:* ${form.phone}\n` +
        `*Cidade:* ${form.city}\n` +
        `*Tipo de contrato:* ${form.contract || '-'}\n` +
        `*Experiência:* ${form.experience || '-'}\n` +
        `*Mensagem:* ${form.message || '-'}`,
    );

    window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');

    setLoading(false);
    setSuccess(true);
    setForm({
      name: '',
      email: '',
      phone: '',
      city: '',
      contract: '',
      experience: '',
      message: '',
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
          Candidatura enviada!
        </h3>
        <p className="text-muted-foreground mb-6">
          Recebemos sua candidatura. Nossa equipe entrará em contato em breve.
        </p>
        <Button variant="secondary" onClick={() => setSuccess(false)}>
          Nova candidatura
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
          Candidatar-se à vaga
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
          label="Tipo de contrato desejado"
          name="contract"
          value={form.contract}
          onChange={update('contract')}
        >
          {contractOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Input
          label="Experiência profissional"
          name="experience"
          value={form.experience}
          onChange={update('experience')}
          placeholder="Ex.: 2 anos em atendimento"
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Mensagem"
          name="message"
          value={form.message}
          onChange={update('message')}
          rows={4}
          placeholder="Conte um pouco sobre você..."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          <Upload className="mr-2 h-4 w-4" />
          Enviar candidatura
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
