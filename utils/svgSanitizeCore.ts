import { BLOCKED_ELEMENTS } from "@/utils/svgSecurity";

type SvgElement = {
  tagName: string;
  attributes: { length: number; [index: number]: { name: string; value: string } };
  children?: SvgElement[];
  childNodes?: { length: number; [index: number]: Partial<SvgElement> & { nodeType?: number } };
};

function getAttributes(element: SvgElement): { name: string; value: string }[] {
  const attrs: { name: string; value: string }[] = [];

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];

    if (attr) {
      attrs.push(attr);
    }
  }

  return attrs;
}

function getChildElements(element: SvgElement): SvgElement[] {
  if (element.children) {
    return [...element.children];
  }

  if (!element.childNodes) {
    return [];
  }

  const children: SvgElement[] = [];

  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];

    if (child?.nodeType === 1 && child.tagName && child.attributes) {
      children.push(child as SvgElement);
    }
  }

  return children;
}

export function validateSvgElementTree(element: SvgElement): boolean {
  const tagName = element.tagName.toLowerCase();

  if (BLOCKED_ELEMENTS.has(tagName)) {
    return false;
  }

  for (const attr of getAttributes(element)) {
    const attrName = attr.name.toLowerCase();
    const attrValue = attr.value.toLowerCase();

    if (attrName.startsWith("on")) {
      return false;
    }

    if (attrValue.includes("javascript:") || attrValue.includes("vbscript:")) {
      return false;
    }

    if (
      (attrName === "href" || attrName === "xlink:href") &&
      (attrValue.startsWith("javascript:") || attrValue.startsWith("data:text/html"))
    ) {
      return false;
    }
  }

  for (const child of getChildElements(element)) {
    if (!validateSvgElementTree(child)) {
      return false;
    }
  }

  return true;
}
