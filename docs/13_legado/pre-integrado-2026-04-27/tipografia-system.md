# Sistema Tipográfico LINKFOLIO

Status: aprovado para o redesign atual  
Última atualização: 2026-04-26

## Fonte oficial

Todo o produto usa `Poppins`.

Não usar mais Sora, Inter ou IBM Plex Mono como fontes oficiais do app. Essas fontes pertencem ao design system anterior e foram substituídas pelo redesign construído em `prototipos-legados/redesign-teste`.

## Uso

- Headlines: `Poppins` peso 800, tracking negativo leve, line-height curto.
- UI, botões e labels: `Poppins` peso 700-800, uppercase quando o componente pedir comando ou navegação.
- Texto de apoio: `Poppins` peso 500-600, line-height confortável.
- Dados e meta labels: continuar usando a classe `font-data` quando o código já depender dela, mas ela resolve para `Poppins`.

## Regra de implementação

`app/layout.tsx` carrega `Poppins` via `next/font/google` e define `--font-primary`.

Aliases preservados por compatibilidade:

- `--font-display`
- `--font-ui`
- `--font-data`
- `.font-display`
- `.font-data`
- `.mono`

Todos apontam para `Poppins`.
