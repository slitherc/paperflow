import {
  ArrowRight,
  Combine,
  ListOrdered,
  Lock,
  Minimize2,
  RotateCw,
  Shield,
  Sparkles,
  Split,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { TOOLS } from "@/lib/constants";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }
>;

const TOOL_ICONS: Record<string, IconComponent> = {
  merge: Combine,
  compress: Minimize2,
  split: Split,
  reorder: ListOrdered,
  rotate: RotateCw,
  delete: Trash2,
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-badge">
          <span className="dot" />
          Runs locally in your browser — files never leave your device
        </div>
        <h1>
          Every PDF tool.
          <br />
          <span className="grad">One quiet workspace.</span>
        </h1>
        <p>
          Merge, split, compress and edit PDFs with a clean, fast interface. No accounts, no
          watermarks, no uploads to a server you don&apos;t control.
        </p>
        <div className="trust-row">
          <span>
            <Lock size={14} /> Client-side
          </span>
          <span>
            <Zap size={14} /> Instant
          </span>
          <span>
            <Shield size={14} /> No tracking
          </span>
          <span>
            <Sparkles size={14} /> Free
          </span>
        </div>
      </section>

      <div className="section-head">
        <h2>Tools</h2>
        <span className="muted">Pick one to get started</span>
      </div>

      <div className="tool-grid">
        {TOOLS.map((t) => {
          const Icon = TOOL_ICONS[t.slug] ?? Combine;
          const live = t.status === "live";
          const body = (
            <>
              <div className="tool-icon">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
              </div>
              <div className="tool-meta">
                <span>{t.meta}</span>
                {live && (
                  <span className="tool-arrow">
                    <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </>
          );

          if (live) {
            return (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="tool-card"
                style={{ textDecoration: "none" }}
              >
                {body}
              </Link>
            );
          }

          return (
            <button key={t.slug} type="button" className="tool-card" disabled>
              {body}
            </button>
          );
        })}
      </div>
    </>
  );
}
