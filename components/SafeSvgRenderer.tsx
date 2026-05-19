"use client";

import { useEffect, useRef } from "react";

import { sanitizeSvg } from "@/utils/sanitizeSvg";

interface SafeSvgRendererProps {
  svgContent: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function SafeSvgRenderer({
  svgContent,
  className = "",
  width,
  height,
}: SafeSvgRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    containerRef.current.innerHTML = "";

    const sanitized = sanitizeSvg(svgContent);

    if (!sanitized) {
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitized, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");

      if (parserError) {
        return;
      }

      const svgElement = doc.querySelector("svg");

      if (!svgElement) {
        return;
      }

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;

      if (width) clonedSvg.setAttribute("width", String(width));
      if (height) clonedSvg.setAttribute("height", String(height));

      containerRef.current.appendChild(clonedSvg);
    } catch (error) {
      console.error("Error rendering SVG:", error);
    }
  }, [svgContent, width, height]);

  return <div ref={containerRef} className={className} />;
}
