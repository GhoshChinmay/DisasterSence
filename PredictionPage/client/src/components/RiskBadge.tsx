import { Badge } from '@/components/ui/badge';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export default function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const levelConfig = {
    Low: {
      color: 'bg-green-500 text-white',
      emoji: '🟢'
    },
    Medium: {
      color: 'bg-yellow-500 text-black',
      emoji: '🟡'
    },
    High: {
      color: 'bg-red-500 text-white', 
      emoji: '🔴'
    },
    Extreme: {
      color: 'bg-red-700 text-white',
      emoji: '🔥'
    }
  };

  const config = levelConfig[level];

  return (
    <Badge 
      className={`${config.color} ${className} font-medium px-2 py-1 text-xs hover-elevate`}
      data-testid={`badge-risk-${level.toLowerCase()}`}
    >
      <span className="mr-1" role="img" aria-hidden="true">{config.emoji}</span>
      {level}
    </Badge>
  );
}