import { FileText } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Tools" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#docs", label: "Docs" },
  { href: "https://github.com", label: "GitHub", external: true },
];

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <FileText size={14} strokeWidth={2.2} />
          </span>
          Paperflow
        </Link>
        <nav className="nav-links">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              target={n.external ? "_blank" : undefined}
              rel={n.external ? "noreferrer noopener" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="topbar-actions">
          <ThemeToggle />
          <Button variant="outline" size="lg" className="px-4 py-4.5">
            Sign in
          </Button>
          <Button size="lg" className="px-4 py-4.5">
            Get Pro
          </Button>
        </div>
      </div>
    </header>
  );
}
