"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/types";
import { fetchWithTime } from "@/utils/fetchWithTime";

interface IconRendererProps {
  iconKey?: string;
  size?: number;
  className?: string;
}

// Cache icons to avoid repeated fetches
let iconCache: Icon[] = [];
let cachePromise: Promise<Icon[]> | null = null;

const fetchIconsCache = async (): Promise<Icon[]> => {
  if (iconCache.length > 0) {
    return iconCache;
  }
  
  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = fetchWithTime("/api/icons")
    .then(res => res.json())
    .then(data => {
      iconCache = data;
      return data;
    })
    .catch(() => {
      cachePromise = null;
      return [];
    });

  return cachePromise;
};

export default function IconRenderer({ iconKey, size = 20, className = "" }: IconRendererProps) {
  const [icon, setIcon] = useState<Icon | null>(null);

  useEffect(() => {
    if (!iconKey) return;

    // Check cache first
    const cachedIcon = iconCache.find(i => i.key === iconKey);
    if (cachedIcon) {
      setIcon(cachedIcon);
      return;
    }

    // Fetch icons if not in cache
    fetchIconsCache().then(icons => {
      const foundIcon = icons.find(i => i.key === iconKey);
      if (foundIcon) {
        setIcon(foundIcon);
      }
    });
  }, [iconKey]);

  if (!icon || !iconKey) {
    return null;
  }

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
}