# Módulo - Teste vocacional

Status: FECHADO
Last updated: 2026-04-29

## Responsabilidade

Executar o teste vocacional, persistir sessões e disponibilizar análise comportamental para portfólio e currículo.

## Rotas

- `app/teste-vocacional/page.tsx`
- `app/(app)/teste-vocacional/app/page.tsx`
- `app/api/vocational-test/session/route.ts`
- `app/api/vocational-test/sessions/[sessionId]/route.ts`
- `app/api/vocational-test/complete/route.ts`

## Componentes

- `components/vocation/VocationalTestApp.tsx`
- `components/vocation/VocationStart.tsx`
- `components/vocation/BehavioralAnalysisSection.tsx`

## Domínio e dados

- Prisma: `VocationalTestSession`.
- Domínio: `lib/vocational-test/*`.
- Exposição pública: `lib/vocational-test/public-analysis.ts`.

## Contratos

- Sessão autenticada pertence ao usuário logado.
- Resultado pode ser publicado em portfólio e/ou currículo.
- Perfil público mostra análise compacta quando houver resultado público.

## Lacunas

- Política Gemini de custo, limite e fallback segue parcial.
- Contrato de relatório gerado por IA deve ser detalhado em integrações/operacional.
