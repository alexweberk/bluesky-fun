import { Link, useFetcher } from "@remix-run/react";
import { useState } from "react";

type LoaderData = {
  likesCount: number;
};

type HeaderProps = {
  likesCount?: number;
};

const navItems: { label: string; to: string }[] | null = null;

export default function Header({ likesCount = 0 }: HeaderProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const fetcher = useFetcher<LoaderData>();

  const handleLike = () => {
    if (!isLiked) {
      fetcher.submit({}, { method: "post" });
      setIsLiked(true);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b-2 border-black">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center"
            >
              <span className="text-xl font-bold text-primary">
                Bluesky Fun
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {navItems &&
              navItems.map((item) => (
                <Link
                  to={item.to}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}

            <div className="relative flex items-center gap-2">
              <button
                onClick={handleLike}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Like project"
                disabled={isLiked}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "fill-none text-gray-500"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {fetcher.data?.likesCount ?? likesCount}
              </span>
              {showThankYou && (
                <div className="absolute top-full right-0 mt-2 bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm animate-fade-in w-[120px]">
                  Thank you for all the likes!
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
