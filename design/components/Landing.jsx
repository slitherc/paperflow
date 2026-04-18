const TOOLS = [
  {
    id: "merge",
    name: "Merge PDFs",
    desc: "Combine multiple PDFs into a single file. Drag to reorder.",
    icon: IconMerge,
    meta: "Popular",
    active: true,
  },
  {
    id: "compress",
    name: "Compress PDF",
    desc: "Reduce file size while keeping quality. Great for email.",
    icon: IconCompress,
    meta: "Popular",
    active: true,
  },
  {
    id: "split",
    name: "Split PDF",
    desc: "Extract pages or split a PDF into multiple documents.",
    icon: IconSplit,
    meta: "Soon",
  },
  {
    id: "reorder",
    name: "Reorder Pages",
    desc: "Rearrange pages by dragging thumbnails into the right order.",
    icon: IconReorder,
    meta: "Soon",
  },
  {
    id: "rotate",
    name: "Rotate Pages",
    desc: "Fix orientation for single pages or the whole document.",
    icon: IconRotate,
    meta: "Soon",
  },
  {
    id: "delete",
    name: "Delete Pages",
    desc: "Remove unwanted pages from your PDF with one click.",
    icon: IconTrash,
    meta: "Soon",
  },
];

function Landing({ onPick }) {
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
          watermarks, no uploads to a server you don't control.
        </p>
        <div className="trust-row">
          <span>
            <IconLock size={14} /> Client-side
          </span>
          <span>
            <IconZap size={14} /> Instant
          </span>
          <span>
            <IconShield size={14} /> No tracking
          </span>
          <span>
            <IconSparkles size={14} /> Free
          </span>
        </div>
      </section>

      <div className="section-head">
        <h2>Tools</h2>
        <span className="muted">Pick one to get started</span>
      </div>

      <div className="tool-grid">
        {TOOLS.map((t) => {
          const Ic = t.icon;
          return (
            <button
              key={t.id}
              className="glass tool-card"
              onClick={() => t.active && onPick(t.id)}
              style={{ opacity: t.active ? 1 : 0.65, cursor: t.active ? "pointer" : "not-allowed" }}
            >
              <div className="tool-icon">
                <Ic size={22} stroke={1.8} />
              </div>
              <div>
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
              </div>
              <div className="tool-meta">
                <span>{t.meta}</span>
                {t.active && (
                  <span className="tool-arrow">
                    <IconArrowRight size={14} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

window.Landing = Landing;
