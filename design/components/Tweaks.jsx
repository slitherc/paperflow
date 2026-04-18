function TweaksPanel({ tweaks, setTweaks, onClose }) {
  const accents = [
    { h: 250, name: "Indigo" },
    { h: 210, name: "Blue" },
    { h: 190, name: "Teal" },
    { h: 290, name: "Violet" },
    { h: 320, name: "Pink" },
    { h: 155, name: "Green" },
  ];
  const update = (patch) => setTweaks({ ...tweaks, ...patch });

  return (
    <div className="glass tweaks-panel">
      <h3>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <IconSliders size={15} /> Tweaks
        </span>
        <button className="close" onClick={onClose}>
          <IconX size={14} />
        </button>
      </h3>

      <div className="slider-block">
        <label>
          <span>Theme</span>
        </label>
        <Segmented
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          value={tweaks.theme}
          onChange={(v) => update({ theme: v })}
        />
      </div>

      <div className="slider-block">
        <label>
          <span>Accent</span>
          <span className="v" style={{ textTransform: "lowercase" }}>
            {accents.find((a) => a.h === tweaks.accentH)?.name.toLowerCase() || "custom"}
          </span>
        </label>
        <div className="swatch-row">
          {accents.map((a) => (
            <button
              key={a.h}
              className={`swatch ${tweaks.accentH === a.h ? "active" : ""}`}
              style={{ background: `oklch(0.62 0.18 ${a.h})` }}
              onClick={() => update({ accentH: a.h })}
              title={a.name}
            />
          ))}
        </div>
      </div>

      <Slider
        label="Glass blur"
        value={tweaks.blur}
        onChange={(v) => update({ blur: v })}
        min={4}
        max={40}
        step={1}
        display={tweaks.blur + "px"}
      />

      <Slider
        label="Card density"
        value={tweaks.pad}
        onChange={(v) => update({ pad: v })}
        min={70}
        max={130}
        step={5}
        display={tweaks.pad + "%"}
      />

      <div
        style={{
          fontSize: 11,
          color: "var(--fg-subtle)",
          marginTop: 8,
          fontFamily: "Geist Mono, monospace",
          textAlign: "center",
        }}
      >
        Settings saved automatically
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
