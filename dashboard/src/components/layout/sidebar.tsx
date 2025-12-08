import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "API Keys", href: "#keys" },
  { label: "Plans", href: "#plans" },
  { label: "Logs", href: "#logs" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-background/80 p-4 shadow-sm md:flex">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          RL
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">
            Distributed Rate Limiter
          </div>
          <div className="text-xs text-muted-foreground">Admin Dashboard</div>
        </div>
      </div>

      <Separator className="mb-4" />

      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <div className="mb-1 font-semibold text-foreground">
          Current Environment
        </div>
        <div>Mode: <span className="font-medium">production</span></div>
        <div>Store: <span className="font-medium">Redis</span></div>
      </div>
    </aside>
  );
}
