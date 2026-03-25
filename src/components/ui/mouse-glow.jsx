import React, { useState } from "react";

/**
 * Área com efeito de "luz" que segue o mouse ao passar por cima.
 * @param {React.ReactNode} children - Conteúdo dentro da área
 * @param {number} [size=500] - Tamanho do círculo de luz (px)
 * @param {string} [className=''] - Classes do container (ex: fundo, borda)
 * @param {string} [gradientClass] - Cores do gradiente Tailwind (ex: from-primary/20 via-blue-500/20 to-purple-500/20)
 */
export function MouseGlow({ children, size = 500, className = "", gradientClass }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const half = size / 2;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const gradient =
    gradientClass ?? "from-primary/20 via-blue-500/20 to-purple-500/20";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Luz que segue o mouse */}
      <div
        className={`absolute pointer-events-none rounded-full blur-3xl transition-opacity duration-200 bg-gradient-to-r ${gradient} ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: size,
          height: size,
          left: mousePosition.x - half,
          top: mousePosition.y - half,
        }}
      />
      {/* Conteúdo em cima da luz */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
