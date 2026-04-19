import { describe, expect, it } from "vitest";
import {
  safeParseBlockConfig,
  validateBlockConfig,
} from "@/lib/templates/contracts";

describe("template block contracts", () => {
  it("accepts canonical Portfolio Community block content", () => {
    const config = validateBlockConfig("portfolio.hero", {
      eyebrow: "Hello, I'm",
      headline: "Product Designer",
      locationLine: "based in Netherland.",
      ctaLabel: "Resume",
      ctaHref: "/resume",
      portrait: {
        src: "/templates/portfolio-community/profile-photo.png",
        alt: "Portrait",
      },
    });

    expect(config).toMatchObject({
      eyebrow: "Hello, I'm",
      headline: "Product Designer",
      ctaLabel: "Resume",
    });
  });

  it("rejects arbitrary HTML in editable text fields", () => {
    const result = safeParseBlockConfig("portfolio.about", {
      title: "about.",
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
      title: "contact.",
      image: {
        src: "javascript:alert(1)",
        alt: "Bad image",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsafe links in canonical hero actions", () => {
    const result = safeParseBlockConfig("portfolio.hero", {
      headline: "Product Designer",
      ctaHref: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
  });
});
