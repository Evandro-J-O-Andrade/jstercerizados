import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { COMPANY } from '@/config';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';

export default function Vagas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs', 'public'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('jobs')
        .select(
          'id, title, description, status, employment_type, location, salary, benefits, requirements, published_at, created_at',
        )
        .eq('tenant_id', 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[Vagas] query error', error);
        throw error;
      }
      console.log('[Vagas] query result', data);
      return (data || []) as Array<{
        id: string;
        title: string;
        description: string | null;
        status: string;
        employment_type: string | null;
        location: string | null;
        salary: string | null;
        benefits: string | null;
        requirements: string | null;
        published_at: string | null;
        created_at: string;
      }>;
    },
  });

  const filteredJobs = useMemo(() => {
    if (!jobs.length) return [];

    return jobs.filter((job) => {
      if (
        searchTerm &&
        !job.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (tipoFilter && job.employment_type !== tipoFilter) {
        return false;
      }
      if (
        modalidadeFilter &&
        !(job.location || '')
          .toLowerCase()
          .includes(modalidadeFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [jobs, searchTerm, tipoFilter, modalidadeFilter]);

  const formatCurrency = (value: string | null) => {
    if (!value) return null;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return null;
    return numeric.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const isRemote = (location?: string | null) => {
    if (!location) return false;
    return /remoto|home office|trabalho de casa/i.test(location);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setModalidadeFilter('');
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={`Vagas — ${COMPANY.name}`}
        description={`Oportunidades de trabalho, vagas de emprego e trabalho de casa (remoto) na ${COMPANY.name}. Encontre sua próxima oportunidade profissional.`}
        keywords={[
          'vagas',
          'emprego',
          'trabalho',
          'oportunidades',
          'recrutamento',
          'seleção',
          'RH',
          'currículo',
          'trabalho de casa',
          'remoto',
          'home office',
          'trabalho remoto',
        ]}
        type="WebSite"
      />
      <Section className="pt-20 md:pt-28">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerReveal(0.15)}
            className="mb-12 text-center"
          >
            <motion.h1
              variants={revealUp}
              className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl"
            >
              Vagas Disponíveis
            </motion.h1>
            <motion.p
              variants={revealUp}
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg"
            >
              Encontre a oportunidade ideal para o seu perfil profissional.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="relative md:w-96">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Busque por cargo, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-colors outline-none focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2 md:w-48"
              >
                <option value="">Todos os contratos</option>
                <option value="clt">CLT</option>
                <option value="temporary">Temporário</option>
                <option value="internship">Estágio</option>
                <option value="freelance">Freela</option>
              </select>
              <select
                value={modalidadeFilter}
                onChange={(e) => setModalidadeFilter(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2 md:w-48"
              >
                <option value="">Todas as modalidades</option>
                <option value="onsite">Presencial</option>
                <option value="hybrid">Híbrido</option>
                <option value="remote">Remoto</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="rounded-xl"
              >
                Limpar filtros
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => {
              const salaryFormatted = formatCurrency(job.salary);
              const location = job.location || '';
              const remote = isRemote(location);

              return (
                <motion.div
                  key={job.id}
                  variants={staggerItem('up')}
                  className="group bg-card border-border hover:border-primary/30 flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-foreground group-hover:text-primary text-lg font-semibold transition-colors">
                        {job.title}
                      </h3>
                      {job.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                          {job.description}
                        </p>
                      )}
                    </div>
                    {job.employment_type && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        {job.employment_type.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
                    {location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {location}
                      </span>
                    )}
                    {remote && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        Remoto
                      </span>
                    )}
                    {salaryFormatted && (
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {salaryFormatted}
                      </span>
                    )}
                  </div>

                  {job.benefits && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.benefits
                        .split(';')
                        .map((benefit) => benefit.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((benefit) => (
                          <span
                            key={benefit}
                            className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                          >
                            {benefit}
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <Link to={`/vagas/${job.id}`}>
                      <Button variant="secondary" size="sm" className="w-full">
                        Ver detalhes
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-20 text-center"
            >
              <p className="text-muted-foreground text-lg">
                Nenhuma vaga encontrada para os filtros selecionados.
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={clearFilters}
              >
                Limpar filtros
              </Button>
            </motion.div>
          )}
        </Container>
      </Section>
    </div>
  );
}
