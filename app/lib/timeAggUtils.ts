type TimeStats = {
  change: number;
  cumTotal: number;
};

type TimeAggregatedData = Record<string, TimeStats>;

function getWeekNumber(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 / 7
  );
  return String(week + 1).padStart(2, "0");
}

function groupByYearMonth(items: { createdAt?: string }[]): TimeAggregatedData {
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
  const result: TimeAggregatedData = {};

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
    .reduce((obj: TimeAggregatedData, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
}

function groupByYearMonthWeek(
  items: { createdAt?: string }[]
): TimeAggregatedData {
  const countsByWeek = items.reduce((acc: Record<string, number>, item) => {
    if (!item.createdAt) return acc;

    const date = new Date(item.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const week = getWeekNumber(date);
    const yearMonthWeek = `${year}-${month}-W${week}`;

    acc[yearMonthWeek] = (acc[yearMonthWeek] || 0) + 1;
    return acc;
  }, {});

  // Sort by yearMonthWeek in ascending order for cumulative calculation
  const sortedEntries = Object.entries(countsByWeek).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  let cumulative = 0;
  const result: TimeAggregatedData = {};

  // Create the combined data structure
  sortedEntries.forEach(([yearMonthWeek, change]) => {
    cumulative += change;
    result[yearMonthWeek] = {
      change,
      cumTotal: cumulative,
    };
  });

  // Sort by yearMonthWeek in descending order
  return Object.entries(result)
    .sort(([a], [b]) => b.localeCompare(a))
    .reduce((obj: TimeAggregatedData, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
}

function groupByYearMonthDay(
  items: { createdAt?: string }[]
): TimeAggregatedData {
  const countsByDay = items.reduce((acc: Record<string, number>, item) => {
    if (!item.createdAt) return acc;

    const date = new Date(item.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const yearMonthDay = `${year}-${month}-${day}`;

    acc[yearMonthDay] = (acc[yearMonthDay] || 0) + 1;
    return acc;
  }, {});

  // Sort by yearMonthDay in ascending order for cumulative calculation
  const sortedEntries = Object.entries(countsByDay).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  let cumulative = 0;
  const result: TimeAggregatedData = {};

  // Create the combined data structure
  sortedEntries.forEach(([yearMonthDay, change]) => {
    cumulative += change;
    result[yearMonthDay] = {
      change,
      cumTotal: cumulative,
    };
  });

  // Sort by yearMonthDay in descending order
  return Object.entries(result)
    .sort(([a], [b]) => b.localeCompare(a))
    .reduce((obj: TimeAggregatedData, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
}

export {
  groupByYearMonth,
  groupByYearMonthDay,
  groupByYearMonthWeek,
  type TimeAggregatedData,
  type TimeStats,
};
