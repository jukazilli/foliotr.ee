# Classificação dos planos legados

Status: FECHADO
Last updated: 2026-04-29

## Objetivo

Classificar os planos de feature preservados em `docs/13_legado/pre-integrado-2026-04-27/` para evitar que material antigo concorra com fontes ativas.

## Regra de leitura

- `IMPLEMENTADO`: o código atual ou backlog fechado mostra que a entrega principal existe.
- `PARCIAL`: parte relevante existe, mas ainda há lacuna registrada.
- `BACKLOG`: ideia válida, mas não contratada para execução atual.
- `SUPERSEDED`: substituído por contrato, slice ou arquitetura ativa.
- `REFERÊNCIA`: material de contexto, não contrato executor.

## Planos de feature

| Arquivo legado | Classificação | Evidência ativa | Observação |
| --- | --- | --- | --- |
| `reviews-feature-plan.md` | IMPLEMENTADO | `lib/server/domain/reviews.ts`, `components/public/PublicReviewsSection.tsx`, `tests/domain/reviews-domain.test.ts` | Reviews públicas existem, nascem ocultas e agora incluem regra anti-autoavaliação. |
| `public-profile-hub-plan.md` | IMPLEMENTADO | `components/public/PublicProfileHubPage.tsx`, `app/[username]/page.tsx` | Hub público renderiza capa, resumo, portfólio e reviews. |
| `public-portfolio-tabs-plan.md` | IMPLEMENTADO | `components/public/PublicPortfolioTabsPage.tsx` | Página pública em abas existe; refinamentos futuros ficam no backlog visual. |
| `presentations-feature-plan.md` | IMPLEMENTADO | `ProfilePresentation` no schema, `ProfileEditor` e seleção por versão | Apresentações reutilizáveis existem no perfil base. |
| `editor-project-carousel-polish-plan.md` | PARCIAL | `components/templates/portfolio-community/*`, editor legado depreciado | Parte visual foi absorvida, mas o editor técnico foi depreciado no remaster social UI. |
| `asset-gallery-and-resume-ui-plan.md` | PARCIAL | `components/assets/AssetGalleryPicker.tsx`, `components/resume/ResumeView.tsx` | Galeria existe, mas refinamentos de currículo e asset governance seguem dependentes de slices futuros. |
| `gallery-and-dashboard-optimization-plan.md` | SUPERSEDED | `docs/10_backlog/backlog-remaster-social-ui.md` slices 2 e 7 | Dashboard foi descontinuado/redirecionado; galeria segue como módulo autenticado. |
| `template-editor-ui-optimization-plan.md` | SUPERSEDED | Slice 7 do remaster social UI | Editor técnico foi depreciado; não usar como contrato de produto novo. |
| `inline-canvas-editor-plan.md` | SUPERSEDED | Slice 7 do remaster social UI | Ideia de editor inline fica legado, pois a direção atual evita editor técnico. |
| `landing-carousel-first-block-plan.md` | BACKLOG | `components/landing/*` | Ideia visual ainda pode ser retomada, mas não é dependência do produto autenticado. |

## Contratos e arquitetura legados

| Arquivo legado | Classificação | Uso atual |
| --- | --- | --- |
| `current-architecture.md` | REFERÊNCIA | Comparar com `docs/03_fundacoes/arquitetura-atual.md`. |
| `architecture-checkup-2026-04-27.md` | REFERÊNCIA | Origem das lacunas estruturais atuais. |
| `architecture-optimization-slices.md` | REFERÊNCIA | Histórico de decisões já absorvidas. |
| `mvp-architecture.md` | SUPERSEDED | Substituído por docs ativos e runtime real. |
| `mvp-executable-plan.md` | SUPERSEDED | Substituído por backlog por slices. |
| `mvp-technical-audit.md` | REFERÊNCIA | Usar apenas como diagnóstico histórico. |
| `templates-architecture.md` | REFERÊNCIA | Contexto do modelo de templates. |
| `templates-canonical-contract.md` | REFERÊNCIA | Contrato antigo ainda útil para compatibilidade. |
| `vocational-test-contract.md` | REFERÊNCIA | Deve alimentar o módulo oficial de teste vocacional. |
| `setup.md` | REFERÊNCIA | Setup histórico; validar contra código antes de usar. |
| `runtime-architecture-decision.md` | REFERÊNCIA | Decisão histórica de runtime. |

## Decisão

O Slice documental 2 fica fechado: os planos legados de feature foram classificados e agora não devem ser usados como fonte executora sem passar pelo backlog ativo.

## Próximo corte

Consolidar jornadas oficiais em `docs/06_jornadas/`, usando esta classificação e o código real como fontes.
