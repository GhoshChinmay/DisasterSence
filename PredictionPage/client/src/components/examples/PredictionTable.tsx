import PredictionTable from '../PredictionTable';

export default function PredictionTableExample() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">7-Day Prediction Table</h3>
      <PredictionTable location="Maharashtra" />
    </div>
  );
}