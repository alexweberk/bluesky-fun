import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Button } from "~/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { type TimeAggregatedData } from "~/lib/timeAggUtils";

interface LineChartProps {
  actor: string;
  followerStats: TimeAggregatedData;
  followStats: TimeAggregatedData;
  weeklyFollowerStats: TimeAggregatedData;
  weeklyFollowStats: TimeAggregatedData;
}

const chartConfig = {
  followersChange: {
    label: "Monthly Followers",
    color: "hsl(var(--chart-3))",
  },
  followingChange: {
    label: "Monthly Following",
    color: "hsl(var(--chart-4))",
  },
  followersCumTotal: {
    label: "Total Followers",
    color: "hsl(var(--chart-1))",
  },
  followingCumTotal: {
    label: "Total Following",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function LineChartComponent({
  actor,
  followerStats,
  followStats,
  weeklyFollowerStats,
  weeklyFollowStats,
}: LineChartProps) {
  const [viewMode, setViewMode] = useState<"monthly" | "weekly">("monthly");

  const currentFollowerStats =
    viewMode === "monthly" ? followerStats : weeklyFollowerStats;
  const currentFollowStats =
    viewMode === "monthly" ? followStats : weeklyFollowStats;

  const timePeriodsArray = Array.from(
    new Set([
      ...Object.keys(currentFollowerStats),
      ...Object.keys(currentFollowStats),
    ])
  ).sort();

  const chartData = timePeriodsArray.reduce(
    (acc, period, index) => {
      const dataPoint = {
        period,
        followersChange: currentFollowerStats[period]?.change ?? 0,
        followingChange: currentFollowStats[period]?.change ?? 0,
        followersCumTotal:
          currentFollowerStats[period]?.cumTotal ??
          (index > 0 ? acc[index - 1].followersCumTotal : 0),
        followingCumTotal:
          currentFollowStats[period]?.cumTotal ??
          (index > 0 ? acc[index - 1].followingCumTotal : 0),
      };
      acc.push(dataPoint);
      return acc;
    },
    [] as Array<{
      period: string;
      followersChange: number;
      followingChange: number;
      followersCumTotal: number;
      followingCumTotal: number;
    }>
  );

  const currentMonth = chartData[chartData.length - 1]?.followersChange ?? 0;
  const isPositiveTrend = currentMonth > 0;
  const trendText = Math.abs(currentMonth).toString();

  return (
    <Card className="border-2 border-b-8 border-black rounded-none p-4">
      <CardHeader>
        <CardTitle>
          Follows & Followers Growth for{" "}
          <span className="font-bold text-primary">{actor}</span>
        </CardTitle>
        <CardDescription>Monthly Growth Trend</CardDescription>
        <div className="flex gap-2 mt-2">
          <Button
            variant={viewMode === "monthly" ? "default" : "outline"}
            onClick={() => setViewMode("monthly")}
            size="sm"
          >
            Monthly
          </Button>
          <Button
            variant={viewMode === "weekly" ? "default" : "outline"}
            onClick={() => setViewMode("weekly")}
            size="sm"
          >
            Weekly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 6,
              right: 6,
              top: 6,
              bottom: 6,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="p-2" />}
            />
            {/* <Line
              dataKey="followersChange"
              type="monotone"
              stroke={chartConfig.followersChange.color}
              strokeWidth={2}
              dot={true}
              strokeDasharray="5 5"
            />
            <Line
              dataKey="followingChange"
              type="monotone"
              stroke={chartConfig.followingChange.color}
              strokeWidth={2}
              dot={true}
              strokeDasharray="5 5"
            /> */}
            <Line
              dataKey="followersCumTotal"
              type="monotone"
              stroke={chartConfig.followersCumTotal.color}
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="followingCumTotal"
              type="monotone"
              stroke={chartConfig.followingCumTotal.color}
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {currentMonth === 0
                ? "No change"
                : `Followers ${isPositiveTrend ? "up" : "down"} by ${Number(
                    trendText
                  )} ${viewMode === "monthly" ? "month" : "week"}`}{" "}
              <TrendingUp
                className={`h-4 w-4 ${
                  currentMonth === 0
                    ? "text-gray-500"
                    : isPositiveTrend
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing monthly cumulative totals over time
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
