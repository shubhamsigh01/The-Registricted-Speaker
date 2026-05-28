interface TapButtonProps {
  label: string;
  color: string;
  onClick: () => void;
  icon: string;
  shortcut?: string;
  btnSize?: string;
  iconSize?: string;
}

export function TapButton({ label, color, onClick, icon, shortcut, btnSize = "76px", iconSize = "26px" }: TapButtonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, userSelect: "none" }}>
      <button
        onClick={onClick}
        className="tap-btn"
        style={{
          position: "relative",
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          background: color,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.1s, box-shadow 0.1s",
        }}
      >
        <span style={{ fontSize: iconSize, color: "white", fontWeight: 900, lineHeight: 1 }}>
          {icon}
        </span>
      </button>
      <span style={{
        color: "white",
        fontSize: "11px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        textAlign: "center",
      }}>
        {label}
      </span>
      {shortcut && (
        <span
          className="shortcut-badge"
          style={{
            color: "#94A3B8",
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {shortcut}
        </span>
      )}
    </div>
  );
}
