import { Form, useNavigation } from "@remix-run/react";
import { ChartColumnIncreasing, Loader2, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface SearchFormProps {
  initialHandle?: string;
}

export function SearchForm({ initialHandle = "" }: SearchFormProps) {
  const navigation = useNavigation();
  const [handle, setHandle] = useState(initialHandle);

  useEffect(() => {
    setHandle(initialHandle);
  }, [initialHandle]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
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
  );
}
