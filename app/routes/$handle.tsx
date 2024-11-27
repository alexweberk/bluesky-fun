import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ErrorMessageBox } from "~/components/ErrorMessageBox";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { LineChartComponent } from "~/components/LineChart";
import { SearchForm } from "~/components/SearchForm";
import StatsBox from "~/components/StatsBox";
import WarningMessageBox from "~/components/WarningMessageBox";
import { getCachedStats, setCachedStats } from "~/lib/cacheHandler";
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
  const cachedData = await getCachedStats(actor, env);
  if (cachedData) {
    return {
      actor,
      followerStats: cachedData.followerStats,
      followStats: cachedData.followStats,
      error: null,
      cached: true,
    } satisfies LoaderData;
  }

  // If no cache or cache is stale, fetch from API
  try {
    const agent = await getAgent(env);
    const { follows } = await getFollows(agent, actor);
    const { followers } = await getFollowers(agent, actor);

    const followerStats = groupByYearMonth(followers);
    const followStats = groupByYearMonth(follows);

    // Cache the new data
    await setCachedStats(actor, { followerStats, followStats }, env);

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

  const hasStats =
    Object.keys(followerStats).length > 0 ||
    Object.keys(followStats).length > 0;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Follower Stats for <br />
              <span className="text-primary text-2xl">
                <a
                  href={`https://bsky.app/profile/${actor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-3xl transition-all duration-300"
                >
                  {actor}
                </a>
              </span>
            </h1>
            <div className="max-w-lg mx-auto mb-8 flex flex-col">
              <SearchForm initialHandle={actor || ""} />
            </div>
            {error && <ErrorMessageBox error={error} />}
            {!error && !hasStats && <WarningMessageBox />}

            {hasStats && (
              <div id="statsArea">
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
                  <StatsBox
                    title="Following by Month"
                    stats={followStats}
                  />
                  <StatsBox
                    title="Followers by Month"
                    stats={followerStats}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
