import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { COMPANY } from '@/config';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';

const CONTRATO_LABELS: Record<string, string> = {
  clt: 'CLT',
  temporary: 'Temporário',
  internship: 'Estágio',
  freelance: 'Freela',
};

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
          `
          id,
          title,
          description,
          status,
          employment_type,
          location,
          salary,
          benefits,
          requirements,
          published_at,
          created_at,
          company_id,
          companies (
            id,
            name,
            legal_name,
            status
          )
        `,
        )
        .eq('tenant_id', 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[Vagas] query error', error);
        throw error;
      }
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
        company_id: string | null;
        companies: Array<{
          id: string;
          name: string;
          legal_name: string | null;
          status: string;
        }> | null;
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
              const location = job.location || '';
              const remote = isRemote(location);

              return (
                <motion.div
                  key={job.id}
                  variants={staggerItem('up')}
                  className="group bg-card border-border shadow-premium relative flex flex-col rounded-2xl border p-6 transition-all duration-300"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
                        {job.title}
                      </h3>
                      {job.companies?.[0]?.name && (
                        <p className="text-muted-foreground text-sm">
                          {job.companies[0].name}
                        </p>
                      )}
                    </div>
                    {job.employment_type && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          job.employment_type === 'clt'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {CONTRATO_LABELS[job.employment_type] ||
                          job.employment_type.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
                    {location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          {location}
                        </span>
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          {job.salary}
                        </span>
                      </div>
                    )}
                    {remote && (
                      <span className="text-muted-foreground inline-block text-xs">
                        Remoto
                      </span>
                    )}
                  </div>

                  {job.benefits && (
                    <div className="mb-4">
                      <p className="text-muted-foreground mb-2 text-xs font-medium">
                        Benefícios
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.benefits
                          .split(';')
                          .map((benefit) => benefit.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((beneficio) => (
                            <span
                              key={beneficio}
                              className="bg-muted rounded-full px-2 py-0.5 text-xs"
                            >
                              {beneficio}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <Link to={`/vagas/${job.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Ver vaga
                      </Button>
                    </Link>
                    <Link to={`/vagas/${job.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Candidatar-se
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
