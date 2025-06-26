import React from 'react';

interface MuchaCasaLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'gradient' | 'flat' | 'letter';
}

const MuchaCasaLogoModern: React.FC<MuchaCasaLogoProps> = ({ 
  className = "w-8 h-8", 
  showText = false,
  textClassName = "ml-2 text-xl font-semibold text-gray-900",
  variant = 'gradient'
}) => {
  const renderLogo = () => {
    switch (variant) {
      case 'letter':
        // Modern letter-based logo - stylized M that forms a house
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            {/* Stylized M that looks like a house */}
            <path
              d="M20 80 L20 40 L50 20 L80 40 L80 80 L65 80 L65 50 L50 40 L35 50 L35 80 Z"
              fill="#2563EB"
            />
          </svg>
        );
      
      case 'flat':
        // Ultra minimalist - just geometric shapes
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            {/* Triangle roof */}
            <path
              d="M50 15 L85 50 L15 50 Z"
              fill="#2563EB"
            />
            {/* Square base */}
            <rect
              x="20"
              y="50"
              width="60"
              height="35"
              fill="#3B82F6"
            />
          </svg>
        );
      
      case 'gradient':
        // Modern with gradient
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            <defs>
              <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            
            {/* Modern house shape */}
            <path
              d="M25 85 L25 45 L50 25 L75 45 L75 85 Z"
              fill="url(#houseGradient)"
            />
            {/* Roof line */}
            <path
              d="M15 50 L50 20 L85 50"
              stroke="url(#houseGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center">
      {renderLogo()}
      
      {showText && (
        <div className={textClassName}>
          <span style={{ fontWeight: 700 }}>Mucha</span>
          <span style={{ fontWeight: 300 }}> Casa</span>
        </div>
      )}
    </div>
  );
};

export default MuchaCasaLogoModern;