// Compress flow: upload -> settings -> process -> result
function CompressFlow({ onBack }) {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState("balanced"); // strong | balanced | light
  const [imageQuality, setImageQuality] = useState(72);

  const addFile = (files) => {
    const f = files[0];
    setFile({
      name: f.name,
      size: f.size || Math.floor(2_000_000 + Math.random() * 8_000_000),
      pages: Math.floor(5 + Math.random() * 40),
    });
    setStage("settings");
  };

  const ratios = { strong: 0.25, balanced: 0.45, light: 0.7 };
  const estSize = file ? Math.floor(file.size * ratios[level]) : 0;
  const savings = file ? Math.round((1 - ratios[level]) * 100) : 0;

  const start = () => {
    setStage("processing");
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => setStage("done"), 300);
          return 100;
        }
        return p + (1.5 + Math.random() * 3);
      });
    }, 100);
  };

  return (
    <>
      <Crumb
        items={[
          { label: "Tools", onClick: onBack, icon: <IconArrowLeft size={14} /> },
          { label: "Compress PDF" },
        ]}
      />

      <div className="flow-header">
        <h2>Compress PDF</h2>
        {file && <span className="count">{file.pages} pages</span>}
      </div>

      <Steps
        current={stage === "upload" ? 0 : stage === "settings" ? 1 : stage === "processing" ? 2 : 3}
        steps={["Upload", "Settings", "Compress", "Download"]}
      />

      {stage === "upload" && (
        <Dropzone
          onFiles={addFile}
          multiple={false}
          title="Drop a PDF to compress"
          subtitle="We'll rebuild images and strip hidden metadata to shrink it"
        />
      )}

      {stage === "settings" && file && (
        <div className="flow">
          <div className="glass flow-main">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Compression level</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  v: "strong",
                  title: "Strong",
                  desc: "Smallest file size. Best for email and web.",
                  ratio: "~75% smaller",
                },
                {
                  v: "balanced",
                  title: "Balanced",
                  desc: "Good quality with solid savings. Recommended.",
                  ratio: "~55% smaller",
                },
                {
                  v: "light",
                  title: "Light",
                  desc: "Preserves image sharpness. Best for printing.",
                  ratio: "~30% smaller",
                },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className="file-row"
                  style={{
                    cursor: "pointer",
                    borderColor: level === opt.v ? "var(--accent)" : "var(--border)",
                    boxShadow: level === opt.v ? "0 0 0 2px var(--accent-ring)" : "none",
                    background: level === opt.v ? "var(--accent-soft)" : "var(--surface-hover)",
                  }}
                >
                  <input
                    type="radio"
                    name="level"
                    checked={level === opt.v}
                    onChange={() => setLevel(opt.v)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <div className="file-info">
                    <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {opt.title}
                      <span
                        style={{
                          fontFamily: "Geist Mono, monospace",
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 5,
                          background: "var(--surface)",
                          color: "var(--accent)",
                          fontWeight: 500,
                        }}
                      >
                        {opt.ratio}
                      </span>
                    </h4>
                    <div
                      className="meta"
                      style={{ fontFamily: "inherit", color: "var(--fg-muted)" }}
                    >
                      {opt.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Advanced</h3>
              <Slider
                label="Image quality"
                value={imageQuality}
                onChange={setImageQuality}
                min={20}
                max={100}
                display={imageQuality + "%"}
              />
              <div className="slider-block">
                <label>
                  <span>Strip metadata & hidden layers</span>
                </label>
                <Segmented
                  options={[
                    { value: "yes", label: "On" },
                    { value: "no", label: "Off" },
                  ]}
                  value="yes"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>

          <div className="glass flow-side">
            <div className="side-title">Source</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">File</span>
                <span
                  className="value"
                  style={{
                    fontSize: 12,
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </span>
              </div>
              <div className="side-row">
                <span className="label">Pages</span>
                <span className="value">{file.pages}</span>
              </div>
              <div className="side-row">
                <span className="label">Original</span>
                <span className="value">{formatBytes(file.size)}</span>
              </div>
            </div>

            <div className="side-title">Estimate</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">Output</span>
                <span className="value accent">{formatBytes(estSize)}</span>
              </div>
              <div className="side-row">
                <span className="label">Savings</span>
                <span className="value accent">−{savings}%</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              onClick={start}
            >
              <IconZap size={14} /> Compress now
            </button>
          </div>
        </div>
      )}

      {stage === "processing" && (
        <div className="glass" style={{ marginTop: 24 }}>
          <ProgressRing value={progress} label={`Compressing ${file.name}…`} />
          <div style={{ padding: "0 32px 32px" }}>
            <div className="progress-bar">
              <div className="fill" style={{ width: progress + "%" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                fontSize: 12,
                color: "var(--fg-subtle)",
                fontFamily: "Geist Mono, monospace",
              }}
            >
              <span>
                {progress < 30
                  ? "Parsing pages…"
                  : progress < 65
                    ? "Rebuilding images…"
                    : progress < 90
                      ? "Stripping metadata…"
                      : "Finalizing…"}
              </span>
              <span>{file.pages} pages</span>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="glass result-card" style={{ marginTop: 24 }}>
          <div className="result-icon">
            <IconCheck size={32} stroke={2.4} />
          </div>
          <h3>Compression complete</h3>
          <p>Your PDF is {savings}% smaller and ready to download.</p>
          <div className="result-stats">
            <div className="stat-chip">
              <div className="l">Before</div>
              <div className="v">{formatBytes(file.size)}</div>
            </div>
            <div className="stat-chip">
              <div className="l">After</div>
              <div className="v">{formatBytes(estSize)}</div>
            </div>
            <div className="stat-chip">
              <div className="l">Saved</div>
              <div className="v savings">−{savings}%</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg">
              <IconDownload size={16} /> Download PDF
            </button>
            <button
              className="btn btn-lg"
              onClick={() => {
                setFile(null);
                setStage("upload");
                setProgress(0);
              }}
            >
              Compress another
            </button>
          </div>
        </div>
      )}
    </>
  );
}

window.CompressFlow = CompressFlow;
