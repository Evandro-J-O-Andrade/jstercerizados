> **Status do documento:** requisitos e critérios de aceitação. A presença deste arquivo não comprova que as funcionalidades foram implementadas ou testadas. Consulte os commits, testes e relatório de validação para confirmar cada item.

# REMOÇÃO ALPHA — IMPLEMENTAÇÃO COMPLETA DE GESTÃO DE ACESSOS, SEED, RELATÓRIOS E ANALÍTICA

## ORDEM DE EXECUÇÃO

Kilo, implemente esta entrega no repositório existente do **Gestão de Remoção Alpha**, desenvolvido pela New Wave Sistema Digital.

**Não quero apenas análise, diagnóstico, documentação ou plano de execução. Quero as funcionalidades implementadas, integradas, testadas e prontas para validação.** Execute o trabalho de ponta a ponta, sem interromper a entrega após identificar as lacunas.

Trabalhe no código e na branch corretos, preserve as alterações existentes e não crie estruturas duplicadas sem necessidade. Faça as etapas internamente na ordem técnica adequada, mas conclua todo o escopo abaixo nesta entrega.

Não misture este projeto com Angel Cosméticos ou JS Empregos.

## 1. GESTÃO COMPLETA DE USUÁRIOS E ACESSOS

Evolua a `AdminManagementPage` e os serviços relacionados para disponibilizar um fluxo administrativo funcional.

Implementar:

- Listagem de usuários com pesquisa, filtros, paginação real e ordenação.
- Cadastro ou convite de novos usuários.
- Associação correta entre a identidade autenticada e o registro correspondente em `people`.
- Vínculo do usuário ao tenant e às unidades autorizadas.
- Atribuição e alteração de papéis.
- Concessão e revogação de permissões específicas.
- Ativação, suspensão e reativação de acesso.
- Consulta do estado do convite, vínculo e configuração de acesso.
- Visualização dos papéis, unidades e permissões efetivamente atribuídos.
- Histórico auditável de alterações de acesso.
- Estados completos de carregamento, sucesso, erro, vazio e confirmação de ações destrutivas.

Reutilize as tabelas, funções, serviços, permissões e políticas já existentes. Complete as lacunas comprovadas sem criar um segundo sistema de autorização.

### Regras obrigatórias

- Evandro Andrade permanece como único ROOT global, conforme o estado mais recente informado.
- ROOT administra a plataforma e os tenants de acordo com as regras globais.
- `admin_gestao` administra usuários da própria instituição e das unidades autorizadas.
- Administradores da instituição só podem atribuir papéis e permissões que estejam autorizados a delegar.
- Nenhum administrador de tenant pode conceder ROOT global, ampliar o próprio escopo indevidamente ou administrar outro tenant sem autorização.
- Gestores operacionais podem administrar a operação somente quando possuem as permissões correspondentes.
- Profissão e papel de sistema são conceitos diferentes.
- Nenhum usuário deve precisar ser ROOT para conseguir entrar e executar suas atividades autorizadas.

Não considere o acesso concluído apenas porque o usuário aparece na tela. O vínculo de autenticação, o membership, o papel, as permissões, o escopo e as políticas do banco precisam estar coerentes.

Implemente as operações seguras usando os mecanismos existentes ou RPCs transacionais com validação de autorização no servidor, conforme a arquitetura real do projeto. Nunca exponha `service_role` no frontend.

## 2. SEED COMPLETO PARA TESTAR O SISTEMA

**O seed é obrigatório nesta entrega. Não deixe essa parte para depois.**

Primeiro, identifique os seeds, migrations, tabelas, enums, constraints e relacionamentos existentes. Em seguida, complete o seed de desenvolvimento/testes de forma idempotente, sem duplicar registros nem substituir dados reais.

O ambiente precisa permitir testar, separadamente, todos estes perfis:

