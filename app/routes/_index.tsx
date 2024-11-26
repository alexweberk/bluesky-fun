import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { Loader2Icon } from "lucide-react";
import Header from "~/components/Header";
import { LineChartComponent } from "~/components/LineChart";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getAgent } from "~/lib/client";
import { getFollowers, getFollows } from "~/lib/follows";
import { groupByYearMonth, MonthlyData } from "~/lib/timeAggUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Bluesky Stats" },
    {
      name: "description",
      content:
        "Welcome to Bluesky Stats where you can get follower and following stats for any Bluesky actor.",
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;

  const actor = "alexweberk.bsky.social";

  // Get follows and followers
  try {
    const agent = await getAgent(env);
    const { follows } = await getFollows(agent, actor);
    const { followers } = await getFollowers(agent, actor);

    // Get monthly stats with changes and cumulative totals
    const followerStats = groupByYearMonth(followers);
    const followStats = groupByYearMonth(follows);

    // const followStats = {
    //   "2024-11": { change: 5, cumTotal: 14 },
    //   "2024-10": { change: 1, cumTotal: 9 },
    //   "2024-02": { change: 1, cumTotal: 8 },
    //   "2024-01": { change: 1, cumTotal: 7 },
    //   "2023-07": { change: 1, cumTotal: 6 },
    //   "2023-04": { change: 4, cumTotal: 5 },
    //   "2023-03": { change: 1, cumTotal: 1 },
    // };
    // const followerStats = {
    //   "2024-11": { change: 1, cumTotal: 4 },
    //   "2024-02": { change: 1, cumTotal: 3 },
    //   "2023-08": { change: 1, cumTotal: 2 },
    //   "2023-04": { change: 1, cumTotal: 1 },
    // };

    return {
      actor,
      followerStats,
      followStats,
    };
  } catch (error) {
    console.error(error);
    return {
      error: { message: `Failed to fetch data for actor: ${actor}` },
    };
  }
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;
  const formData = await request.formData();
  let actor = formData.get("actor") as string;

  if (!actor) {
    return json({ error: { message: "Actor is required" } }, { status: 400 });
  }

  try {
    if (actor.startsWith("@")) {
      actor = actor.slice(1);
    }
    const agent = await getAgent(env);
    const { followers } = await getFollowers(agent, actor);
    const { follows } = await getFollows(agent, actor);

    const followerStats = groupByYearMonth(followers);
    const followStats = groupByYearMonth(follows);

    // const followStats = {
    //   "2024-11": { change: 5, cumTotal: 14 },
    //   "2024-10": { change: 1, cumTotal: 9 },
    //   "2024-02": { change: 1, cumTotal: 8 },
    //   "2024-01": { change: 1, cumTotal: 7 },
    //   "2023-07": { change: 1, cumTotal: 6 },
    //   "2023-04": { change: 4, cumTotal: 5 },
    //   "2023-03": { change: 1, cumTotal: 1 },
    // };
    // const followerStats = {
    //   "2024-11": { change: 1, cumTotal: 4 },
    //   "2024-02": { change: 1, cumTotal: 3 },
    //   "2023-08": { change: 1, cumTotal: 2 },
    //   "2023-04": { change: 1, cumTotal: 1 },
    // };
    return {
      actor,
      followerStats,
      followStats,
    };
  } catch (error) {
    console.error(error);
    return {
      error: { message: `Failed to fetch data for actor: ${actor}` },
    };
  }
};

export default function Index() {
  const { actor, followerStats, followStats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{
    actor: string;
    followerStats: MonthlyData;
    followStats: MonthlyData;
    error?: { message: string };
  }>();

  const currentActor = fetcher.data?.actor || actor || "";
  const currentFollowerStats = fetcher.data?.followerStats || followerStats;
  const currentFollowStats = fetcher.data?.followStats || followStats;
  const error = fetcher.data?.error || null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Bluesky Stats
          </h1>
          <div className="bg-white rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Follower and Following Stats
            </h2>
            <div>
              <fetcher.Form method="post">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 ">
                      @
                    </span>
                    <Input
                      type="text"
                      name="actor"
                      className="border-primary border-2 transition-all hover:bg-white pl-8"
                      placeholder={currentActor}
                      defaultValue={currentActor}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex items-center border-primary border-2 border-b-4 active:border-b-2 transition-all hover:bg-white"
                    disabled={fetcher.state === "submitting"}
                  >
                    {fetcher.state === "submitting" ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </fetcher.Form>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <p className="text-red-500">{error.message}</p>
              </div>
            )}
            {currentFollowerStats && currentFollowStats && (
              <LineChartComponent
                actor={currentActor}
                followerStats={currentFollowerStats}
                followStats={currentFollowStats}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6 card">
              <h3 className="text-lg font-semibold mb-4">Followers by Month</h3>
              <div className="space-y-2">
                {currentFollowerStats &&
                  Object.entries(currentFollowerStats).map(
                    ([yearMonth, stats]) => (
                      <div
                        key={yearMonth}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{yearMonth}</span>
                        <div className="space-x-4">
                          <span className="font-medium">+{stats.change}</span>
                          <span className="text-gray-500">
                            Total: {stats.cumTotal}
                          </span>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 card">
              <h3 className="text-lg font-semibold mb-4">Following by Month</h3>
              <div className="space-y-2">
                {currentFollowStats &&
                  Object.entries(currentFollowStats).map(
                    ([yearMonth, stats]) => (
                      <div
                        key={yearMonth}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{yearMonth}</span>
                        <div className="space-x-4">
                          <span className="font-medium">+{stats.change}</span>
                          <span className="text-gray-500">
                            Total: {stats.cumTotal}
                          </span>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
