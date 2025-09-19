interface DisasterIconProps {
  type: 'cyclone' | 'flood' | 'earthquake' | 'landslide';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DisasterIcon({ type, size = 'md', className = '' }: DisasterIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const iconMap = {
    cyclone: '🌀',
    flood: '🌊', 
    earthquake: '🗻',
    landslide: '⛰️'
  };

  return (
    <span 
      className={`${sizeClasses[size]} ${className} flex items-center justify-center text-center`}
      role="img"
      aria-label={`${type} icon`}
      data-testid={`icon-${type}`}
    >
      {iconMap[type]}
    </span>
  );
}