1. **ROOT global:** Evandro Andrade, respeitando a conta existente e sem criar outro ROOT.
2. **Administrador da instituição:** `admin_gestao`.
3. **Gestor ou coordenador operacional:** com autorização de gestão de equipe e agenda no escopo definido.
4. **Suporte Master:** com os privilégios de suporte previstos no RBAC, sem presumir que é ROOT.
5. **Suporte de TI:** com acesso às funções de suporte autorizadas.
6. **Motorista:** com acesso às remoções atribuídas e às funções de transporte.
7. **Enfermagem:** com acesso às atribuições e informações assistenciais permitidas.
8. **Médico:** com acesso à escala e às remoções atribuídas, conforme suas permissões.
9. **Solicitante:** com acesso à criação e ao acompanhamento das solicitações autorizadas.

Se os nomes oficiais dos papéis no banco forem diferentes, utilize os existentes e documente o mapeamento. Não crie aliases de papéis sem necessidade.

### Dados necessários para os testes

- Tenant Instituto Alpha de Medicina para Saúde.
- Unidades de Santos-SP e Poá-SP, preservando os registros reais já existentes.
- Pessoas de teste distintas, com vínculos e memberships coerentes.
- Associações de unidade adequadas a cada perfil.
- Permissões compatíveis com as atividades de cada usuário.
- Dados operacionais mínimos para validar as telas e os relatórios sem depender de cadastros manuais intermináveis.
- Remoções de teste com diferentes status, unidades, destinos, tipos de transporte, datas e atribuições de equipe.
- Dados suficientes para testar filtros, paginação, contagens, relatórios e indicadores.
- Cenários positivos e negativos de autorização.

Não invente ou substitua IDs reais. Use identificadores estáveis quando apropriado e respeite todas as foreign keys.

### Segurança do seed

Crie uma separação explícita entre seed de desenvolvimento/teste e dados de produção.

- Não apague nem recrie o tenant real.
- Não revogue ou conceda privilégios globais por meio do seed comum.
- Não inclua senhas de produção ou credenciais privilegiadas no repositório.
- Não crie usuários de teste em produção automaticamente.
- Para contas de autenticação, utilize o fluxo seguro existente ou um script administrativo de desenvolvimento, com credenciais fornecidas localmente e sem exposição no frontend.
- Se houver limitações no Supabase para provisionar contas, implemente o mecanismo seguro disponível e documente a execução necessária, sem fingir que contas foram criadas.
- Torne o seed repetível e seguro: executá-lo duas vezes não pode duplicar pessoas, memberships, permissões ou remoções.

Entregue os comandos exatos para preparar o ambiente e iniciar cada perfil de teste.

## 3. SIDEBAR E CONTROLE DE ACESSO POR PERFIL

Redesenhe a navegação administrativa com sidebar compacta, hierarquia visual profissional e opções coerentes com o perfil autenticado.

O menu deve ser montado a partir das permissões reais, sem conceder acesso simplesmente por exibir um item.

### Navegação esperada

- Central de Remoções.
- Nova Remoção.
- Agenda e escalas.
- Gestão de equipe, quando autorizada.
- Pacientes e documentos, conforme as permissões.
- Minha Conta.
- Relatórios.
- Gestão de Usuários e Acessos, para quem estiver autorizado.
- Gestão da instituição e das unidades, conforme o escopo.
- Administração global, exclusivamente conforme os privilégios ROOT.
- Suporte e ferramentas técnicas, conforme o perfil.
- Dashboard analítico de gestão, conforme a permissão específica.

Os nomes e as rotas devem respeitar o que já existe no projeto. Não crie links quebrados, páginas vazias que pareçam prontas ou ações que não funcionam.

Corrija também o `AuthProvider` para obter o nome de exibição a partir da fonte de identidade correta, incluindo `people`, de acordo com o modelo real. Não utilize o e-mail como substituto permanente do nome.

Redesenhe o `AuthLayout` com sidebar mais estreita, conteúdo alinhado corretamente, área principal bem aproveitada, cabeçalho consistente e componentes visuais profissionais.

## 4. PÁGINA CENTRAL DE RELATÓRIOS

Implemente uma página real de relatórios e adicione o acesso correspondente à sidebar para os perfis autorizados.

**Relatórios devem ser uma central de navegação e execução, não apenas uma tabela genérica ou um link para uma tela vazia.**

