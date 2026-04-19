import { access, copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@/generated/prisma-client";
import { prisma } from "@/lib/prisma";
import {
  canonicalTemplateManifestSchema,
  type CanonicalTemplateManifest,
} from "@/lib/templates/manifest";
import type { PortfolioCommunitySourcePackage } from "@/lib/templates/source-package";
import { portfolioCommunityManifest } from "@/assets/template/portfolio-community/manifest";

const sourcePackages = [portfolioCommunityManifest];

function asInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function getSourcePackageRoot(slug: string) {
  return path.join(process.cwd(), "assets", "template", slug);
}

function resolveSourceAssetPath(
  manifest: CanonicalTemplateManifest,
  target: keyof CanonicalTemplateManifest["assets"]
) {
  const asset = manifest.assets[target];
  if (!asset) return null;
  return path.join(getSourcePackageRoot(manifest.slug), asset);
}

async function assertFileExists(targetPath: string | null, label: string) {
  if (!targetPath) {
    throw new Error(`Source package missing required path for ${label}`);
  }

  await access(targetPath);
}

async function publishTemplateAssets(manifest: CanonicalTemplateManifest) {
  const outputDir = path.join(process.cwd(), "public", "template-assets", manifest.slug);
  await mkdir(outputDir, { recursive: true });

  const coverSource = resolveSourceAssetPath(manifest, "cover");
  await assertFileExists(coverSource, `${manifest.slug}:cover`);
  const coverFileName = path.basename(manifest.assets.cover);
  await copyFile(coverSource as string, path.join(outputDir, coverFileName));

  let referenceUrl: string | null = null;
  if (manifest.assets.reference) {
    const referenceSource = resolveSourceAssetPath(manifest, "reference");
    await assertFileExists(referenceSource, `${manifest.slug}:reference`);
    const referenceFileName = path.basename(manifest.assets.reference);
    await copyFile(referenceSource as string, path.join(outputDir, referenceFileName));
    referenceUrl = `/template-assets/${manifest.slug}/${referenceFileName}`;
  }

  await assertFileExists(resolveSourceAssetPath(manifest, "notes"), `${manifest.slug}:notes`);
  await assertFileExists(resolveSourceAssetPath(manifest, "codeDir"), `${manifest.slug}:codeDir`);

  return {
    coverUrl: `/template-assets/${manifest.slug}/${coverFileName}`,
    referenceUrl,
  };
}

async function collectFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(rootDir, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(absolutePath);
      }

      return [absolutePath];
    })
  );

  return files.flat();
}

function parseDefaultSvgMap(source: string) {
  const normalized = source.replace(/^export default\s*/, "return ");
  return new Function(normalized)() as Record<string, string>;
}

function parseNamedSvgExports(source: string) {
  const matches = [...source.matchAll(/export const (\w+)\s*=\s*"([^"]+)";/g)];
  return Object.fromEntries(matches.map((match) => [match[1], match[2]]));
}

async function buildPortfolioCommunitySourcePackage(
  manifest: CanonicalTemplateManifest
): Promise<PortfolioCommunitySourcePackage> {
  const codeRoot = path.join(getSourcePackageRoot(manifest.slug), manifest.assets.codeDir);
  const importsRoot = path.join(codeRoot, "src", "imports");
  const homeImportsRoot = path.join(importsRoot, "Home");
  const publicImportsRoot = path.join(
    process.cwd(),
    "public",
    "template-assets",
    manifest.slug,
    "source",
    "template1",
    "imports"
  );

  await mkdir(publicImportsRoot, { recursive: true });

  const [
    appSource,
    homeSource,
    imageWithFallbackSource,
    fontsCssSource,
    indexCssSource,
    themeCssSource,
    svgPathsSource,
    namedSvgSource,
  ] = await Promise.all([
    readFile(path.join(codeRoot, "src", "app", "App.tsx"), "utf8"),
    readFile(path.join(homeImportsRoot, "Home.tsx"), "utf8"),
    readFile(
      path.join(codeRoot, "src", "app", "components", "figma", "ImageWithFallback.tsx"),
      "utf8"
    ),
    readFile(path.join(codeRoot, "src", "styles", "fonts.css"), "utf8"),
    readFile(path.join(codeRoot, "src", "styles", "index.css"), "utf8"),
    readFile(path.join(codeRoot, "src", "styles", "theme.css"), "utf8"),
    readFile(path.join(homeImportsRoot, "svg-4w73ym8661.ts"), "utf8"),
    readFile(path.join(homeImportsRoot, "svg-gs6is.tsx"), "utf8"),
  ]);

  const importFiles = await collectFiles(importsRoot);
  const assetFiles = importFiles.filter((filePath) =>
    /\.(png|jpe?g|webp|gif|svg)$/i.test(filePath)
  );

  const copiedAssetUrls = new Map<string, string>();
  for (const assetFile of assetFiles) {
    const relativeFile = path.relative(importsRoot, assetFile);
    const outputFile = path.join(publicImportsRoot, relativeFile);
    await mkdir(path.dirname(outputFile), { recursive: true });
    await copyFile(assetFile, outputFile);
    copiedAssetUrls.set(
      relativeFile.replace(/\\/g, "/"),
      `/template-assets/${manifest.slug}/source/template1/imports/${relativeFile.replace(/\\/g, "/")}`
    );
  }

  const defaultImportMatches = [
    ...homeSource.matchAll(/import\s+(\w+)\s+from\s+"\.\/([^"]+)";/g),
  ];
  const namedImportMatches = [
    ...homeSource.matchAll(/import\s+\{\s*(\w+)\s*\}\s+from\s+"\.\/([^"]+)";/g),
  ];

  const defaultImports: Record<string, string> = {};
  for (const match of defaultImportMatches) {
    const variableName = match[1];
    const importTarget = match[2];
    if (!/\.(png|jpe?g|webp|gif|svg)$/i.test(importTarget)) continue;

    const relativeKey = `Home/${importTarget}`.replace(/\\/g, "/");
    const url = copiedAssetUrls.get(relativeKey);
    if (url) {
      defaultImports[variableName] = url;
    }
  }

  const namedImports: Record<string, string> = {};
  const namedSvgExports = parseNamedSvgExports(namedSvgSource);
  for (const match of namedImportMatches) {
    const variableName = match[1];
    if (namedSvgExports[variableName]) {
      namedImports[variableName] = namedSvgExports[variableName];
    }
  }

  const maxTop = Math.max(
    ...Array.from(homeSource.matchAll(/top-\[(\d+)px\]/g)).map((match) => Number(match[1])),
    3857
  );
  const canvasHeight = maxTop + 180;

  return {
    variant: "template1",
    codeDir: manifest.assets.codeDir,
    rendererEntry: "src/imports/Home/Home.tsx",
    appEntry: "src/app/App.tsx",
    styles: [
      "src/styles/index.css",
      "src/styles/theme.css",
      "src/styles/fonts.css",
    ],
    canvas: {
      width: 1440,
      height: canvasHeight,
      background: manifest.theme.background,
      fontFamily: manifest.theme.fontFamily,
    },
    sectionOrder: ["hero", "about", "experience", "work", "contact"],
    imports: {
      default: defaultImports,
      named: namedImports,
    },
    svg: {
      paths: parseDefaultSvgMap(svgPathsSource),
      named: namedSvgExports,
    },
    sourceFiles: {
      app: appSource,
      home: homeSource,
      imageWithFallback: imageWithFallbackSource,
      fontsCss: fontsCssSource,
      indexCss: indexCssSource,
      themeCss: themeCssSource,
    },
  };
}

