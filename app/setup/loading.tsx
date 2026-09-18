import { Skeleton } from "@/components/ui/skeleton";

export default function SetupLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-12 sm:px-6 sm:pt-10 lg:px-8"
      aria-busy="true"
      aria-label="Loading setup"
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-full max-w-md" />
      <Skeleton className="mt-8 h-[74px] w-full rounded-2xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Skeleton className="h-7 w-72" />
          <Skeleton className="mt-3 h-4 w-full max-w-lg" />
          <Skeleton className="mt-8 h-10 w-64" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden h-80 rounded-2xl lg:block" />
      </div>
    </div>
  );
}