Crie uma página de entrada com cards para os tipos de relatório disponíveis. Cada card deve informar o nome, a finalidade, o escopo de dados e a ação de abrir o relatório.

Os relatórios devem utilizar dados reais do banco. Não invente indicadores nem apresente dados fictícios como se fossem reais.

### Catálogo inicial de relatórios

Implemente os relatórios compatíveis com o modelo atual e identifique claramente qualquer item que dependa de dados ou módulos ainda inexistentes.

**Operação de remoções**

- Remoções por período.
- Remoções por status.
- Remoções por unidade de origem e destino.
- Remoções por tipo de transporte.
- Remoções pendentes, canceladas, concluídas ou sem atribuição.
- Histórico e tempo entre etapas.
- Ocorrências, atrasos e motivos registrados.

**Pacientes e destinos**

- Pacientes atendidos por período, respeitando a autorização para dados identificáveis.
- Remoções por hospital ou unidade de destino.
- Quantidade de encaminhamentos por destino.
- Histórico de movimentação associado às remoções autorizadas.
- Relatórios de documentos e pendências documentais, quando houver dados disponíveis.

**Equipe e recursos**

- Remoções por motorista.
- Remoções por profissional ou equipe.
- Escalas e disponibilidade, quando os dados existirem.
- Conflitos de agenda.
- Remoções sem equipe ou veículo atribuído.
- Ocorrências relacionadas à execução do transporte.

**Gestão administrativa**

- Volume de remoções por unidade.
- Indicadores comparativos entre unidades autorizadas.
- Cancelamentos e motivos.
- Pendências operacionais.
- Tempos de atendimento e execução.
- Indicadores financeiros somente se houver dados de custo confiáveis e regras implementadas.

Não crie tabelas artificiais só para fazer esses relatórios parecerem completos. Utilize as estruturas reais, implementando apenas as que forem necessárias e justificadas.

Cada relatório precisa oferecer filtros relevantes, intervalo de datas, paginação quando aplicável, estados de carregamento/erro/vazio, totais coerentes e exportação somente quando houver autorização.

A consulta deve respeitar tenant, unidade, perfil e permissão. A exportação de dados pessoais precisa de autorização própria ou regra equivalente já definida no RBAC, além de auditoria quando apropriado.

## 5. DASHBOARD ANALÍTICO DE GESTÃO

Implemente a `DashboardAnaliticoPage`, atualmente placeholder, como uma central analítica real para gestão.

O dashboard deve ser acessível somente a perfis com permissão específica de consulta gerencial. Não conceda essa permissão automaticamente a todo usuário autenticado.

A página deve ter:

- Filtros por período e unidade autorizada.
- Cards de indicadores calculados a partir dos dados reais.
- Volume de remoções.
- Distribuição por status.
- Comparação por unidade.
- Remoções por tipo de transporte.
- Destinos hospitalares mais frequentes, quando os dados permitirem.
- Pendências e remoções sem atribuição.
- Cancelamentos e ocorrências.
- Indicadores temporais, como duração entre etapas, quando houver timestamps válidos.
- Atalhos para abrir o relatório detalhado correspondente a cada indicador.

Cada card deve funcionar como uma entrada para o relatório relacionado, levando filtros e contexto quando for seguro e compatível com a arquitetura atual.

Não misture dashboard analítico e central de relatórios: o dashboard oferece visão gerencial consolidada; a central de relatórios oferece consultas detalhadas, filtros e resultados específicos.

Não exponha dados clínicos identificáveis em cards gerenciais quando bastarem contagens agregadas. Não apresente valores fictícios, percentuais inventados ou gráficos sem fonte real.

Se um indicador depender de dados ainda não disponíveis, mostre uma mensagem honesta sobre a indisponibilidade e não simule o resultado.

## 6. AUTORIZAÇÃO DE RELATÓRIOS POR PERFIL

Implemente e valide a matriz de acesso aos relatórios.

