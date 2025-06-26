import React from 'react';

interface MuchaCasaLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'default' | 'minimal' | 'outline';
}

const MuchaCasaLogoSimple: React.FC<MuchaCasaLogoProps> = ({ 
  className = "w-8 h-8", 
  showText = false,
  textClassName = "ml-2 text-xl font-semibold text-gray-900",
  variant = 'default'
}) => {
  const renderLogo = () => {
    switch (variant) {
      case 'minimal':
        // Ultra simple - just a house outline with MC inside
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            {/* Simple house shape */}
            <path
              d="M15 50 L50 20 L85 50 L85 80 L15 80 Z"
              stroke="#2563EB"
              strokeWidth="4"
              fill="none"
            />
            {/* MC text inside */}
            <text
              x="50"
              y="60"
              textAnchor="middle"
              fill="#2563EB"
              fontSize="24"
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              MC
            </text>
          </svg>
        );
      
      case 'outline':
        // Clean outline version
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            {/* Roof */}
            <path
              d="M10 45 L50 15 L90 45"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Walls */}
            <path
              d="M20 45 L20 80 L80 80 L80 45"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Door */}
            <rect
              x="40"
              y="55"
              width="20"
              height="25"
              stroke="#2563EB"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        );
      
      default:
        // Default - simple filled house
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            {/* House body */}
            <path
              d="M20 45 L20 85 L80 85 L80 45 L50 20 Z"
              fill="#2563EB"
            />
            {/* Roof accent */}
            <path
              d="M10 50 L50 15 L90 50 L80 45 L50 20 L20 45 Z"
              fill="#1D4ED8"
            />
            {/* Door */}
            <rect
              x="40"
              y="55"
              width="20"
              height="30"
              fill="white"
            />
            {/* Window */}
            <rect
              x="25"
              y="50"
              width="10"
              height="10"
              fill="white"
            />
            <rect
              x="65"
              y="50"
              width="10"
              height="10"
              fill="white"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center">
      {renderLogo()}
      
      {showText && (
        <span className={textClassName}>
          Mucha Casa
        </span>
      )}
    </div>
  );
};

export default MuchaCasaLogoSimple;