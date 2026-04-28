# Reviews Feature Plan

Status: em implementacao
Data: 2026-04-27

## Objetivo

Substituir a experiencia de "Provas" por "Reviews" no Linkfolio/FolioTree.
Visitantes publicos podem deixar uma review com nota de 1 a 5 estrelas. A review entra oculta por padrao. O usuario dono do perfil revisa as reviews na plataforma e decide quais aparecem publicamente.

## Decisoes deste corte

- O nome tecnico `Proof` permanece no banco e no codigo interno neste corte para evitar uma migracao destrutiva ampla.
- A superficie de produto passa a chamar o recurso de `Reviews`.
- Reviews criadas por visitantes publicos recebem `isVisible=false`.
- A media publica considera apenas reviews visiveis.
- A listagem publica mostra apenas reviews visiveis.
- Reviews ocultas aparecem na area autenticada do dono do perfil.
- TODO tecnico: no futuro, reviews ocultas so devem ser acessiveis por usuarios premium logados.

## Modelo de dados

Campos adicionados ao modelo tecnico `Proof`:

- `reviewerName`
- `reviewerRole`
- `reviewerEmail`
- `rating`
- `isVisible`
- `source`

Campos legados reaproveitados:

- `title`: titulo interno/fallback do autor.
- `description`: texto da review.
- `metric`: fallback de cargo/contexto.
- `url`, `imageUrl`, `assetId`, `tags`: permanecem para compatibilidade com provas antigas.

## Checklist de implementacao

- [x] Estado atual mapeado: schema, validacoes, editor de perfil, rotas publicas e snapshots usam `Proof`.
- [x] Contrato documentado neste arquivo.
- [x] Schema Prisma e migracao adicionam metadados de review sem remover campos antigos.
- [x] Validacoes aceitam rating, visibilidade e autor da review.
- [x] Dominio de perfil salva e retorna os novos campos.
- [x] Rota publica cria review oculta por padrao.
- [x] Pagina publica exibe media/lista de reviews visiveis e formulario de envio.
- [x] Editor autenticado renomeia a aba para Reviews e permite mostrar/ocultar reviews.
- [x] Validacoes tecnicas executadas.

## Validacoes executadas

- `npm run db:validate`
- `npm run typecheck`
- `npm run lint -- --quiet`
- `npm run test` (19 arquivos, 75 testes)
- `npx prettier --check` nos arquivos tocados pela feature

Observacao: `npm run format:check` no repositorio inteiro ainda falha por arquivos preexistentes fora do padrao, fora do escopo deste corte.

## Pendencias futuras

- Implementar gate premium para visualizar reviews ocultas.
- Renomear fisicamente `Proof` para `Review` em uma migracao dedicada, se o produto confirmar que nao precisa mais do conceito antigo de prova/case/link.
- Integrar reviews aos templates canonicos e ao editor visual como bloco nativo.