- **ROOT:** visão global autorizada da plataforma, com filtros de tenant e unidade quando permitidos.
- **`admin_gestao`:** relatórios da própria instituição e das unidades autorizadas.
- **Gestor operacional:** agenda, filas, equipes, disponibilidade, atrasos e execução no escopo permitido.
- **Suporte Master e Suporte de TI:** acesso técnico conforme permissões explícitas, sem presumir acesso irrestrito a dados clínicos.
- **Motorista:** somente relatórios e histórico operacional necessários à própria atividade e às atribuições autorizadas.
- **Médico e enfermagem:** escala e dados assistenciais das remoções atribuídas ou explicitamente autorizadas.
- **Solicitante:** solicitações próprias ou do setor/unidade a que tenha acesso.

Esses são limites iniciais de negócio, não uma autorização para inventar novos privilégios globais. Mapeie-os para as permissões existentes e complete o RBAC quando necessário.

A validação deve ocorrer no backend e nas políticas do Supabase. Ocultar cards ou links não é controle de segurança suficiente.

## 7. SEGURANÇA E INTEGRIDADE DO BANCO

Audite e complete os relacionamentos e as políticas necessários para garantir:

- Isolamento entre tenants.
- Restrição por unidade.
- Separação entre identidade, profissão, vínculo funcional, papel e permissões.
- Impossibilidade de escalada de privilégios.
- Proteção contra alteração de IDs para consultar registros fora do escopo.
- Validação de permissões nas mutações e nos relatórios.
- Auditoria de alterações de papéis, permissões e vínculos.
- Consistência transacional das operações críticas.

Preserve as correções já realizadas de RLS, contexto de tenant, checklist e histórico de status. Não reintroduza UUIDs sentinela ou dependências de tenant hardcoded.

Antes de criar qualquer migration, compare o esquema real com o código e as migrations existentes. Crie somente migrations incrementais e necessárias.

**Não aplique alterações no banco remoto, não execute revogações ou concessões globais e não altere dados de produção sem autorização explícita específica.** Prepare e teste localmente as migrations necessárias, deixando claro o que precisa ser aplicado remotamente.

## 8. VALIDAÇÃO DOCUMENTAL E MULTIUPLOAD

Implemente também as melhorias de validação de documentos já identificadas, reutilizando as estruturas existentes, incluindo `remocao_documento_extracao` e `remocao_documento_conferencia`.

Garantir:

- Múltiplos arquivos independentes por solicitação.
- Identificador e caminho exclusivo para cada arquivo.
- Proibição de sobrescrita acidental.
- Exclusão somente por ação autorizada.
- Validação de extensão permitida, tamanho máximo e tipo real do arquivo antes do upload.
- SHA-256 do original e verificação de integridade do objeto recuperado.
- Verificação de abertura de PDFs e imagens.
- Extração de texto de PDFs e OCR quando necessário.
- Extração de campos com possibilidade de revisão humana.
- Estados de processamento e erros persistidos.
- Scanner antimalware integrado por mecanismo seguro disponível.
- Bloqueio de liberação enquanto verificações de segurança obrigatórias estiverem pendentes ou falharem.
- Bucket privado, URLs temporárias e autorização por tenant/unidade.
- Registro de auditoria.

Se o scanner, serviço de OCR ou outra dependência externa exigir configuração, implemente a integração e a gestão de estados. Não declare a validação como concluída se o serviço não estiver operacional. Falhas de scanner ou OCR não devem ser tratadas como aprovação.

O FAA deve preencher uma prévia editável da Nova Remoção. A extração não deve criar ou confirmar automaticamente uma remoção sem a validação exigida.

## 9. TESTES OBRIGATÓRIOS

Não encerre com testes apenas de renderização. Valide o fluxo real de autorização e uso.

Inclua testes para:

