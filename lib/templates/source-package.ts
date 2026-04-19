import { z } from "zod";

const portfolioCommunitySourcePackageSchema = z.object({
  variant: z.string().trim().min(1),
  codeDir: z.string().trim().min(1),
  rendererEntry: z.string().trim().min(1),
  appEntry: z.string().trim().min(1),
  styles: z.array(z.string().trim().min(1)).default([]),
  canvas: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    background: z.string().trim().min(1),
    fontFamily: z.string().trim().min(1),
  }),
  sectionOrder: z.array(z.string().trim().min(1)).default([]),
  imports: z.object({
    default: z.record(z.string().trim().min(1)).default({}),
    named: z.record(z.string().trim().min(1)).default({}),
  }),
  svg: z.object({
    paths: z.record(z.string().trim().min(1)).default({}),
    named: z.record(z.string().trim().min(1)).default({}),
  }),
  sourceFiles: z.object({
    app: z.string(),
    home: z.string(),
    imageWithFallback: z.string(),
    fontsCss: z.string(),
    indexCss: z.string(),
    themeCss: z.string(),
  }),
});

export type PortfolioCommunitySourcePackage = z.infer<
  typeof portfolioCommunitySourcePackageSchema
>;

export function readPortfolioCommunitySourcePackage(value: unknown) {
  return portfolioCommunitySourcePackageSchema.parse(
    typeof value === "object" && value !== null ? value : {}
  );
}
