import Link from "next/link";
import { X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SetupHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo href="/" />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="ghost" size="lg" className="h-9 px-3 text-muted-foreground">
            <Link href="/">
              <X data-icon="inline-start" />
              <span className="hidden sm:inline">Exit setup</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
