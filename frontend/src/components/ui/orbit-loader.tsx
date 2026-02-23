export function OrbitLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      role="status"
      aria-label="Chargement"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'hsl(262 83% 75% / 0.08)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[30%] w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'hsl(188 94% 65% / 0.06)' }}
        />
      </div>

      {/* 4 orbit rings — concentric, sizes: 100%, 78%, 56%, 34% */}
      <div className="orbit-loader relative w-28 h-28">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="orbit-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${100 - i * 22}%`, height: `${100 - i * 22}%` }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-primary to-secondary" />
      </div>
    </div>
  );
}
