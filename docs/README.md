# FolioTree Docs

Status: active documentation index
Metodo: Metodo Estrutural Integrado
Last updated: 2026-04-28

## Modo de entrada

**Realidade**, com execucao por **Corte**.

O projeto ja possui codigo, rotas, documentacao, auditorias, planos e prototipos legados. A documentacao ativa foi reorganizada para operar por fontes de verdade, contratos, backlog e slices.

## Fontes de verdade

Leia nesta ordem:

1. `00_governanca/metodo-integrado-aplicado.md`
2. `00_governanca/fontes-de-verdade.md`
3. `03_fundacoes/arquitetura-atual.md`
4. `01_produto_e_briefing/briefing-integrado.md`
5. `02_contratos/contratos-minimos.md`
6. `02_contratos/contrato-remaster-social-ui.md`, quando o corte atual for o remaster social
7. `10_backlog/backlog-estrutural.md`
8. `10_backlog/backlog-remaster-social-ui.md`, quando o corte atual for o remaster social
9. `11_slices_e_cortes/slice-atual.md`
10. `12_auditoria/inventario-e-auditoria-documental.md`

## Estrutura

```text
docs/
  00_governanca/
  01_produto_e_briefing/
  02_contratos/
  03_fundacoes/
  04_navegacao_e_shell/
  05_padroes_ui/
  06_jornadas/
  07_modulos/
  08_integracoes/
  09_analises/
  10_backlog/
  11_slices_e_cortes/
  12_auditoria/
  13_legado/
```

## Legado

Os documentos anteriores foram preservados em:

`13_legado/pre-integrado-2026-04-27/`

Eles sao contexto historico e evidencia, nao fonte primaria. Quando houver conflito, prevalecem os documentos ativos e o codigo real.

## Regra de execucao

Nao implementar nova mudanca sem:

- modo classificado;
- fonte de verdade definida;
- contrato minimo do slice;
- backlog/dependencias;
- criterio de pronto;
- evidencia esperada;
- validacao objetiva.
