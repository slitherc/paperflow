// Merge flow: upload -> reorder -> process -> result
function MergeFlow({ onBack }) {
  const [files, setFiles] = useState([]);
  const [stage, setStage] = useState("upload"); // upload | arrange | processing | done
  const [progress, setProgress] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const addFiles = (newFiles) => {
    const mapped = newFiles.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size || Math.floor(50000 + Math.random() * 2000000),
      pages: Math.floor(3 + Math.random() * 20),
    }));
    setFiles((prev) => [...prev, ...mapped]);
    setStage("arrange");
  };

  const remove = (id) => setFiles(files.filter((f) => f.id !== id));

  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== i) setOverIdx(i);
  };
  const handleDrop = (i) => {
    if (dragIdx === null || dragIdx === i) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const next = [...files];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    setFiles(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  const startMerge = () => {
    setStage("processing");
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => setStage("done"), 300);
          return 100;
        }
        return p + (2 + Math.random() * 4);
      });
    }, 80);
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const totalPages = files.reduce((s, f) => s + f.pages, 0);

  return (
    <>
      <Crumb
        items={[
          { label: "Tools", onClick: onBack, icon: <IconArrowLeft size={14} /> },
          { label: "Merge PDFs" },
        ]}
      />

      <div className="flow-header">
        <h2>Merge PDFs</h2>
        {files.length > 0 && (
          <span className="count">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Steps
        current={stage === "upload" ? 0 : stage === "arrange" ? 1 : stage === "processing" ? 2 : 3}
        steps={["Upload", "Arrange", "Merge", "Download"]}
      />

      {stage === "upload" && (
        <Dropzone
          onFiles={addFiles}
          title="Drop PDFs to merge"
          subtitle="Add two or more PDF files — they'll be combined in the order you arrange"
        />
      )}

      {stage === "arrange" && (
        <div className="flow">
          <div className="glass flow-main">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Arrange files</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg-muted)" }}>
                  Drag the handle to reorder. Top of the list becomes the first page.
                </p>
              </div>
              <button
                className="btn"
                onClick={() => document.getElementById("merge-add-more").click()}
              >
                <IconPlus size={14} /> Add more
              </button>
              <input
                id="merge-add-more"
                type="file"
                multiple
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const fs = Array.from(e.target.files);
                  if (fs.length) addFiles(fs);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="file-list">
              {files.map((f, i) => (
                <div
                  key={f.id}
                  className={`file-row ${dragIdx === i ? "dragging" : ""} ${overIdx === i && dragIdx !== i ? "drag-target" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={() => {
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                  onDrop={() => handleDrop(i)}
                >
                  <span className="grip">
                    <IconGrip size={14} />
                  </span>
                  <span className="order-badge">{i + 1}</span>
                  <span className="file-icon">
                    <IconFile size={18} stroke={1.8} />
                  </span>
                  <div className="file-info">
                    <h4>{f.name}</h4>
                    <div className="meta">
                      {f.pages} pages · {formatBytes(f.size)}
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => remove(f.id)}>
                    <IconX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass flow-side">
            <div className="side-title">Summary</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">Files</span>
                <span className="value">{files.length}</span>
              </div>
              <div className="side-row">
                <span className="label">Total pages</span>
                <span className="value">{totalPages}</span>
              </div>
              <div className="side-row">
                <span className="label">Total size</span>
                <span className="value">{formatBytes(totalSize)}</span>
              </div>
            </div>

            <div className="side-title">Options</div>
            <div className="slider-block">
              <label>
                <span>Add bookmarks for each file</span>
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

            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              disabled={files.length < 2}
              onClick={startMerge}
            >
              Merge {files.length} files <IconArrowRight size={14} />
            </button>
            {files.length < 2 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--fg-subtle)",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Add at least 2 files to merge
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "processing" && (
        <div className="glass" style={{ marginTop: 24 }}>
          <ProgressRing value={progress} label={`Merging ${files.length} files…`} />
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
              <span>Processing in browser</span>
              <span>{totalPages} pages</span>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="glass result-card" style={{ marginTop: 24 }}>
          <div className="result-icon">
            <IconCheck size={32} stroke={2.4} />
          </div>
          <h3>Ready to download</h3>
          <p>Merged {files.length} files into a single PDF.</p>
          <div className="result-stats">
            <div className="stat-chip">
              <div className="l">Pages</div>
              <div className="v">{totalPages}</div>
            </div>
            <div className="stat-chip">
              <div className="l">Size</div>
              <div className="v">{formatBytes(totalSize)}</div>
            </div>
            <div className="stat-chip">
              <div className="l">Output</div>
              <div className="v">merged.pdf</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg">
              <IconDownload size={16} /> Download PDF
            </button>
            <button
              className="btn btn-lg"
              onClick={() => {
                setFiles([]);
                setStage("upload");
                setProgress(0);
              }}
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </>
  );
}

window.MergeFlow = MergeFlow;
