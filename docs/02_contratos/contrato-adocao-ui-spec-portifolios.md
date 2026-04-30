# Contrato - Adoção UI Spec Portifolios

Status: draft contract  
Last updated: 2026-04-28  
Modo de entrada: Slice

## Objetivo

Adotar o prototipo `prototipos-legados/spec-portifolios` como verdade visual para a tela de portfolios e, gradualmente, para a shell autenticada do FolioTree.

O backend, rotas, autenticacao, ownership e server actions do produto real continuam sendo a verdade operacional.

## Fontes de verdade

- UI/UX: `prototipos-legados/spec-portifolios/src/App.tsx`.
- Tokens visuais: `prototipos-legados/spec-portifolios/src/index.css`.
- Backend operacional: `app/(app)/portfolios/page.tsx`.
- Actions operacionais: `app/(app)/portfolios/actions.ts`.
- Shell real: `components/app/Header.tsx` e `components/app/AppShell.tsx`.

## Decisões

- Preservar nossa logo.
- Usar a shell compacta do prototipo como direcao para o app autenticado.
- Adotar `Inter` para UI e `Outfit` para display.
- Adotar fundo `#f6f8f1`, verde `#dcfce7`, rosa `#ffcce6`, preto `#111827`.
- Usar bordas de 2px e sombras duras.
- Remover dashboard de metricas da tela `/portfolios`.
- A tela de portfolios deve ser lista compacta, nao cards grandes.
- Acoes secundarias ficam no menu de tres pontos.
- Acoes inexistentes no prototipo mas necessarias no backend devem ser encaixadas na hierarquia visual do prototipo.

## Slice 1

Escopo:

- Ajustar tokens globais e shell autenticada para a linguagem compacta do prototipo.
- Refazer `/portfolios` com lista compacta.
- Manter actions reais de publicar/despublicar portfolio, publicar/despublicar curriculo e duplicar variacao.
- Preparar o link de editar variacao para `/portfolios/{versionId}/edit`.
- Remover cards de metricas.

Fora:

- Implementar `/portfolios/{versionId}/edit`.
- Alterar schema ou backend.
- Recriar todas as telas do sistema.

## Evidências esperadas

- `/portfolios` renderiza lista compacta alinhada ao prototipo.
- Cards de metricas removidos.
- Filtros `Todas`, `Publicas` e `Rascunhos` funcionam por query string.
- Menu de tres pontos contem publicar/rascunho, curriculo, duplicar e desativar.
- Shell usa nossa logo e visual compacto.
- `npm run typecheck` sem erro.
- Lint dos arquivos tocados sem erro.
- Busca de mojibake sem ocorrencias.
