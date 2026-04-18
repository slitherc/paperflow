// Small primitives
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Dropzone({ onFiles, accept = ".pdf", multiple = true, title, subtitle }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <div
      className={`dropzone ${dragOver ? "drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: "pointer" }}
    >
      <div className="dropzone-icon">
        <IconUpload size={28} stroke={1.8} />
      </div>
      <h3>{title || "Drop PDF files here"}</h3>
      <p>{subtitle || "or click to browse — up to 50 MB each"}</p>
      <button
        className="btn btn-primary btn-lg"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        <IconPlus size={16} /> Choose files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ProgressRing({ value, label }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="progress-wrap">
      <div className="progress-ring">
        <svg width="120" height="120">
          <circle className="track" cx="60" cy="60" r={r} />
          <circle
            className="fill"
            cx="60"
            cy="60"
            r={r}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="val">{Math.round(value)}%</div>
      </div>
      <div className="progress-label">{label}</div>
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? "active" : ""}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 100, step = 1, label, display }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-block">
      {label && (
        <label>
          <span>{label}</span>
          <span className="v">{display ?? value}</span>
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ "--pct": pct + "%" }}
      />
    </div>
  );
}

function Crumb({ items }) {
  return (
    <div className="crumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.onClick ? (
            <button onClick={it.onClick}>
              {it.icon}
              {it.label}
            </button>
          ) : (
            <span>{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Steps({ current, steps }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="step-sep" />}
          <div className={`step ${i === current ? "active" : ""} ${i < current ? "done" : ""}`}>
            <span className="dot" />
            {s}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

Object.assign(window, {
  Dropzone,
  ProgressRing,
  Segmented,
  Slider,
  Crumb,
  Steps,
  formatBytes,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
});
