import DisasterIcon from '../DisasterIcon';

export default function DisasterIconExample() {
  return (
    <div className="p-4 space-y-4 bg-card rounded-lg">
      <h3 className="text-lg font-semibold">Disaster Icons</h3>
      <div className="flex items-center gap-4">
        <DisasterIcon type="cyclone" size="lg" />
        <DisasterIcon type="flood" size="lg" />
        <DisasterIcon type="earthquake" size="lg" />
        <DisasterIcon type="landslide" size="lg" />
      </div>
    </div>
  );
}