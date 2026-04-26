# Teste de Orientação Profissional — Frontend MVP

Aplicação React + TypeScript com 60 perguntas, cálculo local, salvamento automático no navegador e relatório final com gráficos radar.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## O que já está incluso

- React + TypeScript + Vite
- 60 perguntas divididas em Big Five, RIASEC e Arquétipos
- Cálculo local determinístico
- Pontuação invertida nas perguntas configuradas
- Normalização de 0 a 100
- Código RIASEC com top 3 dimensões
- Arquétipo dominante
- Matriz de recomendação por áreas
- Índice de clareza/confiança
- Relatório completo com forças, pontos de atenção, áreas, carreiras e próximos passos
- Gráficos radar em SVG puro, sem biblioteca externa de gráficos
- Salvamento automático no localStorage
- Botão para limpar teste e recomeçar
- Exportação do resultado em JSON

## Preparação para backend

A camada atual salva tudo em `localStorage`. Quando o backend estiver pronto, substitua os pontos indicados no arquivo `src/utils/storage.ts` e envie para API os objetos `answers`, `result` e `profile`.
