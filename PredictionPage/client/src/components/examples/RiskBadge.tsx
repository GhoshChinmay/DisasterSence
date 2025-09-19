import RiskBadge from '../RiskBadge';

export default function RiskBadgeExample() {
  return (
    <div className="p-4 space-y-4 bg-card rounded-lg">
      <h3 className="text-lg font-semibold">Risk Level Badges</h3>
      <div className="flex items-center gap-2 flex-wrap">
        <RiskBadge level="Low" />
        <RiskBadge level="Medium" />
        <RiskBadge level="High" />
        <RiskBadge level="Extreme" />
      </div>
    </div>
  );
}