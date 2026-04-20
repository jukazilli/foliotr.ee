import { describe, expect, it } from "vitest";
import {
  safeParseBlockConfig,
  validateBlockConfig,
} from "@/lib/templates/contracts";

describe("template block contracts", () => {
  it("accepts canonical Portfolio Community block content", () => {
    const config = validateBlockConfig("portfolio.hero", {
      eyebrow: "Ola, eu sou",
      headline: "Designer de Produto",
      locationLine: "com base em Joinville.",
      ctaLabel: "Curriculo",
      ctaHref: "/resume",
      portrait: {
        src: "/templates/portfolio-community/profile-photo.png",
        alt: "Retrato",
      },
    });

    expect(config).toMatchObject({
      eyebrow: "Ola, eu sou",
      headline: "Designer de Produto",
      ctaLabel: "Curriculo",
    });
  });

  it("rejects arbitrary HTML in editable text fields", () => {
    const result = safeParseBlockConfig("portfolio.about", {
      title: "sobre.",
      body: "<script>alert('xss')</script>",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported block types before rendering", () => {
    expect(safeParseBlockConfig("custom.javascript", {})).toEqual({
      success: false,
      data: null,
    });
  });

  it("rejects unsafe image references", () => {
    const result = safeParseBlockConfig("portfolio.contact", {
      title: "contato.",
      image: {
        src: "javascript:alert(1)",
        alt: "Bad image",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsafe links in canonical hero actions", () => {
    const result = safeParseBlockConfig("portfolio.hero", {
      headline: "Designer de Produto",
      ctaHref: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
  });

  it("accepts mailto links in canonical contact blocks", () => {
    const config = validateBlockConfig("portfolio.contact", {
      title: "contato.",
      links: [
        {
          label: "juliano@example.com",
          href: "mailto:juliano@example.com",
        },
      ],
    });

    expect(config).toMatchObject({
      links: [
        {
          label: "juliano@example.com",
          href: "mailto:juliano@example.com",
        },
      ],
    });
  });

  it("rejects unsafe links in canonical contact blocks", () => {
    const result = safeParseBlockConfig("portfolio.contact", {
      title: "contato.",
      links: [
        {
          label: "Bad",
          href: "javascript:alert(1)",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
