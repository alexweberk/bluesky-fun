export default function Footer() {
  return (
    <footer
      className="py-4 text-center text-sm text-gray-500
    bg-[radial-gradient(#00000010_1px,_transparent_1px)] bg-[length:1rem_1rem]
    text-foreground antialiased border-black border-t-2"
    >
      <p className="flex items-center justify-center gap-4">
        <span>
          Made with ❤️ by{" "}
          <a
            href="https://bsky.app/profile/alexweberk.bsky.social"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            @alexweberk
          </a>
        </span>
        <span>•</span>
        <a
          href="https://buymeacoffee.com/alexweberk"
          target="_blank"
          rel="noreferrer"
          className="hover:text-primary transition-all "
        >
          Buy me coffee ☕️
        </a>
      </p>
    </footer>
  );
}
