import { Section } from '@/components/sections/Section';
import { Container } from '@/components/common/Container';
import { SEO } from '@/components/ui/SEO';

export default function Termos() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Termos de Uso — J&S Terceirizados"
        description="Termos de uso do site e serviços da J&S Terceirizados."
        keywords={['termos de uso', 'termos', 'J&S Terceirizados', 'serviços']}
        type="WebSite"
      />
      <Section className="pt-24 md:pt-32">
        <Container>
          <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed">
            Conteúdo pendente de validação jurídica. Esta página foi criada para
            estruturar a rota e o acesso público, mas ainda não contém termos
            finais aprovados.
          </p>
        </Container>
      </Section>
    </div>
  );
}
