import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
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
      <nav className="crumb" aria-label="Breadcrumb">
        <Link
          href="/"
          className="pf-btn pf-btn-ghost"
          style={{ padding: "4px 8px", marginLeft: -8, fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Tools
        </Link>
        <span className="sep" aria-hidden="true">
          /
        </span>
        <span>{title}</span>
      </nav>

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
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
          <Link href="/" className="pf-btn pf-btn-lg">
            <ArrowLeft size={16} /> Back to tools
          </Link>
        </div>
      </div>
    </>
  );
}
