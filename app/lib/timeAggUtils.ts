type MonthStats = {
  change: number;
  cumTotal: number;
};

type MonthlyData = Record<string, MonthStats>;

function groupByYearMonth(items: { createdAt?: string }[]): MonthlyData {
  // First, calculate monthly changes
  const countsByMonth = items.reduce((acc: Record<string, number>, item) => {
    if (!item.createdAt) return acc;

    const date = new Date(item.createdAt);
    const yearMonth = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[yearMonth] = (acc[yearMonth] || 0) + 1;
    return acc;
  }, {});

  // Sort by yearMonth in ascending order for cumulative calculation
  const sortedEntries = Object.entries(countsByMonth).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  let cumulative = 0;
  const result: MonthlyData = {};

  // Create the combined data structure
  sortedEntries.forEach(([yearMonth, change]) => {
    cumulative += change;
    result[yearMonth] = {
      change,
      cumTotal: cumulative,
    };
  });

  // Sort by yearMonth in descending order
  return Object.entries(result)
    .sort(([a], [b]) => b.localeCompare(a))
    .reduce((obj: MonthlyData, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
}

export { groupByYearMonth, type MonthStats, type MonthlyData };
