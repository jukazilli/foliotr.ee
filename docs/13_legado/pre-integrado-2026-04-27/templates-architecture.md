# FolioTree Template Architecture

Status: foundation implemented  
First canonical template: `portfolio-community` from Figma node `0:3`

## Mental Model

Templates are visual systems, not generic CMS pages.

The product flow remains:

`Profile -> Version -> Page -> Template blocks`

- `Profile` owns the professional source data.
- `Version` selects and adapts that source data.
- `Page` is the published output for one version.
- `Template` defines a canonical visual identity and allowed structure.
- `TemplateBlockDef` defines block contracts available inside one template.
- `PageBlock` is the editable instance: order, visibility, config, props, assets and optional hierarchy.

## Canonical Templates

Each template can define its own block vocabulary. The system does not assume every template shares the same blocks.

Canonical template source is now split in two layers:

- `assets/template/<slug>/template-code/...` keeps the raw imported SPA bundle archived.
- `assets/template/<slug>/manifest.ts` is the local canonical manifest used for sync, metadata validation, eligibility rules and template library rendering.

The runtime never executes the raw SPA bundle directly.

The first canonical template is `portfolio-community`, implemented from:

`https://www.figma.com/design/iAMuri8gFv1i7enLtJuyib/Portfolio--Community-?node-id=0-3&m=dev`

Its visual identity is fixed:

- font: Poppins
- background: `#FBF8CC`
- ink: `#03045E`
- soft section headings: `#F7F197`
- accent: `#F5EE84`
- brown detail color: `#474306`

Users can edit content, images, links, block order, visibility and compatible sections. Users cannot edit theme, colors or typography for canonical templates.

## Block Contract

Block rendering is allowlisted.

Contracts live in `lib/templates/contracts.ts` and validate:

- known block type
- safe text fields
- safe image paths
- safe links
- known editable field shape

The renderer never executes arbitrary HTML. React text rendering is used for user content, and `dangerouslySetInnerHTML` is intentionally avoided.

Supported structural field elements are:

- `section`
- `div`
- `h1` to `h6`
- `text`
- `image`
- `link`
- `button`
- `list`
- `group`
- `repeater`

## Page Blocks

`PageBlock` stores the editable instance:

- `key`
- `blockType`
- `templateBlockDefId`
- `parentId`
- `order`
- `visible`
- `config`
- `props`
- `assets`

For canonical templates, `config` receives the resolved initial content and `props.semantic` stores provenance metadata for each block. This is how the first template keeps traceability of what came from `Profile`, what came from `Version`, and what was derived or left as template fallback.

`parentId` keeps the base ready for nested block structures without forcing every template into nesting.

## Figma MCP Readiness

Figma import should map future nodes into:

1. `Template.theme`
2. `TemplateBlockDef`
3. block `editableFields`
4. block `assetFields`
5. default block config
6. static template assets under `public/templates/{slug}`

The current Figma assets for `portfolio-community` are persisted under:

`public/templates/portfolio-community`

The template library cover is synchronized from `assets/template/<slug>/cover.png` into:

`public/template-assets/<slug>/...`

This keeps `assets/template` as the source of truth while avoiding internal path exposure in the UI.

## Semantic Mapping

Canonical template mapping is now explicit:

- `assets/template/<slug>/manifest.ts` declares semantic slots per block
- `lib/templates/template-resolver.ts` resolves the strategy for a template slug
- `lib/templates/template-content-mapper.ts` produces initial seeded block content
- `lib/templates/semantic/<slug>.ts` maps `Profile -> Version -> Template`

For `portfolio-community`, the first seed resolves:

- hero -> display name, headline, avatar, resume CTA
- about -> bio/about
- education -> selected education and training items
- trajectory -> selected experiences
- work -> selected projects
- contact -> public email, links and proofs

This makes the template part of the FolioTree domain instead of an isolated SPA.

## Temporary Image Uploads

`POST /api/assets/upload` accepts image files, validates type and size through the existing storage policy, uploads them to the configured S3-compatible provider, and creates an `Asset` row.

When `purpose=avatar`, the route also updates `Profile.avatarUrl`; canonical template eligibility uses this field to decide whether templates that require a portrait can be applied. The current provider target is Supabase Storage through its S3-compatible endpoint.
