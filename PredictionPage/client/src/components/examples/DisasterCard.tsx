import DisasterCard from '../DisasterCard';

export default function DisasterCardExample() {
  // Mock data for demonstration
  const mockCards = [
    {
      type: 'cyclone' as const,
      currentRisk: 'High' as const,
      location: 'Odisha Coast',
      probability: 78,
      nextDayRisk: 'Extreme' as const,
      affectedPopulation: 2500000,
      lastUpdated: '2 hours ago'
    },
    {
      type: 'flood' as const,
      currentRisk: 'Medium' as const,
      location: 'Bihar Plains',
      probability: 45,
      nextDayRisk: 'Medium' as const,
      affectedPopulation: 1200000,
      lastUpdated: '1 hour ago'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Disaster Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {mockCards.map((card, index) => (
          <DisasterCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}