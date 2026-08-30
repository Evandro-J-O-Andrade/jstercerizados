import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, Filter } from 'lucide-react';
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
  const [cidadeFilter, setCidadeFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');
  const [salarioMin, setSalarioMin] = useState('');
  const [dataDias, setDataDias] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'jobs',
      'public',
      searchTerm,
      cidadeFilter,
      estadoFilter,
      areaFilter,
      tipoFilter,
      modalidadeFilter,
      salarioMin,
      dataDias,
    ],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return [];
      let query = supabase
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
          work_mode,
          salary_min,
          salary_max,
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

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
        );
      }
      if (cidadeFilter) {
        query = query.ilike('city', `%${cidadeFilter}%`);
      }
      if (estadoFilter) {
        query = query.ilike('state', `%${estadoFilter}%`);
      }
      if (areaFilter) {
        query = query.ilike('metadata->>area', `%${areaFilter}%`);
      }
      if (tipoFilter) {
        query = query.eq('employment_type', tipoFilter);
      }
      if (modalidadeFilter) {
        query = query.ilike('work_mode', `%${modalidadeFilter}%`);
      }
      if (salarioMin) {
        query = query.gte('salary_min', Number(salarioMin));
      }
      if (dataDias) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(dataDias));
        query = query.gte('published_at', daysAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Vagas] query error', error);
        return [];
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
        work_mode: string | null;
        salary_min: number | null;
        salary_max: number | null;
        companies: Array<{
          id: string;
          name: string;
          legal_name: string | null;
          status: string;
        }> | null;
      }>;
    },
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCidadeFilter('');
    setEstadoFilter('');
    setAreaFilter('');
    setTipoFilter('');
    setModalidadeFilter('');
    setSalarioMin('');
    setDataDias('');
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

          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-6"
          >
            <div className="relative md:col-span-2">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Busque por cargo, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-colors outline-none focus:ring-2"
              />
            </div>
            <div className="relative">
              <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cidade"
                value={cidadeFilter}
                onChange={(e) => setCidadeFilter(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-colors outline-none focus:ring-2"
              />
            </div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
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
              className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
            >
              <option value="">Todas as modalidades</option>
              <option value="onsite">Presencial</option>
              <option value="hybrid">Híbrido</option>
              <option value="remote">Trabalho de Casa</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showMoreFilters ? 'Menos filtros' : 'Mais filtros'}
            </Button>
          </motion.div>

          {/* Additional Filters */}
          {showMoreFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4"
            >
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
              >
                <option value="">Todos os estados</option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
              </select>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
              >
                <option value="">Todas as áreas</option>
                <option value="producao">Produção</option>
                <option value="logistica">Logística</option>
                <option value="administrativo">Administrativo</option>
                <option value="seguranca">Segurança</option>
                <option value="limpeza">Limpeza</option>
              </select>
              <select
                value={salarioMin}
                onChange={(e) => setSalarioMin(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
              >
                <option value="">Salário mínimo</option>
                <option value="1500">R$ 1.500+</option>
                <option value="2000">R$ 2.000+</option>
                <option value="3000">R$ 3.000+</option>
                <option value="5000">R$ 5.000+</option>
              </select>
              <select
                value={dataDias}
                onChange={(e) => setDataDias(e.target.value)}
                className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
              >
                <option value="">Todas as datas</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center justify-between"
          >
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">
                {isLoading ? '...' : jobs.length}
              </span>{' '}
              vaga{isLoading ? 's' : jobs.length !== 1 ? 's' : ''} encontrada
              {isLoading ? 's' : jobs.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3">
              <Link to="/trabalhe-conosco">
                <Button variant="secondary" size="sm">
                  Cadastrar Currículo
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={
                  !searchTerm &&
                  !cidadeFilter &&
                  !estadoFilter &&
                  !areaFilter &&
                  !tipoFilter &&
                  !modalidadeFilter &&
                  !salarioMin &&
                  !dataDias
                }
              >
                Limpar filtros
              </Button>
            </div>
          </motion.div>

          {/* Vagas Grid */}
          {isLoading ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem('up')}
                  className="bg-muted/50 border-border/50 rounded-2xl border p-6"
                >
                  <div className="bg-muted mx-auto h-40 w-full animate-pulse rounded-xl" />
                  <div className="bg-muted mx-auto mt-4 h-4 w-24 animate-pulse rounded" />
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <div className="text-muted-foreground text-center">
              Não foi possível carregar as vagas agora.
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card shadow-premium rounded-2xl p-12 text-center"
            >
              <p className="text-muted-foreground">
                Nenhuma vaga encontrada com os filtros aplicados.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerReveal(0.1)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {jobs.map((job) => {
                const beneficiosList = job.benefits
                  ? job.benefits
                      .split(';')
                      .map((item: string) => item.trim())
                      .filter(Boolean)
                  : [];

                const employmentTypeLabel =
                  job.employment_type &&
                  CONTRATO_LABELS[job.employment_type.toLowerCase()];

                const location = job.location || '';
                const locationParts = location
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const cidade = locationParts[0] || '';
                const estado = locationParts[1] || '';

                return (
                  <motion.div
                    key={job.id}
                    variants={staggerItem('up')}
                    whileHover={{ y: -4 }}
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
                      {employmentTypeLabel && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            employmentTypeLabel === 'CLT'
                              ? 'bg-success/10 text-success'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {employmentTypeLabel}
                        </span>
                      )}
                    </div>

                    <div className="mb-4 space-y-2">
                      {cidade && estado && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground">
                            {cidade}, {estado}
                          </span>
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">R$</span>
                          <span className="text-muted-foreground">
                            {job.salary}
                          </span>
                        </div>
                      )}
                      {job.work_mode && (
                        <span className="text-muted-foreground inline-block text-xs">
                          {job.work_mode === 'onsite'
                            ? 'Presencial'
                            : job.work_mode === 'hybrid'
                              ? 'Híbrido'
                              : job.work_mode === 'remote'
                                ? 'Remoto'
                                : job.work_mode}
                        </span>
                      )}
                    </div>

                    {beneficiosList.length > 0 && (
                      <div className="mb-4">
                        <p className="text-muted-foreground mb-2 text-xs font-medium">
                          Benefícios
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {beneficiosList.slice(0, 3).map((beneficio) => (
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
            </motion.div>
          )}

          {jobs.length > 0 && jobs.length < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground text-sm">
                Mostrando {jobs.length} vaga
                {jobs.length !== 1 ? 's' : ''} de {jobs.length} disponível
                {jobs.length !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </Container>
      </Section>
    </div>
  );
}
