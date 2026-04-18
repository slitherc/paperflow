const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  theme: "light",
  accentH: 250,
  blur: 20,
  pad: 100,
}; /*EDITMODE-END*/

function App() {
  const [view, setView] = useState(() => localStorage.getItem("pf:view") || "landing");
  const [tweaks, setTweaks] = useState(() => {
    try {
      return { ...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem("pf:tweaks") || "{}") };
    } catch {
      return TWEAK_DEFAULTS;
    }
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Persist
  useEffect(() => {
    localStorage.setItem("pf:view", view);
  }, [view]);
  useEffect(() => {
    localStorage.setItem("pf:tweaks", JSON.stringify(tweaks));
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.style.setProperty("--accent-h", tweaks.accentH);
    document.documentElement.style.setProperty("--blur", tweaks.blur + "px");
    document.documentElement.style.setProperty("--pad", (tweaks.pad / 100).toString());
  }, [tweaks]);

  // Tweaks host protocol
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setEditMode(true);
      if (e.data.type === "__deactivate_edit_mode") {
        setEditMode(false);
        setTweaksOpen(false);
      }
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  // Sync tweaks to host (for persistence to disk)
  useEffect(() => {
    if (editMode) {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: tweaks }, "*");
    }
  }, [tweaks, editMode]);

  const toggleTheme = () =>
    setTweaks({ ...tweaks, theme: tweaks.theme === "light" ? "dark" : "light" });

  return (
    <>
      <div className="aurora">
        <div className="blob b3" />
        <div className="blob b4" />
      </div>
      <div className="noise" />

      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <button
              className="logo"
              onClick={() => setView("landing")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <span className="logo-mark">
                <IconFile size={14} stroke={2.2} />
              </span>
              Paperflow
            </button>
            <nav className="nav-links">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setView("landing");
                }}
              >
                Tools
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Pricing
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Docs
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                GitHub
              </a>
            </nav>
            <div className="topbar-actions">
              <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
                {tweaks.theme === "light" ? <IconMoon size={16} /> : <IconSun size={16} />}
              </button>
              <button className="btn">Sign in</button>
              <button className="btn btn-primary">Get Pro</button>
            </div>
          </div>
        </header>

        <main className="main">
          {view === "landing" && <Landing onPick={setView} />}
          {view === "merge" && <MergeFlow onBack={() => setView("landing")} />}
          {view === "compress" && <CompressFlow onBack={() => setView("landing")} />}
        </main>
      </div>

      {editMode &&
        (tweaksOpen ? (
          <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setTweaksOpen(false)} />
        ) : (
          <button className="tweaks-fab" onClick={() => setTweaksOpen(true)} title="Open tweaks">
            <IconSliders size={18} />
          </button>
        ))}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
