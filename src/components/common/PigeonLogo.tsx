interface PigeonLogoProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function PigeonLogo({ size = 36, color = '#1565c0', style }: PigeonLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={style}
    >
      {/* Body */}
      <ellipse cx="32" cy="38" rx="18" ry="14" fill={color} opacity="0.85" />
      {/* Head */}
      <circle cx="44" cy="22" r="9" fill={color} />
      {/* Eye */}
      <circle cx="47" cy="20" r="2.5" fill="#fff" />
      <circle cx="47.8" cy="19.5" r="1.2" fill="#333" />
      {/* Beak */}
      <polygon points="53,22 60,24 53,26" fill="#e8a838" />
      {/* Wing */}
      <ellipse cx="28" cy="34" rx="14" ry="9" fill={color} opacity="0.65" transform="rotate(-15 28 34)" />
      <path d="M18 30 Q10 26 6 18 Q14 22 22 26Z" fill={color} opacity="0.45" />
      {/* Tail feathers */}
      <path d="M14 42 Q6 48 2 56 Q10 50 16 46Z" fill={color} opacity="0.55" />
      <path d="M16 44 Q10 52 8 60 Q14 52 18 48Z" fill={color} opacity="0.45" />
      {/* Feet */}
      <line x1="28" y1="52" x2="26" y2="60" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="52" x2="38" y2="60" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="60" x2="28" y2="60" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="60" x2="40" y2="60" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
