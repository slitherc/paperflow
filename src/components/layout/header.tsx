import { FileText, Menu } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
          <Button
            variant="outline"
            size="lg"
            className="hidden px-4 py-4.5 md:inline-flex"
          >
            Sign in
          </Button>
          <Button size="lg" className="px-4 py-4.5">
            Get Pro
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="md:hidden">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                {NAV.map((n) => (
                  <SheetClose asChild key={n.label}>
                    <Link
                      href={n.href}
                      target={n.external ? "_blank" : undefined}
                      rel={n.external ? "noreferrer noopener" : undefined}
                      className="text-foreground hover:bg-muted rounded-md px-3 py-2.5 text-sm font-medium"
                    >
                      {n.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="border-border mt-auto flex flex-col gap-2 border-t p-4">
                <SheetClose asChild>
                  <Button variant="outline" size="lg" className="w-full px-4 py-4.5">
                    Sign in
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
