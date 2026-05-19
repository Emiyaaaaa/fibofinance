// Shared SVG security rules for client and server validation (blacklist-based)

export const SVG_MAX_LENGTH = 100_000;

/** Blocked element tags (lowercase) */
export const BLOCKED_ELEMENTS = new Set([
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "style",
  "handler",
]);

const DANGEROUS_TAG_PATTERNS = Array.from(BLOCKED_ELEMENTS).map((tag) => new RegExp(`<${tag}\\b`, "i"));

const DANGEROUS_CONTENT_PATTERNS = [
  /\son\w+\s*=/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /data\s*:\s*application\/javascript/i,
  /expression\s*\(/i,
];

export function isSvgWithinSizeLimit(svg: string): boolean {
  return typeof svg === "string" && svg.length > 0 && svg.length <= SVG_MAX_LENGTH;
}

export function hasSvgRoot(svg: string): boolean {
  return typeof svg === "string" && /<svg\b/i.test(svg);
}

export function validateSvgStructure(svg: string): boolean {
  if (!isSvgWithinSizeLimit(svg)) {
    return false;
  }

  const trimmed = svg.trim();

  return /^<svg\b[\s\S]*<\/svg>$/i.test(trimmed) || /^<svg\b[^>]*\/>$/i.test(trimmed);
}

export function containsDangerousSvgPatterns(svg: string): boolean {
  if (!svg || typeof svg !== "string") {
    return true;
  }

  return (
    DANGEROUS_TAG_PATTERNS.some((pattern) => pattern.test(svg)) ||
    DANGEROUS_CONTENT_PATTERNS.some((pattern) => pattern.test(svg))
  );
}

export function validateSvgContent(svg: string): boolean {
  if (!validateSvgStructure(svg)) {
    return false;
  }

  if (containsDangerousSvgPatterns(svg)) {
    return false;
  }

  return true;
}
