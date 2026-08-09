import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { SEO } from '@/components/ui/SEO';

export default function Privacidade() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Política de Privacidade — J&S Terceirizados"
        description="Política de privacidade e tratamento de dados pessoais da J&S Terceirizados."
        keywords={[
          'política de privacidade',
          'LGPD',
          'dados pessoais',
          'J&S Terceirizados',
        ]}
        type="WebSite"
      />
      <Section className="pt-24 md:pt-32">
        <Container>
          <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed">
            Conteúdo pendente de validação jurídica. Esta página foi criada para
            estruturar a rota e o acesso público, mas ainda não contém política
            final aprovada.
          </p>
        </Container>
      </Section>
    </div>
  );
}
