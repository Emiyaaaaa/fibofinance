"use client";
import { useEffect, useState } from "react";

export default function useClientWidth() {
  const [width, setWidth] = useState(typeof document !== "undefined" ? document?.documentElement?.clientWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(document.documentElement.clientWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
}
