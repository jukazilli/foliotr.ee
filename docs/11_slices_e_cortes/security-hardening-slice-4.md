# Security Hardening - Slice 4

## Objetivo

Reduzir risco de upload malicioso validando a assinatura real da imagem antes de salvar no storage.

## Checklist Always Todo

- [x] Contexto da task definido: upload confiava no `file.type` enviado pelo cliente.
- [x] Estado atual explorado: havia validacao de MIME declarado, tamanho, storage key segura e auth.
- [x] Regra/abordagem definida: detectar magic bytes com `file-type` e exigir compatibilidade com MIME declarado e allowlist.
- [x] Implementacao concluida:
  - dependencia `file-type`;
  - deteccao real em `/api/assets/upload`;
  - rejeicao de arquivo sem assinatura ou com MIME divergente;
  - persistencia do MIME detectado;
  - headers seguros no proxy de assets.
- [x] Validacao executada: `npm run typecheck` e ESLint focado nas rotas de assets.
- [x] Textos e compatibilidade UTF-8 revisados: busca por mojibake sem ocorrencias.
- [x] Memoria atualizada: este documento registra decisoes e evidencias.

## Decisoes

- O upload agora exige que `detectedType.mime === file.type`. Isso e mais restritivo e reduz risco de arquivo renomeado.
- A allowlist continua vindo de `STORAGE_ALLOWED_IMAGE_TYPES`.
- Reprocessamento com `sharp` e remocao de metadados ficam para slice futuro, porque exigem validar compatibilidade com o ambiente de deploy.

## Evidencias Esperadas

- `app/api/assets/upload/route.ts` alterado.
- `app/api/assets/proxy/route.ts` alterado.
- `npm run typecheck`.
- ESLint focado nas rotas alteradas.
