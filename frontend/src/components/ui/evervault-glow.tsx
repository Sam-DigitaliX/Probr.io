export function EvervaultGlow() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Purple — top left */}
      <div
        className="absolute -top-[10%] -left-[15%] w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        style={{ background: 'hsl(276 51% 47% / 0.18)' }}
      />
      {/* Orange — upper right */}
      <div
        className="absolute top-[25%] -right-[10%] w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        style={{ background: 'hsl(35 97% 63% / 0.16)' }}
      />
      {/* Red — mid left */}
      <div
        className="absolute top-[55%] -left-[18%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full blur-[70px] md:blur-[110px] will-change-transform"
        style={{ background: 'hsl(0 98% 55% / 0.14)' }}
      />
      {/* Purple — lower right */}
      <div
        className="absolute top-[78%] -right-[8%] w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] will-change-transform"
        style={{ background: 'hsl(276 51% 47% / 0.16)' }}
      />
      {/* Orange — bottom left */}
      <div
        className="absolute top-[92%] -left-[12%] w-[280px] h-[280px] md:w-[350px] md:h-[350px] rounded-full blur-[60px] md:blur-[100px] will-change-transform"
        style={{ background: 'hsl(35 97% 63% / 0.12)' }}
      />
    </div>
  );
}
