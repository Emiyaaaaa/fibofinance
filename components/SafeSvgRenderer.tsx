"use client";

import { useEffect, useRef } from "react";

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
  height 
}: SafeSvgRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    try {
      // Create a new DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.error('SVG parsing error');
        return;
      }

      // Get the SVG element
      const svgElement = doc.querySelector('svg');
      if (!svgElement) {
        console.error('No SVG element found');
        return;
      }

      // Clone the SVG element
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set dimensions if provided
      if (width) clonedSvg.setAttribute('width', String(width));
      if (height) clonedSvg.setAttribute('height', String(height));
      
      // Remove any remaining dangerous attributes (double check)
      const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover'];
      dangerousAttrs.forEach(attr => {
        clonedSvg.removeAttribute(attr);
        // Also check all descendants
        clonedSvg.querySelectorAll(`[${attr}]`).forEach(el => {
          el.removeAttribute(attr);
        });
      });

      // Append the safe SVG to container
      containerRef.current.appendChild(clonedSvg);
    } catch (error) {
      console.error('Error rendering SVG:', error);
    }
  }, [svgContent, width, height]);

  return <div ref={containerRef} className={className} />;
}