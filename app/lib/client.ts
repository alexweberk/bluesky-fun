import { BskyAgent } from "@atproto/api";

export const getAgent = async (env: Env) => {
  try {
    const agent = new BskyAgent({
      service: "https://bsky.social",
    });
    await agent.login({
      identifier: env.BLUESKY_USERNAME!,
      password: env.BLUESKY_PASSWORD!,
    });
    return agent;
  } catch (error: any) {
    if (error?.status === 429) {
      const resetTimestamp = error.headers["ratelimit-reset"] || "";
      const secondsUntilReset = Math.ceil(
        (parseInt(resetTimestamp, 10) * 1000 - Date.now()) / 1000
      );
      throw new Error(
        `Rate Limit Exceeded. Try again in ${Math.max(
          0,
          secondsUntilReset
        )} seconds`
      );
    }
    throw error;
  }
};
