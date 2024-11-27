export default function StatsBox({
  title,
  stats,
}: {
  title: string;
  stats: Record<string, { change: number; cumTotal: number }>;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {Object.entries(stats).map(([yearMonth, stats]) => (
          <div
            key={yearMonth}
            className="flex justify-between items-center"
          >
            <span className="text-gray-600">{yearMonth}</span>
            <div className="space-x-4">
              <span className="font-medium">+{stats.change}</span>
              <span className="text-gray-500">Total: {stats.cumTotal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
