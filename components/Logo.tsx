interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Фон */}
      <rect
        width="100"
        height="100"
        rx="20"
        fill="url(#gradient)"
        className="drop-shadow-lg"
      />
      
      {/* Градиент */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      
      {/* Буква T */}
      <text
        x="50"
        y="50"
        fontSize="60"
        fontWeight="900"
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        T
      </text>
      
      {/* Акцент - маленькая точка */}
      <circle cx="75" cy="25" r="8" fill="#10B981" className="animate-pulse" />
    </svg>
  );
}
