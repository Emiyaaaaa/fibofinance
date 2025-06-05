// SVG sanitization utility to prevent XSS attacks

// Allowed SVG elements
const ALLOWED_ELEMENTS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'rect', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient',
  'stop', 'use', 'symbol', 'marker', 'clipPath', 'mask', 'pattern',
  'image', 'animate', 'animateTransform', 'animateMotion', 'title', 'desc'
]);

// Allowed attributes for SVG elements
const ALLOWED_ATTRIBUTES = new Set([
  // Presentation attributes
  'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'fill-opacity',
  'stroke-opacity', 'transform', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y',
  'width', 'height', 'd', 'points', 'x1', 'y1', 'x2', 'y2',
  
  // SVG specific
  'viewBox', 'preserveAspectRatio', 'xmlns', 'version',
  
  // Text
  'font-size', 'font-family', 'font-weight', 'text-anchor',
  
  // Gradients
  'offset', 'stop-color', 'stop-opacity', 'gradientUnits',
  'gradientTransform', 'spreadMethod',
  
  // References (safe)
  'id', 'class', 'style',
  
  // Clip and mask
  'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end',
  
  // Animation (limited)
  'dur', 'repeatCount', 'from', 'to', 'begin', 'end', 'values',
  'attributeName', 'type', 'calcMode', 'keyTimes', 'keySplines'
]);

// Dangerous event handlers and attributes to remove
const DANGEROUS_ATTRIBUTES = [
  'onload', 'onerror', 'onmouseover', 'onmouseout', 'onmousemove',
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onkeydown',
  'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange', 'onsubmit',
  'onreset', 'onselect', 'oninput', 'oncontextmenu', 'ondrag',
  'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart',
  'ondrop', 'onscroll', 'onwheel', 'oncopy', 'oncut', 'onpaste',
  'onabort', 'oncanplay', 'oncanplaythrough', 'ondurationchange',
  'onemptied', 'onended', 'onloadeddata', 'onloadedmetadata',
  'onloadstart', 'onpause', 'onplay', 'onplaying', 'onprogress',
  'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend',
  'ontimeupdate', 'onvolumechange', 'onwaiting'
];

export function sanitizeSvg(svgString: string): string | null {
  try {
    // Basic validation
    if (!svgString || typeof svgString !== 'string') {
      return null;
    }

    // Remove any script tags first
    svgString = svgString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Parse SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return null;
    }

    // Get the SVG element
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      return null;
    }

    // Clean the SVG
    cleanElement(svgElement);

    // Serialize back to string
    const serializer = new XMLSerializer();
    const cleanedSvg = serializer.serializeToString(svgElement);

    return cleanedSvg;
  } catch (error) {
    console.error('Error sanitizing SVG:', error);
    return null;
  }
}

function cleanElement(element: Element): void {
  // Remove element if not allowed
  if (!ALLOWED_ELEMENTS.has(element.tagName.toLowerCase())) {
    element.remove();
    return;
  }

  // Remove dangerous attributes
  const attributes = Array.from(element.attributes);
  for (const attr of attributes) {
    const attrName = attr.name.toLowerCase();
    
    // Remove event handlers
    if (DANGEROUS_ATTRIBUTES.some(dangerous => attrName.startsWith(dangerous))) {
      element.removeAttribute(attr.name);
      continue;
    }
    
    // Remove javascript: URLs
    if (attr.value.toLowerCase().includes('javascript:')) {
      element.removeAttribute(attr.name);
      continue;
    }
    
    // Remove data: URLs except for images
    if (attr.value.toLowerCase().includes('data:') && 
        element.tagName.toLowerCase() !== 'image') {
      element.removeAttribute(attr.name);
      continue;
    }
    
    // Remove if not in allowed list
    if (!ALLOWED_ATTRIBUTES.has(attrName)) {
      element.removeAttribute(attr.name);
    }
  }

  // Remove script and foreignObject elements
  const dangerousElements = element.querySelectorAll('script, foreignObject');
  dangerousElements.forEach(el => el.remove());

  // Recursively clean child elements
  const children = Array.from(element.children);
  for (const child of children) {
    cleanElement(child);
  }
}

// Validate SVG structure
export function validateSvg(svgString: string): boolean {
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

  // Must not contain event handlers
  if (/on\w+\s*=/i.test(svgString)) {
    return false;
  }

  // Must not contain javascript: protocol
  if (/javascript:/i.test(svgString)) {
    return false;
  }

  return true;
}