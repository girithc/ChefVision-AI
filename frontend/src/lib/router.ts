import { useEffect, useState } from "react";

// Minimal hash router: "#/receipts/abc" -> "/receipts/abc". Hash routing works
// behind nginx static hosting without server-side rewrites.
function currentPath(): string {
  return window.location.hash.replace(/^#/, "") || "/";
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

export function navigate(path: string) {
  window.location.hash = path;
}

/** Matches "/receipts/:id" style patterns; returns params or null. */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
