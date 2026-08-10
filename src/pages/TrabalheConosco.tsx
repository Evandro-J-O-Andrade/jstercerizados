import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send, Briefcase, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { mockSubmitCandidate } from '@/services/mock/curriculos';
import { COMPANY, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@/config';
import { cn } from '@/utils';

const positionOptions = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'logistica', label: 'Logística e Armazém' },
  { value: 'producao', label: 'Produção' },
  { value: 'ti', label: 'Tecnologia da Informação' },
  { value: 'comercio', label: 'Comércio e Varejo' },
  { value: 'servicos', label: 'Serviços Gerais' },
  { value: 'limpeza', label: 'Limpeza e Conservação' },
  { value: 'seguranca', label: 'Segurança e Portaria' },
  { value: 'zeladoria', label: 'Zeladoria e Manutenção' },
  { value: 'outro', label: 'Outra área de atuação' },
];

const candidateSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  email: z.string().email('E-mail inválido'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  position: z.string().min(1, 'Selecione uma área de atuação'),
  experience: z.string().min(2, 'Experiência é obrigatória'),
  courses: z.string().optional(),
  availability: z.string().optional(),
  schedule: z.string().optional(),
  resume: z.string().min(2, 'Currículo é obrigatório'),
  resumeFile: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        return validTypes.includes(file.type);
      },
      { message: 'Apenas PDF, DOC ou DOCX são aceitos' },
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        return file.size <= 10 * 1024 * 1024;
      },
      { message: 'O arquivo deve ter no máximo 10 MB' },
    ),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

export default function TrabalheConosco() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      position: '',
    },
  });

  const onSubmit = async (data: CandidateFormData): Promise<void> => {
    const resumeFile = data.resumeFile?.[0] ?? null;

    mockSubmitCandidate({
      name: data.name,
      cpf: data.cpf ?? '',
      rg: data.rg ?? '',
      phone: data.phone,
      email: data.email,
      city: data.city,
      experience: data.experience,
      position: data.position,
      resume: data.resume,
      availability: data.availability ?? '',
      courses: data.courses ?? '',
      status: 'received',
      resumeFileName: resumeFile?.name ?? '',
    });
    setSubmitted(true);
    reset();
    setSelectedPosition('');
    setSelectedFile(null);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center"
        >
          <div className="bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <CheckCircle2 className="text-success h-10 w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Currículo Enviado!
          </h2>
          <p className="text-muted-foreground mb-8">
            Seu currículo foi recebido. A equipe de RH analisará seu perfil e
            entrará em contato caso haja interesse.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={getWhatsAppUrl(COMPANY.whatsapp, WHATSAPP_MESSAGES.careers)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                <Send className="mr-2 h-5 w-5" />
                Continuar no WhatsApp
              </Button>
            </a>
            <Link to="/">
              <Button variant="outline" size="lg">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <SEO
        title={`Trabalhe Conosco — ${COMPANY.name}`}
        description={`Cadastre seu currículo na ${COMPANY.name} e candidate-se às nossas oportunidades de trabalho.`}
        keywords={[
          'trabalhe conosco',
          'currículo',
          'candidatura',
          'emprego',
          'trabalho',
          COMPANY.name,
          'RH',
          'recrutamento',
        ]}
        type="WebSite"
      />
      <Section>
        <Container>
          <div className="mb-12 text-center">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              Banco de Talentos
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Cadastre seu currículo, escolha a vaga de interesse e faça parte
              do nosso banco de talentos para futuras oportunidades.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  Banco de Talentos
                </div>
                <p className="text-muted-foreground">
                  Selecione sua área de atuação e preencha o formulário com seus
                  dados e anexe seu currículo.
                </p>

                <div className="mt-6 space-y-3">
                  {positionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                        selectedPosition === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary',
                      )}
                    >
                      <input
                        type="radio"
                        name="position"
                        value={opt.value}
                        checked={selectedPosition === opt.value}
                        onChange={(e) => setSelectedPosition(e.target.value)}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-muted-foreground text-sm font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-3">
              {selectedPosition && (
                <motion.form
                  key={selectedPosition}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-card border-border shadow-premium rounded-2xl border p-8"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Input
                        label="Nome Completo *"
                        placeholder="Seu nome completo"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="CPF"
                        placeholder="000.000.000-00"
                        error={errors.cpf?.message}
                        {...register('cpf')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="RG"
                        placeholder="00.000.000-0"
                        error={errors.rg?.message}
                        {...register('rg')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Cursos"
                        placeholder="Ex: Administração, Informática..."
                        error={errors.courses?.message}
                        {...register('courses')}
                      />
                    </div>
                    <div>
                      <Input
                        label="Disponibilidade"
                        placeholder="Ex: Integral, Manhã, Tarde..."
                        error={errors.availability?.message}
                        {...register('availability')}
                      />
                    </div>
                    <div>
                      <Input
                        label="Escala Preferida"
                        placeholder="Ex: 2º turno, Noturno..."
                        error={errors.schedule?.message}
                        {...register('schedule')}
                      />
                    </div>

                    <div>
                      <Input
                        label="Telefone *"
                        placeholder="(11) 99999-9999"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>
                    <div>
                      <Input
                        label="E-mail *"
                        type="email"
                        placeholder="seu@email.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>
                    <div>
                      <Input
                        label="Cidade *"
                        placeholder="São Paulo"
                        error={errors.city?.message}
                        {...register('city')}
                      />
                    </div>
                    <div>
                      <Input
                        label="Experiência *"
                        placeholder="Ex: 2 anos na área..."
                        error={errors.experience?.message}
                        {...register('experience')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Textarea
                        label="Currículo *"
                        placeholder="Descreva sua experiência profissional..."
                        rows={4}
                        error={errors.resume?.message}
                        {...register('resume')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-muted-foreground mb-1 block text-sm font-medium">
                        Anexar Currículo (PDF, DOC, DOCX — máx. 10 MB)
                      </label>
                      <div
                        className={cn(
                          'border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 relative flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors focus:ring-2 focus:outline-none',
                          errors.resumeFile?.message &&
                            'border-destructive focus:border-destructive focus:ring-destructive/20',
                        )}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setSelectedFile(file);
                          }}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label="Selecionar arquivo de currículo"
                        />
                        <div className="pointer-events-none text-center">
                          <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                          <p className="text-muted-foreground text-sm">
                            {selectedFile
                              ? selectedFile.name
                              : 'Arraste o arquivo ou clique para selecionar'}
                          </p>
                          <p className="text-muted-foreground/60 mt-1 text-xs">
                            PDF, DOC ou DOCX — até 10 MB
                          </p>
                        </div>
                      </div>
                      {errors.resumeFile && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.resumeFile.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <input type="hidden" {...register('position')} />

                  <div className="mt-8">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      loading={isSubmitting}
                      leftIcon={<Send className="h-5 w-5" />}
                    >
                      Enviar Currículo
                    </Button>
                  </div>
                </motion.form>
              )}

              {!selectedPosition && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border-border shadow-premium rounded-2xl border p-8 text-center"
                >
                  <Briefcase className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Selecione uma vaga acima para preencher o formulário.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
