# Jornada - Teste vocacional

Status: FECHADO
Last updated: 2026-04-29

## Objetivo

Permitir que o usuário responda ao teste vocacional e publique uma leitura comportamental no portfólio ou currículo quando fizer sentido.

## Entrada

- Visitante acessa `/teste-vocacional`.
- Usuário autenticado acessa `/teste-vocacional/app`.
- Perfil público consome resultado selecionado quando marcado como público.

## Passos

1. Usuário inicia ou retoma sessão do teste.
2. App registra perfil do teste e respostas.
3. Ao completar, domínio calcula resultado.
4. Resultado pode ficar público no portfólio e/ou currículo conforme configuração.
5. Hub público e páginas públicas exibem análise comportamental compacta quando disponível.

## Telas e componentes

- `app/teste-vocacional/page.tsx`
- `app/(app)/teste-vocacional/app/page.tsx`
- `components/vocation/VocationalTestApp.tsx`
- `components/vocation/BehavioralAnalysisSection.tsx`
- `lib/vocational-test/*`
- `app/api/vocational-test/*`

## Validações

- Rotas autenticadas usam `auth()`.
- Sessão do teste pertence ao usuário logado.
- Resultado público é selecionado por `selectBehavioralAnalysis`.

## Reflexos

- Perfil público pode exibir "Como costumo trabalhar".
- Página pública de portfólio pode mostrar personalidade/análise em aba própria.

## Lacunas

- Política de custo e limites para geração com Gemini ainda está parcial.
- Contrato do módulo vocacional deve ser detalhado em `docs/07_modulos/` em corte futuro.
