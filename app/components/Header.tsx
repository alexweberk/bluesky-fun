import { Link } from "@remix-run/react";

// const navItems = [
//   { label: "About", to: "#about" },
//   { label: "Projects", to: "#projects" },
//   { label: "Contact", to: "#contact" },
// ];

const navItems: { label: string; to: string }[] | null = null;

export default function Header() {
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
                Bluesky Stats
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
          </nav>
        </div>
      </div>
    </header>
  );
}
