export function EvervaultGlow() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Violet — top left */}
      <div
        className="absolute -top-[10%] -left-[15%] w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        style={{ background: 'hsl(262 83% 70% / 0.25)' }}
      />
      {/* Cyan — upper right */}
      <div
        className="absolute top-[25%] -right-[10%] w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        style={{ background: 'hsl(188 94% 55% / 0.22)' }}
      />
      {/* Violet — mid left */}
      <div
        className="absolute top-[55%] -left-[18%] w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[70px] md:blur-[110px] will-change-transform"
        style={{ background: 'hsl(262 83% 70% / 0.20)' }}
      />
      {/* Cyan — lower right */}
      <div
        className="absolute top-[78%] -right-[8%] w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        style={{ background: 'hsl(188 94% 55% / 0.22)' }}
      />
      {/* Violet — bottom left */}
      <div
        className="absolute top-[92%] -left-[12%] w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full blur-[60px] md:blur-[100px] will-change-transform"
        style={{ background: 'hsl(262 83% 70% / 0.16)' }}
      />
    </div>
  );
}
