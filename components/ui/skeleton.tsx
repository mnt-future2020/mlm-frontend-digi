import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Reusable skeleton blocks for admin pages

function SkeletonHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}

function SkeletonStatsCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonStatsGrid({ cols = 4 }: { cols?: number }) {
  const gridClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[cols] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-4 mb-8", gridClass)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonStatsCard key={i} />
      ))}
    </div>
  );
}

function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-32" : i === cols - 1 ? "w-20" : "w-24")}
        />
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-4 p-4 border-b-2 border-border bg-muted/30">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 space-y-4", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function SkeletonSmallCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

function SkeletonTreeNode() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-36 h-24 rounded-lg" />
      <div className="w-0.5 h-6 bg-border" />
      <div className="flex gap-16">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-32 h-20 rounded-lg" />
          <div className="w-0.5 h-4 bg-border" />
          <div className="flex gap-8">
            <Skeleton className="w-28 h-16 rounded-lg" />
            <Skeleton className="w-28 h-16 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-32 h-20 rounded-lg" />
          <div className="w-0.5 h-4 bg-border" />
          <div className="flex gap-8">
            <Skeleton className="w-28 h-16 rounded-lg" />
            <Skeleton className="w-28 h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonSettingsSection() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <Skeleton className="h-6 w-48 mb-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonPlanCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

function SkeletonVideoCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

function SkeletonSplitView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left list */}
      <div className="lg:col-span-1 bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
      {/* Right detail */}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonHeader,
  SkeletonStatsCard,
  SkeletonStatsGrid,
  SkeletonTable,
  SkeletonTableRow,
  SkeletonCard,
  SkeletonSmallCard,
  SkeletonTreeNode,
  SkeletonSettingsSection,
  SkeletonPlanCard,
  SkeletonVideoCard,
  SkeletonListItem,
  SkeletonSplitView,
};