- ROOT acessando funções globais permitidas.
- `admin_gestao` cadastrando e gerenciando usuários dentro do escopo.
- Administrador tentando conceder ROOT e sendo bloqueado.
- Gestor operacional gerenciando equipe somente quando autorizado.
- Motorista acessando as próprias atribuições e sendo impedido de acessar relatórios clínicos indevidos.
- Profissionais assistenciais consultando apenas as remoções e os dados autorizados.
- Solicitante criando e acompanhando solicitações dentro do escopo.
- Usuário de Santos tentando acessar dados de Poá sem autorização.
- Usuário tentando consultar outra instituição alterando o ID enviado à API.
- Usuário suspenso ou sem vínculo ativo tentando acessar a aplicação.
- Paginação, filtros e contagens dos relatórios.
- Cards analíticos levando ao relatório correspondente.
- Seed executado repetidamente sem duplicação.
- Upload múltiplo sem sobrescrita de arquivos anteriores.
- Arquivo inválido, corrompido, ilegível ou com verificação de segurança pendente.
- Falhas de extração e OCR com recuperação e mensagens apropriadas.

Execute os testes existentes e os novos testes relevantes. Preserve os testes de `novaRemocaoFlow` e os testes administrativos existentes.

Valide TypeScript, lint, build e a suíte de testes disponível. Corrija as regressões introduzidas por esta entrega antes de concluí-la.

Não altere testes para simplesmente fazê-los passar e não conte como sucesso uma validação que não foi executada.

## 10. CRITÉRIOS DE ACEITAÇÃO

A entrega só poderá ser considerada concluída quando:

1. Os usuários de teste puderem entrar com seus perfis e permissões reais no ambiente de teste.
2. O administrador da instituição puder liberar acessos sem intervenção cotidiana do ROOT.
3. A autorização funcionar no backend e no banco, não apenas na interface.
4. O seed estiver disponível, documentado, repetível e seguro.
5. A sidebar apresentar os módulos corretos para cada perfil.
6. A central de relatórios estiver funcional e vinculada às permissões reais.
7. A `DashboardAnaliticoPage` apresentar indicadores reais e links para os relatórios correspondentes.
8. Os testes de acesso permitido e negado passarem.
9. As melhorias de upload e validação documental estiverem implementadas e com dependências externas claramente verificadas.
10. TypeScript, lint, build e testes forem executados e os resultados registrados.
11. Nenhuma alteração remota não autorizada tiver sido aplicada.
12. As alterações estiverem organizadas em commits claros na branch correta, sem incluir segredos ou arquivos locais indevidos.

## 11. RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, entregue um relatório objetivo contendo:

- Branch e commits criados.
- Arquivos implementados ou modificados.
- Funcionalidades efetivamente concluídas.
- Migrations criadas e seu estado, distinguindo local de remoto.
- Como executar o seed.
- Como autenticar e testar cada perfil no ambiente de teste.
- Quais relatórios estão funcionais e quais dependem de dados indisponíveis.
- Resultados reais de TypeScript, lint, build e testes.
- Integrações de OCR e antimalware efetivamente operacionais e as que dependem de configuração.
- Pendências restantes, com causa concreta e próximo passo.

**Não responda apenas que o plano foi entendido ou que a auditoria foi concluída. Execute a implementação integral dentro do escopo autorizado, valide os resultados e só então apresente a conclusão. Se uma dependência externa ou limitação de acesso impedir alguma parte, conclua tudo o que puder ser concluído com segurança, registre precisamente o bloqueio e não declare a parte bloqueada como pronta.**

## O que essa instrução exige de verdade

Ela cobra quatro entregas que estavam faltando:

- Seed utilizável: perfis distintos, dados operacionais de teste e instruções para entrar com cada usuário.
- Gestão de acesso funcional: o administrador da instituição consegue liberar acessos sem transformar os usuários em ROOT.
- Relatórios e dashboard integrados: cada perfil vê o que está autorizado a consultar, e os cards abrem os relatórios correspondentes.
- Validação documental: o fluxo de múltiplos arquivos, integridade, OCR e segurança entra no escopo da implementação, em vez de ficar apenas como proposta.

Uma ressalva importante: pedir tudo de uma vez não elimina dependências técnicas. O Kilo deve concluir a entrega integrada, mas não pode afirmar que criou contas, ativou um scanner ou publicou migrations se isso não tiver sido realmente executado e verificado.

O lembrete de 28 de outubro de 2026 para revisar a jornada de Nova Remoção já está agendado. Você também pode me pedir para acompanhar a validação final desta entrega quando o Kilo devolver o relatório.
