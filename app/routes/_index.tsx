import type { MetaFunction } from "@remix-run/cloudflare";
import { Form, useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

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

export default function Index() {
  const [handle, setHandle] = useState("");
  const navigation = useNavigation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4">
        <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">
            Track Your <br />
            <span className="text-primary">Bluesky</span> Growth
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Get detailed insights into your follower and following trends over
            time. See how your Bluesky presence has evolved.
          </p>

          <div className="w-full max-w-md">
            <Form
              method="get"
              action={`/${handle.startsWith("@") ? handle.slice(1) : handle}${
                !handle.includes(".") ? ".bsky.social" : ""
              }`}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  @
                </span>
                <Input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="border-primary border-2 transition-all hover:bg-white pl-8 h-12"
                  placeholder="What's your Bluesky handle?"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={navigation.state !== "idle"}
                className="flex items-center border-primary border-2 border-b-4 active:border-b-2 transition-all hover:bg-white h-12 justify-center px-8"
              >
                {navigation.state !== "idle" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "View Stats"
                )}
              </Button>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
