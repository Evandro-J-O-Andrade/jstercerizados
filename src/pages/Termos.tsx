import { motion } from 'framer-motion';
import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

export default function Termos() {
  return (
    <div className="min-h-screen">
      <SEO
        title={`Termos de Uso — ${COMPANY.name}`}
        description={`Termos de uso do site e serviços da ${COMPANY.name}.`}
        keywords={['termos de uso', 'termos', COMPANY.name, 'serviços']}
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
              Termos de Uso
            </h1>
            <p className="text-muted-foreground mt-4 text-sm">
              Última atualização:{' '}
              {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </p>

            <div className="text-muted-foreground mt-10 space-y-8 text-sm leading-relaxed">
              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  1. Aceitação dos termos
                </h2>
                <p className="mt-3">
                  Ao acessar e utilizar este site, você concorda com estes
                  Termos de Uso e com a Política de Privacidade. Se não
                  concordar com qualquer condição, recomendamos que não utilize
                  o site nem os serviços oferecidos.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  2. Descrição dos serviços
                </h2>
                <p className="mt-3">
                  A {COMPANY.name} atua como consultoria em Recursos Humanos,
                  oferecendo serviços de recrutamento e seleção, mão de obra
                  temporária e efetiva, banco de talentos, avaliação de perfil e
                  soluções operacionais complementares.
                </p>
                <p className="mt-3">
                  O site funciona como canal de apresentação institucional,
                  captação de currículos, divulgação de vagas e contato com
                  candidatos, empresas e parceiros. A intermediação de
                  candidaturas e a eventual contratação estão sujeitas a
                  processos seletivos e condições específicas de cada serviço.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  3. Cadastro e responsabilidades do usuário
                </h2>
                <p className="mt-3">
                  Algumas funcionalidades podem exigir cadastro. Nesses casos,
                  você se compromete a fornecer informações verdadeiras,
                  atualizadas e completas, bem como a mantê-las atualizadas
                  enquanto utilizar os serviços.
                </p>
                <p className="mt-3">
                  Você é responsável pela confidencialidade de suas credenciais
                  e por todas as atividades realizadas por meio da sua conta ou
                  sessão.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  4. Uso do site e conduta
                </h2>
                <p className="mt-3">
                  Você concorda em utilizar o site de forma lícita e de acordo
                  com estas regras. É vedado:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>
                    fornecer informações falsas, enganosas ou incompletas em
                    formulários ou cadastros;
                  </li>
                  <li>
                    utilizar o site para atividades fraudulentas, ilegais ou que
                    violem direitos de terceiros;
                  </li>
                  <li>
                    tentar acessar áreas restritas, sistemas ou dados sem
                    autorização;
                  </li>
                  <li>
                    interferir no funcionamento normal do site por meio de
                    vírus, robôs ou outras práticas abusivas.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  5. Propriedade intelectual
                </h2>
                <p className="mt-3">
                  O conteúdo do site, incluindo textos, imagens, logotipos,
                  layouts e códigos, pertence à {COMPANY.name} ou a seus
                  licenciadores e é protegido por leis de propriedade
                  intelectual. É proibida a reprodução, distribuição ou uso
                  comercial sem autorização prévia.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  6. Privacidade e proteção de dados
                </h2>
                <p className="mt-3">
                  O tratamento de dados pessoais é regido pela Política de
                  Privacidade e pela legislação aplicável. Ao utilizar o site,
                  você concorda com as práticas descritas naquele documento.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  7. Limitação de responsabilidade
                </h2>
                <p className="mt-3">
                  A {COMPANY.name} envidará esforços razoáveis para manter o
                  site disponível e livre de erros, mas não garante
                  funcionamento ininterrupto ou isento de falhas. Também não se
                  responsabiliza por indisponibilidades causadas por fatores
                  externos.
                </p>
                <p className="mt-3">
                  O site pode conter links para páginas ou serviços de
                  terceiros. Esses links não implicam endosso ou
                  responsabilidade pelo conteúdo de sites externos.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  8. Modificações dos termos
                </h2>
                <p className="mt-3">
                  Podemos atualizar estes Termos de Uso para refletir mudanças
                  legais, operacionais ou tecnológicas. A versão vigente estará
                  sempre disponível nesta página, com data de atualização.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-xl font-semibold">
                  9. Legislação aplicável
                </h2>
                <p className="mt-3">
                  Estes Termos de Uso são regidos pelas leis brasileiras. Em
                  caso de controvérsia, as partes elegem o foro da comarca de
                  Poá/SP, com renúncia a qualquer outro.
                </p>
              </section>
            </div>

            <div className="border-border mt-12 border-t pt-6">
              <p className="text-muted-foreground text-xs">
                Este documento constitui conteúdo técnico preparado para
                publicação e está sujeito à validação jurídica do contratante.
                Após aprovação legal, a versão final deverá ser utilizada como
                termos oficiais.
              </p>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
