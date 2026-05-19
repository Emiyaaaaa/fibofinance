import { validateSvgElementTree } from "@/utils/svgSanitizeCore";
import { containsDangerousSvgPatterns, validateSvgContent, validateSvgStructure } from "@/utils/svgSecurity";

export { validateSvgContent as validateSvg } from "@/utils/svgSecurity";

export function sanitizeSvg(svgString: string): string | null {
  try {
    if (!svgString || typeof svgString !== "string") {
      return null;
    }

    if (!validateSvgStructure(svgString) || containsDangerousSvgPatterns(svgString)) {
      return null;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");

    const parserError = doc.querySelector("parsererror");

    if (parserError) {
      return null;
    }

    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      return null;
    }

    if (!validateSvgElementTree(svgElement as unknown as Parameters<typeof validateSvgElementTree>[0])) {
      return null;
    }

    return svgString;
  } catch (error) {
    console.error("Error sanitizing SVG:", error);
    return null;
  }
}
