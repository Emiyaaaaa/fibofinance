import { DOMParser } from "@xmldom/xmldom";

import { validateSvgElementTree } from "@/utils/svgSanitizeCore";
import { isSvgWithinSizeLimit, validateSvgContent, validateSvgStructure } from "@/utils/svgSecurity";

export { validateSvgContent as validateSvgServer } from "@/utils/svgSecurity";

export function sanitizeSvgServer(svgString: string): string | null {
  try {
    if (!isSvgWithinSizeLimit(svgString) || !validateSvgStructure(svgString)) {
      return null;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const parserError = doc.getElementsByTagName("parsererror")[0];

    if (parserError) {
      return null;
    }

    const svgElement =
      doc.documentElement?.tagName?.toLowerCase() === "svg"
        ? doc.documentElement
        : doc.getElementsByTagName("svg")[0];

    if (!svgElement) {
      return null;
    }

    if (!validateSvgElementTree(svgElement as unknown as Parameters<typeof validateSvgElementTree>[0])) {
      return null;
    }

    return svgString;
  } catch {
    return null;
  }
}
