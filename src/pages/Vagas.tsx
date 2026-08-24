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
import { mockGetVagas } from '@/services/mock/vagas';
import { COMPANY } from '@/config';

const CONTRATO_LABELS: Record<string, string> = {
  CLT: 'CLT',
  ESTAGIO: 'Estágio',
  TEMPORARIO: 'Temporário',
  FREELA: 'Freela',
  TERCEIRIZADO: 'Terceirizado',
  CD: 'C/D',
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

  const vagas = useMemo(() => {
    return mockGetVagas({
      search: searchTerm || undefined,
      cidade: cidadeFilter || undefined,
      estado: estadoFilter || undefined,
      tipoContrato: tipoFilter || undefined,
      modalidade: modalidadeFilter || undefined,
      salarioMin: salarioMin ? Number(salarioMin) : undefined,
      dataDias: dataDias ? Number(dataDias) : undefined,
    });
  }, [
    searchTerm,
    cidadeFilter,
    estadoFilter,
    tipoFilter,
    modalidadeFilter,
    salarioMin,
    dataDias,
  ]);

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
              <option value="CLT">CLT</option>
              <option value="ESTAGIO">Estágio</option>
              <option value="TEMPORARIO">Temporário</option>
              <option value="TERCEIRIZADO">Terceirizado</option>
            </select>
            <select
              value={modalidadeFilter}
              onChange={(e) => setModalidadeFilter(e.target.value)}
              className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
            >
              <option value="">Todas as modalidades</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="HIBRIDO">Híbrido</option>
              <option value="REMOTO">Trabalho de Casa</option>
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
              exit={{ opacity: 0, height: 0 }}
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
                {vagas.length}
              </span>{' '}
              vaga{vagas.length !== 1 ? 's' : ''} encontrada
              {vagas.length !== 1 ? 's' : ''}
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerReveal(0.1)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {vagas.length === 0 ? (
              <motion.div
                variants={staggerItem('up')}
                className="bg-card shadow-premium col-span-full rounded-2xl p-12 text-center"
              >
                <p className="text-muted-foreground">
                  Nenhuma vaga encontrada com os filtros aplicados.
                </p>
              </motion.div>
            ) : (
              vagas.map((vaga) => (
                <motion.div
                  key={vaga.id}
                  variants={staggerItem('up')}
                  whileHover={{ y: -4 }}
                  className="bg-card border-border shadow-premium group relative flex flex-col rounded-2xl border p-6 transition-all duration-300"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
                        {vaga.titulo}
                      </h3>
                      {vaga.empresa && (
                        <p className="text-muted-foreground text-sm">
                          {vaga.empresa}
                        </p>
                      )}
                    </div>
                    {vaga.tipoContrato && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          vaga.tipoContrato === 'CLT'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {CONTRATO_LABELS[vaga.tipoContrato] ||
                          vaga.tipoContrato}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
                    {vaga.cidade && vaga.estado && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          {vaga.cidade}, {vaga.estado}
                        </span>
                      </div>
                    )}
                    {vaga.salarioMin && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">R$</span>
                        <span className="text-muted-foreground">
                          {vaga.salarioMin.toLocaleString('pt-BR')}
                          {' – '}
                          {vaga.salarioMax
                            ? vaga.salarioMax.toLocaleString('pt-BR')
                            : 'a combinar'}
                        </span>
                      </div>
                    )}
                    {vaga.modalidade && (
                      <span className="text-muted-foreground inline-block text-xs">
                        {vaga.modalidade === 'PRESENCIAL'
                          ? 'Presencial'
                          : vaga.modalidade === 'HIBRIDO'
                            ? 'Híbrido'
                            : 'Remoto'}
                      </span>
                    )}
                    {vaga.area && (
                      <span className="text-muted-foreground/70 inline-block text-xs">
                        {vaga.area}
                      </span>
                    )}
                  </div>

                  {vaga.beneficios && vaga.beneficios.length > 0 && (
                    <div className="mb-4">
                      <p className="text-muted-foreground mb-2 text-xs font-medium">
                        Benefícios
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {vaga.beneficios.slice(0, 3).map((beneficio) => (
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
                    <Link to={`/vagas/${vaga.slug}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Ver vaga
                      </Button>
                    </Link>
                    <Link to={`/vagas/${vaga.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Candidatar-se
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {vagas.length > 0 && vagas.length < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground text-sm">
                Mostrando {vagas.length} vaga
                {vagas.length !== 1 ? 's' : ''} de {vagas.length} disponível
                {vagas.length !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </Container>
      </Section>
    </div>
  );
}
