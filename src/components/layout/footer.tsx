import Link from "next/link";

export function Footer() {
  return (
    <footer className="pf-footer">
      <div className="pf-footer-inner">
        <span>
          Made with <Link href="https://nextjs.org">Next.js</Link> · Files never leave your browser
        </span>
        <span style={{ display: "flex", gap: 16 }}>
          <Link href="https://github.com" target="_blank" rel="noreferrer noopener">
            GitHub
          </Link>
          <Link href="/#privacy">Privacy</Link>
          <Link href="/#docs">Docs</Link>
        </span>
      </div>
    </footer>
  );
}
