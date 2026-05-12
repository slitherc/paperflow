"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
