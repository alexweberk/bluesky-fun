import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { ExternalLink } from "lucide-react";
import { ErrorMessageBox } from "~/components/ErrorMessageBox";
import { LineChartComponent } from "~/components/LineChart";
import { SearchForm } from "~/components/SearchForm";
import StatsBox from "~/components/StatsBox";
import { Button } from "~/components/ui/button";
import WarningMessageBox from "~/components/WarningMessageBox";
import {
  clearCacheForActor,
  getCachedStats,
  setCachedStats,
} from "~/lib/cacheHandler";
import { getAgent } from "~/lib/client";
import { getFollowers, getFollows } from "~/lib/follows";
import {
  groupByYearMonth,
  groupByYearMonthDay,
  groupByYearMonthWeek,
  type TimeAggregatedData,
} from "~/lib/timeAggUtils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.actor || "User"} | Bluesky Fun` },
    {
      name: "description",
      content: `Follower and following stats for ${
        data?.actor || "user"
      } on Bluesky.`,
    },
    {
      property: "og:title",
      content: "Bluesky Fun - Track Your Growth on Bluesky",
    },
    {
      property: "og:description",
      content:
        "Get detailed insights into your follower and following trends over time. See how your Bluesky presence has evolved.",
    },
  ];
};

interface LoaderData {
  actor: string;
  error: string | null;
  followerStats: TimeAggregatedData;
  followStats: TimeAggregatedData;
  weeklyFollowerStats: TimeAggregatedData;
  weeklyFollowStats: TimeAggregatedData;
  dailyFollowerStats: TimeAggregatedData;
  dailyFollowStats: TimeAggregatedData;
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
      weeklyFollowerStats: {},
      weeklyFollowStats: {},
      dailyFollowerStats: {},
      dailyFollowStats: {},
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
      weeklyFollowerStats: cachedData.weeklyFollowerStats,
      weeklyFollowStats: cachedData.weeklyFollowStats,
      dailyFollowerStats: cachedData.dailyFollowerStats,
      dailyFollowStats: cachedData.dailyFollowStats,
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
    const weeklyFollowerStats = groupByYearMonthWeek(followers);
    const weeklyFollowStats = groupByYearMonthWeek(follows);
    const dailyFollowerStats = groupByYearMonthDay(followers);
    const dailyFollowStats = groupByYearMonthDay(follows);

    // Cache the new data
    await setCachedStats(
      actor,
      {
        followerStats,
        followStats,
        weeklyFollowerStats,
        weeklyFollowStats,
        dailyFollowerStats,
        dailyFollowStats,
      },
      env
    );

    return {
      actor,
      followerStats,
      followStats,
      weeklyFollowerStats,
      weeklyFollowStats,
      dailyFollowerStats,
      dailyFollowStats,
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
      weeklyFollowerStats: {},
      weeklyFollowStats: {},
      dailyFollowerStats: {},
      dailyFollowStats: {},
      cached: false,
    } satisfies LoaderData;
  }
};

export async function action({ request, params, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const actor = params.handle;

  if (!actor) {
    throw new Error("No actor provided");
  }

  if (intent === "clear-cache") {
    await clearCacheForActor(actor, context.cloudflare.env);
    // Redirect to the same page to refresh data
    return redirect(`/${actor}`);
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export default function UserStats() {
  const {
    actor,
    followerStats,
    followStats,
    weeklyFollowerStats,
    weeklyFollowStats,
    dailyFollowerStats,
    dailyFollowStats,
    error,
    cached,
  } = useLoaderData<typeof loader>();

  const hasStats =
    Object.keys(followerStats).length > 0 ||
    Object.keys(followStats).length > 0;

  return (
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
                <ExternalLink className="w-4 h-4 ml-2 inline" />
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
                <div className="flex justify-between items-center px-4">
                  {cached && (
                    <div className="text-sm text-gray-500">
                      Showing cached data (updated within the last hour)
                    </div>
                  )}
                  {cached && (
                    <Form method="post">
                      <Button
                        type="submit"
                        name="intent"
                        value="clear-cache"
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Clear Cache
                      </Button>
                    </Form>
                  )}
                </div>
                <LineChartComponent
                  actor={actor}
                  followerStats={followerStats}
                  followStats={followStats}
                  weeklyFollowerStats={weeklyFollowerStats}
                  weeklyFollowStats={weeklyFollowStats}
                  dailyFollowerStats={dailyFollowerStats}
                  dailyFollowStats={dailyFollowStats}
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
  );
}
