import {
  AppBskyGraphGetFollowers,
  AppBskyGraphGetFollows,
  BskyAgent,
} from "@atproto/api";

export async function getFollows(
  agent: BskyAgent,
  actor: string
): Promise<{ follows: AppBskyGraphGetFollows.Response["data"]["follows"] }> {
  let follows: AppBskyGraphGetFollows.Response["data"]["follows"] = [];
  let cursor: string | undefined;

  do {
    const response = await agent.app.bsky.graph.getFollows({
      actor,
      limit: 100,
      cursor,
    });

    follows = [...follows, ...response.data.follows];
    cursor = response.data.cursor;
  } while (cursor);

  return { follows };
}

export async function getFollowers(
  agent: BskyAgent,
  actor: string
): Promise<{
  followers: AppBskyGraphGetFollowers.Response["data"]["followers"];
}> {
  let followers: AppBskyGraphGetFollowers.Response["data"]["followers"] = [];
  let cursor: string | undefined;

  do {
    const response = await agent.app.bsky.graph.getFollowers({
      actor,
      limit: 100,
      cursor,
    });

    followers = [...followers, ...response.data.followers];
    cursor = response.data.cursor;
  } while (cursor);

  return { followers };
}
