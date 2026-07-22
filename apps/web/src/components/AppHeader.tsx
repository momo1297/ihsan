import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/training", label: "Training" },
  { href: "/progress", label: "Progress" },
];

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <nav className="flex items-center gap-6">
        <span className="text-sm font-medium uppercase tracking-wide text-text-tertiary">Ihsan</span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-body text-text-secondary hover:text-text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <UserButton />
    </header>
  );
}
