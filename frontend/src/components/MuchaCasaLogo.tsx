import React from 'react';

interface MuchaCasaLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const MuchaCasaLogo: React.FC<MuchaCasaLogoProps> = ({ 
  className = "w-8 h-8", 
  showText = false,
  textClassName = "ml-2 text-xl font-semibold text-gray-900"
}) => {
  return (
    <div className="flex items-center">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* House base with Mexican architectural style */}
        <path
          d="M50 15 L80 40 L80 75 L20 75 L20 40 Z"
          fill="#2563EB"
          stroke="#2563EB"
          strokeWidth="2"
        />
        
        {/* Roof with traditional Mexican style peak */}
        <path
          d="M50 5 L85 40 L80 40 L50 15 L20 40 L15 40 Z"
          fill="#DC2626"
          stroke="#DC2626"
          strokeWidth="2"
        />
        
        {/* Door */}
        <rect
          x="42"
          y="50"
          width="16"
          height="25"
          fill="#7C3AED"
        />
        
        {/* Windows */}
        <rect
          x="25"
          y="45"
          width="12"
          height="12"
          fill="#FDE047"
        />
        <rect
          x="63"
          y="45"
          width="12"
          height="12"
          fill="#FDE047"
        />
        
        {/* Window cross pattern (traditional Mexican style) */}
        <path
          d="M31 45 L31 57 M25 51 L37 51"
          stroke="#1F2937"
          strokeWidth="1.5"
        />
        <path
          d="M69 45 L69 57 M63 51 L75 51"
          stroke="#1F2937"
          strokeWidth="1.5"
        />
        
        {/* Decorative elements */}
        <circle cx="50" cy="30" r="4" fill="#FDE047" />
        
        {/* Foundation */}
        <rect
          x="18"
          y="75"
          width="64"
          height="5"
          fill="#6B7280"
        />
      </svg>
      
      {showText && (
        <span className={textClassName}>
          Mucha Casa
        </span>
      )}
    </div>
  );
};

export default MuchaCasaLogo;