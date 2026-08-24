import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/sections/Section';
import { SEO } from '@/components/ui/SEO';
import { Container } from '@/components/common/Container';
import { staggerReveal, revealUp } from '@/animations/scroll';
import { staggerItem } from '@/animations/fade';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY } from '@/config';
import type { JobStatus } from '@/types/domain/job';

const CONTRATO_LABELS: Record<string, string> = {
  CLT: 'CLT',
  ESTAGIO: 'Estágio',
  TEMPORARIO: 'Temporário',
  FREELA: 'Freela',
  TERCEIRIZADO: 'Terceirizado',
  CD: 'C/D',
};

export default function Vagas() {
  const { currentTenantId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [cidadeFilter, setCidadeFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const searchFilter = useMemo(() => {
    const filters: { search?: string; status?: JobStatus } = {};
    if (searchTerm) filters.search = searchTerm;
    filters.status = 'published';
    return filters;
  }, [searchTerm]);

  const {
    jobs: vagas,
    isLoading,
    error,
  } = useJobs(currentTenantId, searchFilter);

  const filteredVagas = useMemo(() => {
    return vagas.filter((vaga) => {
      const locationLower = (vaga.location || '').toLowerCase();
      if (cidadeFilter && !locationLower.includes(cidadeFilter.toLowerCase())) {
        return false;
      }
      if (estadoFilter && !locationLower.includes(estadoFilter.toLowerCase())) {
        return false;
      }
      if (tipoFilter && vaga.employment_type !== tipoFilter) {
        return false;
      }
      return true;
    });
  }, [vagas, cidadeFilter, estadoFilter, tipoFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setCidadeFilter('');
    setEstadoFilter('');
    setTipoFilter('');
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

          {error && (
            <div className="border-destructive/50 bg-destructive/5 mb-6 rounded-xl border p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading && vagas.length === 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card border-border rounded-2xl border p-6"
                >
                  <div className="bg-muted mb-4 h-6 w-3/4 animate-pulse rounded" />
                  <div className="bg-muted mb-2 h-4 w-1/2 animate-pulse rounded" />
                  <div className="bg-muted mb-4 h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted h-10 w-full animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5"
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
                    placeholder="Cidade ou estado"
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
                  <option value="CLT">CLT</option>
                  <option value="ESTAGIO">Estágio</option>
                  <option value="TEMPORARIO">Temporário</option>
                  <option value="TERCEIRIZADO">Terceirizado</option>
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

              {showMoreFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4"
                >
                  <div className="relative">
                    <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrar por estado (ex: SP)"
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-10 text-sm transition-colors outline-none focus:ring-2"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Salário mínimo (R$)"
                    value=""
                    disabled
                    className="border-input bg-muted text-muted-foreground w-full cursor-not-allowed rounded-xl border px-4 py-3 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Dias desde publicação"
                    value=""
                    disabled
                    className="border-input bg-muted text-muted-foreground w-full cursor-not-allowed rounded-xl border px-4 py-3 text-sm"
                  />
                  <div className="text-muted-foreground text-xs">
                    Filtros avançados em breve.
                  </div>
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
                    {filteredVagas.length}
                  </span>{' '}
                  vaga{filteredVagas.length !== 1 ? 's' : ''} encontrada
                  {filteredVagas.length !== 1 ? 's' : ''}
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
                      !tipoFilter
                    }
                  >
                    Limpar filtros
                  </Button>
                </div>
              </motion.div>

              {isLoading && vagas.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-card border-border rounded-2xl border p-6"
                    >
                      <div className="bg-muted mb-4 h-6 w-3/4 animate-pulse rounded" />
                      <div className="bg-muted mb-2 h-4 w-1/2 animate-pulse rounded" />
                      <div className="bg-muted mb-4 h-4 w-full animate-pulse rounded" />
                      <div className="bg-muted h-10 w-full animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerReveal(0.1)}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredVagas.length === 0 ? (
                    <motion.div
                      variants={staggerItem('up')}
                      className="bg-card shadow-premium col-span-full rounded-2xl p-12 text-center"
                    >
                      <p className="text-muted-foreground">
                        Nenhuma vaga encontrada com os filtros aplicados.
                      </p>
                    </motion.div>
                  ) : (
                    filteredVagas.map((vaga) => (
                      <motion.div
                        key={vaga.id}
                        variants={staggerItem('up')}
                        whileHover={{ y: -4 }}
                        className="bg-card border-border shadow-premium group relative flex flex-col rounded-2xl border p-6 transition-all duration-300"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
                              {vaga.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {vaga.location || 'Localização não informada'}
                            </p>
                          </div>
                          {vaga.employment_type && (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                vaga.employment_type === 'CLT'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {CONTRATO_LABELS[vaga.employment_type] ||
                                vaga.employment_type}
                            </span>
                          )}
                        </div>

                        <div className="mb-4 space-y-2">
                          {vaga.salary && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">
                                {vaga.salary}
                              </span>
                            </div>
                          )}
                          {vaga.published_at && (
                            <span className="text-muted-foreground/70 inline-block text-xs">
                              Publicada em{' '}
                              {new Date(vaga.published_at).toLocaleDateString(
                                'pt-BR',
                              )}
                            </span>
                          )}
                        </div>

                        {vaga.benefits && (
                          <div className="mb-4">
                            <p className="text-muted-foreground mb-2 text-xs font-medium">
                              Benefícios
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {vaga.benefits
                                .split(',')
                                .slice(0, 3)
                                .map((beneficio) => (
                                  <span
                                    key={beneficio}
                                    className="bg-muted rounded-full px-2 py-0.5 text-xs"
                                  >
                                    {beneficio.trim()}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex gap-2">
                          <Link to={`/vagas/${vaga.id}`} className="flex-1">
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                            >
                              Ver vaga
                            </Button>
                          </Link>
                          <Link to={`/vagas/${vaga.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Candidatar-se
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {!isLoading && filteredVagas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-12 text-center"
                >
                  <p className="text-muted-foreground text-sm">
                    Mostrando {filteredVagas.length} vaga
                    {filteredVagas.length !== 1 ? 's' : ''} de{' '}
                    {filteredVagas.length} disponível
                    {filteredVagas.length !== 1 ? 's' : ''}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
