import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
import { type MonthlyData } from "~/lib/timeAggUtils";

interface LineChartProps {
  actor: string;
  followerStats: MonthlyData;
  followStats: MonthlyData;
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
}: LineChartProps) {
  // Convert months to array once and cache it
  const monthsArray = Array.from(
    new Set([...Object.keys(followerStats), ...Object.keys(followStats)])
  ).sort();

  // Create chart data with forward fill in a single pass
  const chartData = monthsArray.reduce(
    (acc, month, index) => {
      const dataPoint = {
        month,
        followersChange: followerStats[month]?.change ?? 0,
        followingChange: followStats[month]?.change ?? 0,
        followersCumTotal:
          followerStats[month]?.cumTotal ??
          (index > 0 ? acc[index - 1].followersCumTotal : 0),
        followingCumTotal:
          followStats[month]?.cumTotal ??
          (index > 0 ? acc[index - 1].followingCumTotal : 0),
      };
      acc.push(dataPoint);
      return acc;
    },
    [] as Array<{
      month: string;
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
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
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
                  )} this month`}{" "}
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
