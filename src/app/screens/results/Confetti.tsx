export function Confetti() {
  const colors = ["#2563EB", "#7C3AED", "#EF4444", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 2 + Math.random() * 2,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
