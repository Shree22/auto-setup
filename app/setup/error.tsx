"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SetupError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">We couldn&apos;t load the setup</h1>
      <p className="mt-2 text-muted-foreground">
        The list of tools and frameworks didn&apos;t load. Check your connection and try again.
      </p>
      <div className="mt-8 flex gap-3">
        <Button type="button" size="lg" className="h-10 px-5" onClick={() => retry()}>
          <RotateCw data-icon="inline-start" /> Try again
        </Button>
        <Button asChild variant="outline" size="lg" className="h-10 px-5">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
