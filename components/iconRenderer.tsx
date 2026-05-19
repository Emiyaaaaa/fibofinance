"use client";

import { useEffect } from "react";

import SafeSvgRenderer from "@/components/SafeSvgRenderer";
import { useIconDataStore } from "@/utils/store/useIconData";

interface IconRendererProps {
  iconKey?: string;
  size?: number;
  className?: string;
}

export default function IconRenderer({ iconKey, size = 20, className = "" }: IconRendererProps) {
  const icon = useIconDataStore((s) => (iconKey ? s.iconMap[iconKey] : undefined));
  const inited = useIconDataStore((s) => s.inited);
  const initData = useIconDataStore((s) => s.initData);

  useEffect(() => {
    if (!inited) {
      initData();
    }
  }, [inited, initData]);

  if (!icon || !iconKey) {
    return null;
  }

  return (
    <SafeSvgRenderer
      className={`inline-flex items-center justify-center ${className}`}
      height={size}
      svgContent={icon.svg}
      width={size}
    />
  );
}
