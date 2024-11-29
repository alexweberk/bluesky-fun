import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import Header from "~/components/Header";
import { getLikesCount, incrementLikes } from "~/lib/cacheHandler";

import Footer from "./components/Footer";
import "./globals.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Bluesky Stats" },
    {
      name: "description",
      content:
        "Get detailed insights into your follower and following trends over time",
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
    {
      property: "og:image",
      content: "https://bluesky-fun.pages.dev/BlueskyFun.png",
    },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Mochiy+Pop+P+One&family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP:wght@200..900&display=swap",
  },
];

export const loader: LoaderFunction = async ({ context }) => {
  const { env } = context.cloudflare;
  const likesCount = await getLikesCount(env);
  return json({ likesCount });
};

export const action: ActionFunction = async ({ context }) => {
  const { env } = context.cloudflare;
  const newCount = await incrementLikes(env);
  return json({ likesCount: newCount });
};

export default function App() {
  const { likesCount } = useLoaderData<{ likesCount: number }>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Header likesCount={likesCount} />
        <Outlet />
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
