# Modo Feedback

## Objetivo

Criar um modo de feedback interno para usuarios logados reportarem melhorias ou correcoes de forma anonima, marcando visualmente o ponto da tela onde perceberam o problema. Cada envio gera um ticket sequencial e dispara notificacao por email para o endereco de feedback configurado.

## Contrato do Produto

- O botao que hoje abre a Galeria no header passa a ativar/desativar o modo feedback.
- Enquanto o modo feedback estiver ativo, cliques na tela abrem um modal de feedback no ponto clicado.
- O modal tem:
  - tipo: `Melhoria` ou `Correcao`
  - descricao livre
  - acoes `Cancelar` e `Enviar`
- O feedback enviado e anonimo no conteudo de negocio, mas fica associado internamente ao usuario logado para auditoria e anti-abuso.
- Cada feedback gera um ticket sequencial: `#1`, `#2`, `#3`...
- Cada ticket registra rota, viewport, coordenadas absolutas/relativas e um resumo do elemento clicado.
- O email recebe o ticket, tipo, rota, coordenadas e descricao.

## Modo Desenvolvedor

- Usuarios com role `DEVELOPER` podem ativar o modo desenvolvedor na zona de perigo das configuracoes.
- Quando o modo desenvolvedor esta ativo, o overlay mostra todas as marcacoes existentes na rota atual.
- O modo desenvolvedor nao cria feedback; ele apenas visualiza tickets e marcas.

## Configuracao

- `FEEDBACK_EMAIL_TO`: email que recebe os tickets.
- `FEEDBACK_EMAIL_FROM`: remetente usado no envio. Padrao: `LINKFOLIO <feedback@linkfolio.local>`.
- `RESEND_API_KEY`: chave usada para enviar via Resend.
- Se `FEEDBACK_EMAIL_TO` ou `RESEND_API_KEY` nao estiverem configurados, o ticket continua sendo salvo e o envio de email e ignorado com log no servidor.
- A role `DEVELOPER` deve ser atribuida no banco. Nao existe autopromocao pela interface.

## Rotas e Componentes Entregues

- `POST /api/feedback/tickets`: cria ticket para usuario logado.
- `GET /api/feedback/tickets?route=/rota`: lista tickets para desenvolvedor.
- `FeedbackModeProvider`: captura feedback, renderiza modal e marcacoes.
- `DeveloperModeCard`: ativa/desativa o modo desenvolvedor nas configuracoes para roles autorizadas.

## Slices

### Slice 0 - Contrato e branch

- Criar branch `feat/feedback-mode`.
- Documentar contrato, escopo e criterios.

### Slice 1 - Dados, API e email

- Adicionar `User.role`.
- Adicionar entidade de tickets de feedback.
- Criar API para criar/listar tickets.
- Criar envio de email via hook configuravel.

### Slice 2 - Captura de feedback

- Substituir o botao da Galeria pelo toggle de modo feedback.
- Criar provider/overlay global no app shell.
- Capturar clique, abrir modal e enviar ticket.

### Slice 3 - Modo desenvolvedor

- Adicionar zona de perigo em configuracoes.
- Criar toggle local do modo desenvolvedor para roles autorizadas.
- Exibir marcacoes existentes por rota.

### Slice 4 - Validacao

- Rodar `prisma validate`, `prisma generate`, `typecheck` e lint dos arquivos alterados.
- Revisar copy e UTF-8.

## Fora de Escopo Neste Corte

- Dashboard completo de triagem de feedback.
- Status de workflow do ticket.
- Anexos ou screenshots automaticos.
- Integracao com GitHub Issues/Linear.
