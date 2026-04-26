# Sistema Tonal LINKFOLIO

Status: aprovado para o redesign atual  
Última atualização: 2026-04-26

## Paleta oficial

O redesign atual substitui o sistema tonal antigo.

Tokens base:

- `paper`: `#faf9f6`
- `white`: `#ffffff`
- `ink`: `#1f2b16`
- `muted`: `#42503a`
- `line`: `#111111`
- `orange`: `#ff4d00`
- `lime`: `#dfff00`
- `blue`: `#245fd6`
- `blue-soft`: `#2f66d0`
- `rose`: `#8b0024`
- `pink`: `#ffd7f3`
- `cream`: `#eff4dc`
- `green`: `#6f7a47`
- `cyan`: `#00d1ff`
- `peach`: `#ffd1b3`

## Semântica

- Fundo padrão: `paper`.
- Blocos calmos e telas de cadastro/teste: `cream`.
- CTAs principais: `orange` com texto branco.
- Ações suaves e estados ativos: `pink`.
- Contraste e bordas: `line`.
- Texto principal: `ink`.
- Texto secundário: `muted`.

## Componentes

- Cards usam borda `line` de 2px e sombra dura.
- Botões principais são retangulares, uppercase e laranja.
- Inputs são grandes, brancos, com raio de 18px.
- Footer público mantém bloco branco sobre fundo roxo `#4a2474`.

## Compatibilidade

O `tailwind.config.js` mantém escalas antigas como `neutral`, `lime`, `blue`, `green`, `cyan`, `violet`, `coral` e `brown` apenas para evitar quebra visual durante a migração.

Novas telas devem preferir os tokens semânticos do redesign.
