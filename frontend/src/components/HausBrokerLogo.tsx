import React from 'react';

interface HausBrokerLogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'minimal' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const HausBrokerLogo: React.FC<HausBrokerLogoProps> = ({ 
  className = '', 
  showText = true,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: { logo: 'h-8 w-8', text: 'text-lg' },
    md: { logo: 'h-10 w-10', text: 'text-xl' },
    lg: { logo: 'h-12 w-12', text: 'text-2xl' },
    xl: { logo: 'h-16 w-16', text: 'text-3xl' }
  };

  const currentSize = sizeClasses[size];

  const renderLogo = () => {
    switch (variant) {
      case 'minimal':
        return (
          <svg 
            className={`${currentSize.logo} ${className}`}
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Minimal house outline with HB */}
            <path 
              d="M24 4L6 20V42H18V30H30V42H42V20L24 4Z" 
              stroke="#1E40AF" 
              strokeWidth="2"
              fill="none"
            />
            <text 
              x="24" 
              y="26" 
              textAnchor="middle" 
              className="fill-blue-700 font-bold text-[14px]"
            >
              HB
            </text>
          </svg>
        );
      
      case 'outline':
        return (
          <svg 
            className={`${currentSize.logo} ${className}`}
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outline only version */}
            <path 
              d="M24 4L6 20V42H18V30H30V42H42V20L24 4Z" 
              stroke="#1E40AF" 
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
            />
            <path 
              d="M15 21H19V17H15V21ZM20 17V27H24V17H20ZM25 17V27H28.5C30.5 27 32 25.5 32 23.5V20.5C32 18.5 30.5 17 28.5 17H25Z" 
              stroke="#1E40AF" 
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        );
      
      default:
        return (
          <svg 
            className={`${currentSize.logo} ${className}`}
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main house shape */}
            <path 
              d="M24 4L6 20V42H18V30H30V42H42V20L24 4Z" 
              fill="#1E40AF"
            />
            {/* Roof accent */}
            <path 
              d="M24 4L6 20H42L24 4Z" 
              fill="#2563EB"
            />
            {/* HB Letters in white */}
            <g className="fill-white">
              {/* H */}
              <rect x="14" y="16" width="3" height="12" />
              <rect x="14" y="20" width="7" height="3" />
              <rect x="18" y="16" width="3" height="12" />
              {/* B */}
              <rect x="24" y="16" width="3" height="12" />
              <path d="M27 16H31C32.5 16 34 17.5 34 19C34 20.5 32.5 22 31 22H27V16Z" />
              <path d="M27 22H32C33.5 22 35 23.5 35 25C35 26.5 33.5 28 32 28H27V22Z" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center gap-3">
      {renderLogo()}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${currentSize.text} text-gray-900 leading-tight`}>
            Haus Broker
          </span>
          <span className="text-xs text-gray-600">
            Tu hogar ideal en México
          </span>
        </div>
      )}
    </div>
  );
};

export default HausBrokerLogo;