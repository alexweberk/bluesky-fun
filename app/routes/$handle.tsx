import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { ChartColumnIncreasing, Loader2, Share } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { LineChartComponent } from "~/components/LineChart";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { getAgent } from "~/lib/client";
import { getFollowers, getFollows } from "~/lib/follows";
import { groupByYearMonth, type MonthlyData } from "~/lib/timeAggUtils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.actor || "User"} - Bluesky Stats` },
    {
      name: "description",
      content: `Follower and following stats for ${
        data?.actor || "user"
      } on Bluesky.`,
    },
  ];
};

interface LoaderData {
  actor: string;
  error: string | null;
  followerStats: MonthlyData;
  followStats: MonthlyData;
  cached?: boolean;
}

interface CacheData {
  followerStats: MonthlyData;
  followStats: MonthlyData;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60; // 1 hour in seconds

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const actor = params.handle;

  if (!actor) {
    throw new Response("Not Found", { status: 404 });
  }
  // check if period is in the actor, if not it is invalid
  if (!actor.includes(".") || actor.length < 6) {
    return {
      actor,
      error: "Invalid handle. Maybe you're missing the `.bsky.social` part?",
      followerStats: {},
      followStats: {},
      cached: false,
    };
  }

  // Try to get data from cache first
  try {
    const cacheKey = `stats-${actor}`;
    const cached = await env.BLUESKY_STATS_KV.get(cacheKey, "json");

    if (cached) {
      const data = cached as CacheData;
      const age = Date.now() / 1000 - data.timestamp;

      // If cache is still fresh, return it
      if (age < CACHE_DURATION) {
        return {
          actor,
          followerStats: data.followerStats,
          followStats: data.followStats,
          error: null,
          cached: true,
        } satisfies LoaderData;
      }
    }
  } catch (error) {
    console.error("Cache error:", error);
    // Continue if cache fails - we'll try the API
  }

  // If no cache or cache is stale, fetch from API
  try {
    const agent = await getAgent(env);
    const { follows } = await getFollows(agent, actor);
    const { followers } = await getFollowers(agent, actor);

    const followerStats = groupByYearMonth(followers);
    const followStats = groupByYearMonth(follows);

    // Cache the new data
    try {
      const cacheKey = `stats-${actor}`;
      const cacheData: CacheData = {
        followerStats,
        followStats,
        timestamp: Date.now() / 1000,
      };
      await env.BLUESKY_STATS_KV.put(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Cache write error:", error);
      // Continue even if cache write fails
    }

    return {
      actor,
      followerStats,
      followStats,
      error: null,
      cached: false,
    } satisfies LoaderData;
  } catch (error) {
    console.error(error);
    // Return empty data structures instead of null
    // Let the user know if the error was a Rate Limit
    let rateLimitErrorMsg = "";
    if (error instanceof Error && "status" in error && error.status === 429) {
      rateLimitErrorMsg =
        "We've hit a rate limit on the API. Please try again later.";
    }
    return {
      actor,
      error:
        rateLimitErrorMsg ||
        "This handle doesn't seem to exist. Maybe you're missing the `.bsky.social` part?",
      followerStats: {},
      followStats: {},
      cached: false,
    } satisfies LoaderData;
  }
};

export default function UserStats() {
  const { actor, followerStats, followStats, error, cached } =
    useLoaderData<typeof loader>();
  if (cached) {
    console.log("Cached result found!");
  }
  const navigation = useNavigation();
  const [handle, setHandle] = useState(actor || "");
  const [currentError, setCurrentError] = useState<string | null>(null);

  useEffect(() => {
    setHandle(actor || "");
    setCurrentError(error || null);
  }, [actor, error]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="max-w-lg mx-auto flex flex-col">
              <Form
                method="get"
                action={`/${handle.startsWith("@") ? handle.slice(1) : handle}${
                  !handle.includes(".") ? ".bsky.social" : ""
                }`}
                className="flex flex-col sm:flex-row md:items-center gap-2"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    @
                  </span>
                  <Input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="border-primary border-2 transition-all hover:bg-white pl-8 h-12 w-full"
                    placeholder="Enter a Bluesky handle"
                  />
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={navigation.state !== "idle"}
                    className="flex items-center border-primary border-2 border-b-4 active:border-b-2 transition-all hover:bg-white w-fit h-12 justify-center px-4"
                  >
                    {navigation.state !== "idle" ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <ChartColumnIncreasing className="w-4 h-4" />
                        View Stats
                      </>
                    )}
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex items-center border-primary border-2 border-b-4 active:border-b-2 transition-all hover:bg-white w-fit h-12 justify-center"
                      >
                        <Share className="w-4 h-4" />
                        Share!
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="center"
                      className="text-center mx-auto"
                    >
                      <p>URL copied to clipboard!</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </Form>
            </div>
          </div>

          {currentError ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold text-red-800 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-red-600">{currentError}</p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
                Follower Stats for <br />
                <span className="text-primary text-2xl">{actor}</span>
              </h1>
              {Object.keys(followerStats).length === 0 &&
              Object.keys(followStats).length === 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                  <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
                    No Data Available
                  </h2>
                  <p className="text-yellow-700">
                    This account doesn&apos;t have any follower or following
                    history yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-sm space-y-8">
                    {cached && (
                      <div className="text-sm text-gray-500 text-center mb-4">
                        Showing cached data (updated within the last hour)
                      </div>
                    )}
                    <LineChartComponent
                      actor={actor}
                      followerStats={followerStats}
                      followStats={followStats}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 card">
                      <h3 className="text-lg font-semibold mb-4">
                        Followers by Month
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(followerStats).map(
                          ([yearMonth, stats]) => (
                            <div
                              key={yearMonth}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">{yearMonth}</span>
                              <div className="space-x-4">
                                <span className="font-medium">
                                  +{stats.change}
                                </span>
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
                      <h3 className="text-lg font-semibold mb-4">
                        Following by Month
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(followStats).map(
                          ([yearMonth, stats]) => (
                            <div
                              key={yearMonth}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">{yearMonth}</span>
                              <div className="space-x-4">
                                <span className="font-medium">
                                  +{stats.change}
                                </span>
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
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
