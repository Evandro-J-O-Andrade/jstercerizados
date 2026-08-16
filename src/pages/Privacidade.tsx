import { motion } from 'framer-motion';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

export default function Privacidade() {
  return (
    <div className="min-h-screen">
      <SEO
        title={`Política de Privacidade — ${COMPANY.name}`}
        description={`Política de privacidade e tratamento de dados pessoais da ${COMPANY.name}.`}
        keywords={[
          'política de privacidade',
          'LGPD',
          'dados pessoais',
          COMPANY.name,
        ]}
        type="WebSite"
      />
      <Section className="pt-24 md:pt-32">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground mt-4 text-sm">
              Última atualização:{' '}
              {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </p>

            <div className="text-muted-foreground mt-10 space-y-8 text-sm leading-relaxed">
              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  1. Controlador de dados
                </h2>
                <p className="mt-3">
                  A {COMPANY.name} é a controladora dos dados pessoais tratados
                  por meio deste site e das plataformas associadas, nos termos
                  da Lei nº 13.709/2018 (LGPD).
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  2. Dados coletados
                </h2>
                <p className="mt-3">
                  Podemos coletar dados fornecidos diretamente por você nos
                  formulários do site, incluindo:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>
                    dados de identificação: nome, e-mail, telefone, CPF, cidade
                    e estado;
                  </li>
                  <li>
                    dados de candidatura: currículo, experiências, cursos, área
                    de interesse e disponibilidade;
                  </li>
                  <li>
                    dados de documentos: arquivos enviados para análise de
                    perfil ou processo seletivo;
                  </li>
                  <li>
                    dados de contato: assunto, mensagem e informações da empresa
                    quando aplicável;
                  </li>
                  <li>
                    dados de navegação: endereço IP, tipo de dispositivo, página
                    acessada e registros de acesso.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  3. Finalidades do tratamento
                </h2>
                <p className="mt-3">Os dados são utilizados para:</p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>atender solicitações de contato, orçamento e suporte;</li>
                  <li>
                    receber, armazenar e analisar currículos e candidaturas;
                  </li>
                  <li>
                    enviar comunicações relacionadas a vagas, processos
                    seletivos e serviços contratados;
                  </li>
                  <li>cumprir obrigações legais e regulatórias;</li>
                  <li>
                    melhorar a experiência de uso do site e das plataformas.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  4. Armazenamento e segurança
                </h2>
                <p className="mt-3">
                  Os dados são armazenados em ambiente seguro, com medidas
                  administrativas, técnicas e físicas adequadas para proteger
                  informações pessoais contra acessos não autorizados,
                  alterações, divulgações ou destruições indevidas.
                </p>
                <p className="mt-3">
                  Parte dos dados pode ser processada por serviços terceiros,
                  como provedores de hospedagem, armazenamento e automação,
                  sempre com contratos que preservem a confidencialidade e a
                  finalidade legítima do tratamento.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  5. Compartilhamento de dados
                </h2>
                <p className="mt-3">
                  A {COMPANY.name} não comercializa dados pessoais. O
                  compartilhamento ocorre apenas quando necessário para execução
                  de serviços contratados, cumprimento de obrigações legais ou
                  com o seu consentimento explícito.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  6. Cookies e tecnologias semelhantes
                </h2>
                <p className="mt-3">
                  Utilizamos cookies e funcionalidades semelhantes para melhorar
                  a navegação, lembrar preferências e compreender como o site é
                  utilizado. Você pode gerenciar o consentimento e as
                  preferências de armazenamento por meio das configurações do
                  navegador ou do painel de acessibilidade do site.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  7. Direitos do titular
                </h2>
                <p className="mt-3">
                  Você pode exercer seus direitos previstos na LGPD a qualquer
                  momento, incluindo:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>confirmação da existência de tratamento de dados;</li>
                  <li>acesso aos dados armazenados;</li>
                  <li>
                    correção de dados incompletos, inexatos ou desatualizados;
                  </li>
                  <li>solicitação de exclusão ou anonimização;</li>
                  <li>revogação do consentimento, quando aplicável.</li>
                </ul>
                <p className="mt-3">
                  Para exercer esses direitos, utilize os canais de contato
                  informados abaixo.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  8. Retenção de dados
                </h2>
                <p className="mt-3">
                  Os dados são mantidos pelo tempo necessário para cumprir as
                  finalidades que motivaram sua coleta, respeitadas as
                  obrigações legais, prescricionais e as políticas internas da
                  {COMPANY.name}.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  9. Canal de contato
                </h2>
                <p className="mt-3">
                  Em caso de dúvidas sobre esta política ou sobre o tratamento
                  de dados pessoais, entre em contato por meio da página de
                  contato do site ou pelo canal oficial da {COMPANY.name}.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  10. Alterações nesta política
                </h2>
                <p className="mt-3">
                  Esta política pode ser atualizada para refletir mudanças
                  legais, operacionais ou tecnológicas. A versão vigente será
                  sempre apresentada nesta página, com a respectiva data de
                  atualização.
                </p>
              </section>
            </div>

            <div className="border-border mt-12 border-t pt-6">
              <p className="text-muted-foreground text-xs">
                Este documento constitui conteúdo técnico preparado para
                publicação e está sujeito à validação jurídica do contratante.
                Após aprovação legal, a versão final deverá ser utilizada como
                política oficial.
              </p>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
