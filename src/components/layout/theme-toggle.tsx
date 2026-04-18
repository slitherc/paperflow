"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="pf-btn pf-btn-ghost pf-btn-icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{isDark ? <Sun size={16} /> : <Moon size={16} />}</span>
    </button>
  );
}