async function importManifest(rawManifest: unknown) {
  const manifest = canonicalTemplateManifestSchema.parse(rawManifest);
  const { coverUrl, referenceUrl } = await publishTemplateAssets(manifest);
  const sourcePackage =
    manifest.slug === "portfolio-community"
      ? await buildPortfolioCommunitySourcePackage(manifest)
      : {};

  const template = await prisma.template.upsert({
    where: { slug: manifest.slug },
    update: {
      name: manifest.name,
      description: manifest.description,
      thumbnail: coverUrl,
      coverUrl,
      referenceUrl,
      category: manifest.library.category,
      tags: manifest.library.tags,
      libraryStatus: manifest.library.status,
      origin: manifest.library.origin ?? null,
      summary: manifest.library.summary,
      detail: manifest.library.detail,
      sortOrder: manifest.library.sortOrder,
      eligibility: asInputJsonValue(manifest.eligibility),
      resumeDefaults: asInputJsonValue(manifest.resumeDefaults),
      restrictions: asInputJsonValue(manifest.restrictions),
      sourcePackage: asInputJsonValue(sourcePackage),
      version: manifest.version,
      source: manifest.source,
      sourceNodeId: null,
      theme: asInputJsonValue(manifest.theme),
      isActive: true,
    },
    create: {
      name: manifest.name,
      slug: manifest.slug,
      description: manifest.description,
      thumbnail: coverUrl,
      coverUrl,
      referenceUrl,
      category: manifest.library.category,
      tags: manifest.library.tags,
      libraryStatus: manifest.library.status,
      origin: manifest.library.origin ?? null,
      summary: manifest.library.summary,
      detail: manifest.library.detail,
      sortOrder: manifest.library.sortOrder,
      eligibility: asInputJsonValue(manifest.eligibility),
      resumeDefaults: asInputJsonValue(manifest.resumeDefaults),
      restrictions: asInputJsonValue(manifest.restrictions),
      sourcePackage: asInputJsonValue(sourcePackage),
      version: manifest.version,
      source: manifest.source,
      sourceNodeId: null,
      theme: asInputJsonValue(manifest.theme),
      isActive: true,
    },
  });

  const blockKeys = manifest.blocks.map((block) => block.key);
  await prisma.templateBlockDef.deleteMany({
    where: {
      templateId: template.id,
      key: { notIn: blockKeys },
    },
  });

  for (const block of manifest.blocks) {
    await prisma.templateBlockDef.upsert({
      where: {
        templateId_key: {
          templateId: template.id,
          key: block.key,
        },
      },
      update: {
        blockType: block.blockType,
        label: block.label,
        category: block.category,
        version: block.version,
        defaultOrder: block.defaultOrder,
        required: block.required,
        repeatable: block.repeatable,
        defaultConfig: asInputJsonValue(block.defaultConfig),
        defaultProps: asInputJsonValue(block.defaultProps),
        editableFields: asInputJsonValue(block.editableFields),
        assetFields: asInputJsonValue(block.assetFields),
        allowedChildren: asInputJsonValue(block.allowedChildren),
      },
      create: {
        templateId: template.id,
        key: block.key,
        blockType: block.blockType,
        label: block.label,
        category: block.category,
        version: block.version,
        defaultOrder: block.defaultOrder,
        required: block.required,
        repeatable: block.repeatable,
        defaultConfig: asInputJsonValue(block.defaultConfig),
        defaultProps: asInputJsonValue(block.defaultProps),
        editableFields: asInputJsonValue(block.editableFields),
        assetFields: asInputJsonValue(block.assetFields),
        allowedChildren: asInputJsonValue(block.allowedChildren),
      },
    });
  }
}

async function main() {
  const activeSlugs = sourcePackages.map((manifest) => manifest.slug);

  await prisma.template.updateMany({
    where: {
      slug: { notIn: activeSlugs },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  for (const manifest of sourcePackages) {
    await importManifest(manifest);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
