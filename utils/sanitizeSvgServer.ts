// Server-side SVG sanitization utility

export function sanitizeSvgServer(svgString: string): string | null {
  if (!svgString || typeof svgString !== 'string') {
    return null;
  }

  // Remove script tags
  svgString = svgString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove foreignObject tags
  svgString = svgString.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  
  // Remove event handlers (on* attributes)
  svgString = svgString.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  svgString = svgString.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  svgString = svgString.replace(/javascript:/gi, '');
  
  // Remove data: URLs (except in image tags)
  svgString = svgString.replace(/(<(?!image)[^>]+)data:[^"'\s>]+/gi, '$1');
  
  // Basic structure validation
  if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
    return null;
  }

  return svgString.trim();
}

export function validateSvgServer(svgString: string): boolean {
  if (!svgString || typeof svgString !== 'string') {
    return false;
  }

  // Must contain <svg tag
  if (!svgString.includes('<svg')) {
    return false;
  }

  // Must not contain script tags
  if (/<script/i.test(svgString)) {
    return false;
  }

  // Must not contain foreignObject tags
  if (/<foreignObject/i.test(svgString)) {
    return false;
  }

  // Must not contain event handlers
  if (/\son\w+\s*=/i.test(svgString)) {
    return false;
  }

  // Must not contain javascript: protocol
  if (/javascript:/i.test(svgString)) {
    return false;
  }

  // Size limit (100KB)
  if (svgString.length > 100000) {
    return false;
  }

  return true;
}