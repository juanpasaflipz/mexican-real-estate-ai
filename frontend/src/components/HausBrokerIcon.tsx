import React from 'react';

interface HausBrokerIconProps {
  className?: string;
  size?: number;
  color?: string;
}

const HausBrokerIcon: React.FC<HausBrokerIconProps> = ({ 
  className = '', 
  size = 32,
  color = '#1E40AF'
}) => {
  return (
    <svg 
      className={className}
      width={size} 
      height={size}
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main house shape */}
      <path 
        d="M24 4L6 20V42H18V30H30V42H42V20L24 4Z" 
        fill={color}
      />
      {/* Roof accent */}
      <path 
        d="M24 4L6 20H42L24 4Z" 
        fill={color}
        opacity="0.9"
      />
      {/* HB Letters in white */}
      <g className="fill-white">
        {/* H */}
        <rect x="14" y="16" width="3" height="12" fill="white" />
        <rect x="14" y="20" width="7" height="3" fill="white" />
        <rect x="18" y="16" width="3" height="12" fill="white" />
        {/* B */}
        <rect x="24" y="16" width="3" height="12" fill="white" />
        <path d="M27 16H31C32.5 16 34 17.5 34 19C34 20.5 32.5 22 31 22H27V16Z" fill="white" />
        <path d="M27 22H32C33.5 22 35 23.5 35 25C35 26.5 33.5 28 32 28H27V22Z" fill="white" />
      </g>
    </svg>
  );
};

export default HausBrokerIcon;