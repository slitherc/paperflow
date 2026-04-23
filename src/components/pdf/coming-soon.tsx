import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getTool } from "@/lib/constants";

interface ComingSoonProps {
  slug: string;
}

export function ComingSoon({ slug }: ComingSoonProps) {
  const tool = getTool(slug);
  const title = tool?.title ?? "Coming soon";
  const description = tool?.description ?? "This tool isn't ready yet.";

  return (
    <>
      <Breadcrumb className="mb-1.5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="inline-flex items-center gap-1.5">
                <ArrowLeft className="size-3.5" />
                Tools
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="glass result-card" style={{ marginTop: 24, padding: 56 }}>
        <div
          className="result-icon"
          style={{
            background: "var(--pf-accent-soft)",
            color: "var(--pf-accent)",
          }}
        >
          <Sparkles size={32} strokeWidth={2} />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <p style={{ color: "var(--pf-fg-subtle)", fontSize: 13 }}>
          In the works — check back soon.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <Button variant="outline" size="lg" className="h-11 px-6 text-sm" asChild>
            <Link href="/">
              <ArrowLeft /> Back to tools
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
